# VaidyaSetu — Fine-Tune Verification SLM on Kaggle
# ===================================================
# Run this in a Kaggle Notebook with GPU T4 x2 enabled
# (Settings → Accelerator → GPU T4 x2)
#
# This fine-tunes Qwen2.5-1.5B-Instruct on the citation-verification task:
# "Does this source passage support this claim? → yes/no/unsure"

# ============================================================
# CELL 1: Install Dependencies
# ============================================================
# !pip install -q transformers peft bitsandbytes accelerate datasets trl

# ============================================================
# CELL 2: Upload Your chunks.jsonl
# ============================================================
# Upload your backend/data/chunks.jsonl to Kaggle
# (Add Data → Upload → select chunks.jsonl)
# Or if you have it in a Kaggle dataset:
# CHUNKS_PATH = "/kaggle/input/your-dataset/chunks.jsonl"

CHUNKS_PATH = "/kaggle/input/ipr-dataset/chunks.jsonl"  # Update this path

# ============================================================
# CELL 3: Generate Training Data from Your Corpus
# ============================================================
import json
import random

def load_chunks(path):
    chunks = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                chunks.append(json.loads(line))
    return chunks

def generate_training_examples(chunks, num_positive=300, num_negative=300):
    """
    Creates training examples for the verification task.
    Positive: claim text matches the source chunk (supported)
    Negative: claim text is from a DIFFERENT chunk (not_supported)
    """
    examples = []

    # Positive examples: first sentence of a chunk IS supported by that chunk
    sampled = random.sample(chunks, min(num_positive, len(chunks)))
    for chunk in sampled:
        text = chunk["text"].strip()
        sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 30]
        if not sentences:
            continue
        claim = sentences[0] + "."
        examples.append({
            "claim": claim,
            "source_text": text[:500],
            "source_doc": chunk.get("document", "Unknown"),
            "source_label": chunk.get("clause_label", "Unknown"),
            "verdict": "supported",
            "reason": "The claim is directly stated in the source passage."
        })

    # Negative examples: claim from one chunk, source from a DIFFERENT chunk
    for _ in range(num_negative):
        c1, c2 = random.sample(chunks, 2)
        text1 = c1["text"].strip()
        text2 = c2["text"].strip()
        sentences = [s.strip() for s in text1.split(".") if len(s.strip()) > 30]
        if not sentences:
            continue
        claim = sentences[0] + "."
        examples.append({
            "claim": claim,
            "source_text": text2[:500],
            "source_doc": c2.get("document", "Unknown"),
            "source_label": c2.get("clause_label", "Unknown"),
            "verdict": "not_supported",
            "reason": "The source passage discusses a different topic and does not support this claim."
        })

    random.shuffle(examples)
    return examples

chunks = load_chunks(CHUNKS_PATH)
print(f"Loaded {len(chunks)} chunks")

training_data = generate_training_examples(chunks, num_positive=400, num_negative=400)
print(f"Generated {len(training_data)} training examples")

# Save for inspection
with open("/kaggle/working/verification_training_data.json", "w") as f:
    json.dump(training_data, f, indent=2, ensure_ascii=False)

# ============================================================
# CELL 4: Format Data for Training
# ============================================================
from datasets import Dataset

SYSTEM_PROMPT = """You are a strict fact-checker. You will be given exactly one CLAIM and one SOURCE PASSAGE. Decide whether the SOURCE PASSAGE actually supports the CLAIM as written -- not just related to the same topic, but truly supports it.
Respond with ONLY valid JSON: {"verdict": "supported" | "not_supported" | "unsure", "reason": "..."}"""

def format_for_training(example):
    user_msg = f"""CLAIM:
{example['claim']}

SOURCE PASSAGE ({example['source_doc']}, {example['source_label']}):
{example['source_text']}"""

    assistant_msg = json.dumps({
        "verdict": example["verdict"],
        "reason": example["reason"]
    })

    text = f"""<|im_start|>system
{SYSTEM_PROMPT}<|im_end|>
<|im_start|>user
{user_msg}<|im_end|>
<|im_start|>assistant
{assistant_msg}<|im_end|>"""

    return {"text": text}

formatted = [format_for_training(ex) for ex in training_data]
dataset = Dataset.from_list(formatted)

# Split into train/eval
split = dataset.train_test_split(test_size=0.1, seed=42)
train_dataset = split["train"]
eval_dataset = split["test"]

print(f"Train: {len(train_dataset)}, Eval: {len(eval_dataset)}")
print("\nSample:")
print(train_dataset[0]["text"][:500])

# ============================================================
# CELL 5: Load Base Model with QLoRA
# ============================================================
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)

model = prepare_model_for_kbit_training(model)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# ============================================================
# CELL 6: Train
# ============================================================
from trl import SFTTrainer
from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="/kaggle/working/vaidyasetu-verifier",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    warmup_steps=50,
    logging_steps=25,
    save_steps=100,
    eval_strategy="steps",
    eval_steps=100,
    fp16=True,
    optim="paged_adamw_8bit",
    report_to="none",
)

trainer = SFTTrainer(
    model=model,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    args=training_args,
    tokenizer=tokenizer,
    max_seq_length=1024,
)

print("Starting training...")
trainer.train()
print("Training complete!")

# ============================================================
# CELL 7: Save the Fine-Tuned Adapter
# ============================================================
ADAPTER_PATH = "/kaggle/working/vaidyasetu-verifier-adapter"
model.save_pretrained(ADAPTER_PATH)
tokenizer.save_pretrained(ADAPTER_PATH)
print(f"Adapter saved to {ADAPTER_PATH}")

# ============================================================
# CELL 8: Quick Evaluation
# ============================================================
from peft import PeftModel

# Reload for inference
base_model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)
finetuned_model = PeftModel.from_pretrained(base_model, ADAPTER_PATH)
finetuned_model.eval()

def test_verification(claim, source_text, source_doc="Test Doc", source_label="Section 1"):
    prompt = f"""<|im_start|>system
{SYSTEM_PROMPT}<|im_end|>
<|im_start|>user
CLAIM:
{claim}

SOURCE PASSAGE ({source_doc}, {source_label}):
{source_text}<|im_end|>
<|im_start|>assistant
"""
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = finetuned_model.generate(**inputs, max_new_tokens=150, temperature=0.1)
    response = tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)
    print(f"Claim: {claim[:80]}...")
    print(f"Result: {response}")
    print()
    return response

# Test with a supported claim
test_verification(
    claim="Section 3(p) bars patents on traditional knowledge.",
    source_text="Section 3(p) states that an invention which is traditional knowledge or an aggregation or duplication of known properties is not patentable.",
)

# Test with an unsupported claim
test_verification(
    claim="FSSAI regulates patent filing for herbal products.",
    source_text="The Biological Diversity Act 2002 requires prior approval from the National Biodiversity Authority for access to biological resources.",
)

print("Evaluation complete!")

# ============================================================
# CELL 9: Download the Adapter
# ============================================================
# After training, download the adapter folder from:
# /kaggle/working/vaidyasetu-verifier-adapter/
#
# It contains:
#   - adapter_config.json
#   - adapter_model.safetensors
#
# Place these files in your local project at:
#   backend/ml_engine/models/verifier/
#
# Then load locally with:
#   from peft import PeftModel
#   base = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-1.5B-Instruct")
#   model = PeftModel.from_pretrained(base, "backend/ml_engine/models/verifier/")
