# QLoRA SLM Fine-Tuning Guide

VaidyaSetu uses an LLM (like Gemini or Qwen2.5-72B) for complex synthesis. However, for the **Verification Step** (Step 10 in the Reasoning Chain), we verify every single claim to see if it is strictly supported by the cited context. 

Because this is a massive number of calls (1 API call per claim), we have built the capability to fine-tune a tiny, hyper-efficient Small Language Model (SLM) locally using Kaggle GPUs.

## The Verification Task

**Input:**
```text
CLAIM: "FSSAI regulates patent filing for herbal products."
SOURCE PASSAGE (Biological Diversity Act, Section 3): "The Biological Diversity Act 2002 requires prior approval from the National Biodiversity Authority for access to biological resources."
```

**Output:**
```json
{"verdict": "not_supported", "reason": "The source discusses biodiversity access, not FSSAI patent filing."}
```

## How to Fine-Tune the SLM

We use `Qwen/Qwen2.5-1.5B-Instruct` as our base SLM. Because it's only 1.5B parameters, it runs extremely fast on cheap hardware, but off-the-shelf it isn't great at strict JSON outputs. We fix this via QLoRA fine-tuning.

### Step 1: Prepare Kaggle
1. Create a new notebook on Kaggle.
2. Go to Notebook Options -> Settings -> **Accelerator: GPU T4 x2**.

### Step 2: Upload Data & Code
1. Upload your `backend/data/chunks.jsonl` as a Kaggle dataset.
2. Copy the entire contents of the `finetune_verifier_kaggle.py` script provided during the project setup into Kaggle cells.

### Step 3: Run the Pipeline
The Kaggle notebook will automatically:
1. Parse your `chunks.jsonl` to create 800 synthetic positive and negative verification examples.
2. Load `Qwen2.5-1.5B-Instruct` in 4-bit precision.
3. Attach LoRA adapters to all attention and feed-forward layers (`q_proj`, `k_proj`, `v_proj`, `o_proj`).
4. Train for 3 epochs using `SFTTrainer` (takes ~35 minutes).

### Step 4: Download and Deploy
1. In the Kaggle output, download the folder `/kaggle/working/vaidyasetu-verifier-adapter/`.
2. Move this folder locally to your project at `backend/ml_engine/models/verifier/`.
3. In `verification.py`, you can now load this adapter instead of calling the external LLM API, achieving 10x faster verification speeds.
