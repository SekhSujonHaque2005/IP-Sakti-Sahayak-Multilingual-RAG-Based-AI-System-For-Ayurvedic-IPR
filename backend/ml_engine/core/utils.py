import json
import re

def clean_and_parse_json(text: str) -> dict:
    """
    Strips markdown code blocks (```json ... ```) from LLM output
    and parses the inner content as JSON.
    """
    text = text.strip()
    if text.startswith('```'):
        text = re.sub(r'^```(?:json)?', '', text)
        text = re.sub(r'```$', '', text)
        text = text.strip()
        
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback to searching for a JSON object in the string
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        raise ValueError("Could not parse valid JSON from LLM response")
