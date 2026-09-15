import os
import google.generativeai as genai
from sqlalchemy.orm import Session
from app.db.models import ConversationSummary

# Initialize Gemini for summarization (Background Worker)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_conversation_background(conversation_id: str, old_messages: list, db: Session):
    """
    Background Task: Summarizes a block of old messages to compress the context window.
    This exactly mimics ChatGPT's memory compression technique.
    """
    if not old_messages:
        return
        
    model = genai.GenerativeModel("gemini-pro")
    
    # Format messages for the LLM
    text_block = "\n".join([f"{m.role}: {m.content}" for m in old_messages])
    
    prompt = f"""
    You are an AI tasked with compressing conversation history for a Legal/Medical assistant.
    Summarize the following chat history into a concise 3-sentence summary that captures all important facts, legal references, and user intent. 
    This summary will be injected into future prompts to retain memory without wasting tokens.
    
    Chat History:
    {text_block}
    
    Summary:
    """
    
    try:
        response = model.generate_content(prompt)
        new_summary_text = response.text
        
        # Check if summary already exists for this conversation
        existing_summary = db.query(ConversationSummary).filter(ConversationSummary.conversation_id == conversation_id).first()
        
        if existing_summary:
            # We append or merge the new summary with the old one
            merged_prompt = f"Merge these two summaries into one cohesive 4-sentence summary:\n1. {existing_summary.summary_text}\n2. {new_summary_text}"
            merged_response = model.generate_content(merged_prompt)
            existing_summary.summary_text = merged_response.text
        else:
            # Create a new summary
            new_summary = ConversationSummary(
                conversation_id=conversation_id,
                summary_text=new_summary_text
            )
            db.add(new_summary)
            
        db.commit()
        print(f"[Summarizer] Successfully compressed {len(old_messages)} messages for conversation {conversation_id}.")
        
    except Exception as e:
        print(f"[Summarizer] Failed to summarize conversation {conversation_id}: {e}")
        db.rollback()
