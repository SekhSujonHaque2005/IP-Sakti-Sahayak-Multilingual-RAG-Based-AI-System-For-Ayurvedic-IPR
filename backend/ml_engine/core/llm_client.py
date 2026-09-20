import os
import google.generativeai as genai
from huggingface_hub import InferenceClient
from tenacity import retry, stop_after_attempt, wait_exponential
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
if HF_API_TOKEN:
    os.environ["HF_TOKEN"] = HF_API_TOKEN
hf_client = InferenceClient(token=HF_API_TOKEN) if HF_API_TOKEN else None

from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception

def is_retryable_gemini_error(exc: BaseException) -> bool:
    # Don't retry on invalid API key or bad arguments
    msg = str(exc).lower()
    if "api key not valid" in msg or "api_key_invalid" in msg or "invalidargument" in msg:
        return False
    return True

def is_retryable_hf_error(exc: BaseException) -> bool:
    msg = str(exc).lower()
    if "402" in msg or "payment required" in msg or "depleted" in msg or "not supported" in msg:
        return False
    return True

class LLMClient:
    def __init__(self, gemini_model="gemini-1.5-flash", hf_model="Qwen/Qwen2.5-72B-Instruct"):
        """
        Initializes the Multi-Provider Fallback Client.
        Primary: Gemini (fast, cheap/free tier)
        Fallback: Hugging Face Inference API (handles rate limits)
        """
        self.gemini_model = gemini_model
        self.hf_model = hf_model
        self.gemini_disabled = False
        self.hf_disabled = False
        if not GEMINI_API_KEY or GEMINI_API_KEY.startswith("AQ."):
            # Keys starting with AQ. are not valid Google AI Studio keys (must start with AIza)
            print("[LLMClient] GEMINI_API_KEY is invalid/missing. Routing directly to Hugging Face.")
            self.gemini_disabled = True

    @retry(
        retry=retry_if_exception(is_retryable_gemini_error),
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=3)
    )
    def _call_gemini(self, system: str, user: str) -> str:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set.")
        model = genai.GenerativeModel(
            model_name=self.gemini_model,
            system_instruction=system
        )
        response = model.generate_content(
            user,
            generation_config=genai.types.GenerationConfig(temperature=0.0)
        )
        return response.text

    @retry(
        retry=retry_if_exception(is_retryable_hf_error),
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=2)
    )
    def _call_hf(self, system: str, user: str) -> str:
        import time
        now = time.time()
        if not hf_client:
            raise ValueError("HF Inference is disabled: no token configured.")
        if hasattr(self, 'hf_cooldown_until') and now < self.hf_cooldown_until:
            raise ValueError(f"HF Inference in temporary cooldown ({round(self.hf_cooldown_until - now)}s remaining).")

        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ]
        
        try:
            response = hf_client.chat_completion(
                model=self.hf_model,
                messages=messages,
                max_tokens=1500,
                temperature=0.01
            )
            return response.choices[0].message.content
        except Exception as e:
            msg = str(e).lower()
            if "402" in msg or "payment required" in msg or "depleted" in msg or "429" in msg or "rate limit" in msg:
                print(f"[LLMClient] HF rate limit/quota notice ({e}). Setting 15s cooldown.")
                self.hf_cooldown_until = time.time() + 15
            raise e

    def complete(self, system: str, user: str) -> str:
        """
        Attempts to call the primary model (Gemini).
        If it encounters a quota, rate limit, or API error, automatically falls back to HF.
        """
        if not self.gemini_disabled:
            try:
                return self._call_gemini(system, user)
            except Exception as e:
                msg = str(e).lower()
                if "api key not valid" in msg or "api_key_invalid" in msg:
                    print("[LLMClient] Disabling Gemini due to invalid API key. Using Hugging Face.")
                    self.gemini_disabled = True
                print(f"Gemini API failed ({e}). Falling back to Hugging Face API ({self.hf_model})...")
        
        return self._call_hf(system, user)


    def complete_stream(self, system: str, user: str):
        """
        Streaming version of the generator. Yields text chunks as they arrive.
        Falls back to non-streaming HF if Gemini fails.
        """
        if not self.gemini_disabled and GEMINI_API_KEY:
            try:
                model = genai.GenerativeModel(
                    model_name=self.gemini_model,
                    system_instruction=system
                )
                response = model.generate_content(
                    user,
                    generation_config=genai.types.GenerationConfig(temperature=0.0),
                    stream=True
                )
                for chunk in response:
                    if chunk.text:
                        yield chunk.text
                return
            except Exception as e:
                print(f"Gemini streaming failed: {e}. Falling back to HF...")
                self.gemini_disabled = True
        
        # Hugging Face fallback (chunked output)
        text = self._call_hf(system, user)
        # Yield in small words/tokens for streaming effect
        words = text.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
