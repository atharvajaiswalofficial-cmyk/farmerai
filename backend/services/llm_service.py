import os
import json
import logging
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

from config import GEMINI_API_KEY, GEMINI_MODEL, AI_API_KEY, AI_MODEL, AI_BASE_URL
from services.intent_service import classify_query, detect_language
from services.knowledge_service import get_curated_answer
from services.rag_service import build_rag_context

logger = logging.getLogger("sahayak.llm")

SYSTEM_PROMPT = """You are Sahayak AI (सहायक AI), a grounded, factual agricultural and cooperative intelligence assistant for Indian farmers, Primary Agricultural Credit Societies (PACS), and rural community members.
Answer using ONLY the verified context provided to you.
Do not invent government schemes, deadlines, premium rates, or legal rules.
Always answer in the requested language (English or Hindi).
Provide direct, concise, practical, and farmer-friendly guidance."""

_gemini_client = None
_last_gemini_key = None
_openai_client = None
_last_openai_key = None

def get_gemini_client():
    """Initialize official Google GenAI SDK client dynamically from environment."""
    global _gemini_client, _last_gemini_key
    load_dotenv(override=False)
    api_key = os.getenv("GEMINI_API_KEY", "").strip() or GEMINI_API_KEY.strip()
    if not api_key:
        return None
    if _gemini_client is not None and _last_gemini_key == api_key:
        return _gemini_client
    try:
        from google import genai
        _gemini_client = genai.Client(api_key=api_key)
        _last_gemini_key = api_key
        return _gemini_client
    except Exception as e:
        logger.warning("Could not initialize google-genai client: %s", str(e))
        return None

def get_openai_client():
    """Initialize OpenAI SDK client as fallback (singleton)."""
    global _openai_client, _last_openai_key
    load_dotenv(override=False)
    api_key = os.getenv("OPENAI_API_KEY", "").strip() or os.getenv("AI_API_KEY", "").strip() or AI_API_KEY.strip()
    if not api_key:
        return None
    if _openai_client is not None and _last_openai_key == api_key:
        return _openai_client
    try:
        from openai import OpenAI
        base_url = os.getenv("AI_BASE_URL", "").strip() or AI_BASE_URL
        _openai_client = OpenAI(api_key=api_key, base_url=base_url if base_url else None)
        _last_openai_key = api_key
        return _openai_client
    except Exception as e:
        logger.warning("Could not initialize OpenAI fallback client: %s", str(e))
        return None

def call_gemini_sdk(prompt: str) -> Optional[str]:
    """Call Gemini using official google-genai SDK."""
    client = get_gemini_client()
    if not client:
        return None

    # Supported model fallbacks
    configured_model = os.getenv("GEMINI_MODEL", "").strip() or GEMINI_MODEL or "gemini-2.5-flash"
    candidate_models = [configured_model, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-pro"]
    # De-duplicate while preserving order
    seen = set()
    models_to_try = [m for m in candidate_models if not (m in seen or seen.add(m))]

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            answer = getattr(response, "text", None)
            if answer and answer.strip():
                return answer.strip()
        except Exception as e:
            logger.warning("Gemini model '%s' error: %s", model_name, str(e))
            continue
    return None

def call_openai_sdk(prompt: str) -> Optional[str]:
    """Call OpenAI/GPT API as fallback when Gemini is unavailable."""
    client = get_openai_client()
    if not client:
        return None

    model_name = os.getenv("OPENAI_MODEL", "").strip() or os.getenv("AI_MODEL", "").strip() or AI_MODEL or "gpt-4o-mini"
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=800
        )
        if response.choices and response.choices[0].message.content:
            return response.choices[0].message.content.strip()
    except Exception as e:
        logger.warning("OpenAI API fallback error: %s", str(e))
    return None

def build_user_prompt(context_text: str, question: str, language: str = "en") -> str:
    """Format structured user prompt for LLM generation."""
    lang_label = "Hindi (hi)" if language == "hi" else f"{language.upper()} (code: {language})"
    return f"Verified Context:\n{context_text}\n\nUser Question:\n{question}\n\nRequested Language:\n{lang_label}"

def call_gemini(system_prompt: str, user_prompt: str) -> Optional[str]:
    """Compatibility wrapper for Gemini calls."""
    return call_gemini_sdk(f"{system_prompt}\n\n{user_prompt}")

def call_llm(prompt: str) -> Optional[str]:
    """Compatibility wrapper for LLM calls."""
    return call_gemini_sdk(prompt) or call_openai_sdk(prompt)


def get_ai_answer_detailed(
    question: str, 
    retrieved_context: str = "", 
    language: str = "en",
    input_mode: str = "text",
    conversation_history: str = ""
) -> tuple[str, bool]:
    """
    Central LLM function returning (answer_text, is_ai_generated).
    """
    if not question or not question.strip():
        return ("Please ask a question about agricultural schemes, crop insurance, PACS services, or financial credit.", False)

    lang_desc = "Hindi (हिंदी)" if language == "hi" else f"{language.upper()} language"
    context_section = f"\nOFFICIAL VERIFIED CONTEXT:\n{retrieved_context}\n" if retrieved_context else "\n(No specific official document chunk retrieved for this query. Use general verified knowledge with anti-hallucination rules.)\n"
    history_section = f"\nRECENT CONVERSATION HISTORY:\n{conversation_history}\n" if conversation_history else ""

    voice_instructions = ""
    if input_mode == "voice":
        voice_instructions = """
VOICE MODE INSTRUCTIONS:
- You are speaking aloud directly to an Indian farmer.
- Keep your response clear, warm, friendly, natural, and conversational.
- Aim for 2-4 clear sentences.
- Do NOT use markdown symbols like ##, **, bullet points (-), or URLs in your answer.
- Speak naturally so the Text-to-Speech engine sounds like a real assistant.
"""

    prompt = f"""{SYSTEM_PROMPT}

Language Requested: Respond ONLY in {lang_desc}.
{history_section}{context_section}
USER QUESTION:
{question}

Instructions:
- Provide a direct, well-structured, easy-to-read answer in {lang_desc}.
- If official context is supplied, base the answer on it.
- Keep numbers, portal names, and deadlines factually accurate.{voice_instructions}
"""

    # 1. Try calling LLM (Gemini SDK -> OpenAI SDK -> Mocks)
    llm_reply = call_llm(prompt)
    if llm_reply and len(llm_reply.strip()) > 10:
        return (llm_reply.strip(), True)

    # 2. Deterministic Curated Knowledge Fallback
    classification = classify_query(question)
    curated = get_curated_answer(classification.get("topic", "General"), question, language)
    if curated and curated.get("answer"):
        return (curated["answer"].strip(), False)

    # 4. Ultimate Safe Guardrail
    if language == "hi":
        return ("हम आधिकारिक डेटाबेस में इस विषय की पुष्टि करने में असमर्थ हैं। कृपया पीएम फसल बीमा योजना, पीएम-किसान, पैक्स खाद, या केसीसी ऋण से संबंधित प्रश्न पूछें।", False)
    return ("I could not verify this information from the available official government sources. Please ask regarding PMFBY crop insurance, PM-KISAN, PACS fertilizer, or KCC loans.", False)

def get_ai_answer(question: str, retrieved_context: str = "", language: str = "en") -> str:
    """
    Central LLM function for generating grounded answers.
    """
    answer, _ = get_ai_answer_detailed(question, retrieved_context, language)
    return answer

def is_llm_configured() -> bool:
    """Check if any LLM API key (Gemini or OpenAI) is configured."""
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip() or GEMINI_API_KEY.strip()
    ai_key = os.getenv("AI_API_KEY", "").strip() or os.getenv("OPENAI_API_KEY", "").strip() or AI_API_KEY.strip()
    return bool(gemini_key or ai_key)

def generate_grounded_answer(query: str, language: str = "en", input_mode: str = "text", user_id: int = None, conversation_id: str = "default") -> Dict[str, Any]:
    """
    Complete end-to-end grounded query synthesis.
    Integrates query classification, multilingual RAG, Gemini / LLM, and sources.
    """
    auto_lang = detect_language(query)
    if language and language != "en":
        detected_lang = language
    elif auto_lang != "en":
        detected_lang = auto_lang
    else:
        detected_lang = language or "en"

    classification = classify_query(query)
    topic = classification.get("topic", "General")
    intent = classification.get("intent", "GENERAL_AGRICULTURE")
    
    # Retrieve RAG context
    rag_ctx = build_rag_context(query)
    has_context = rag_ctx.get("has_context", False)
    sources = rag_ctx.get("sources", [])
    context_text = rag_ctx.get("context_text", "")

    # Retrieve recent conversation context for follow-up questions
    conv_history_str = ""
    try:
        from database import get_chat_history
        recent_chats = get_chat_history(user_id=user_id, limit=2, conversation_id=conversation_id)
        if recent_chats:
            turns = []
            for c in reversed(recent_chats):
                turns.append(f"User: {c.get('question')}\nAssistant: {c.get('answer')}")
            conv_history_str = "\n".join(turns)
    except Exception as e:
        logger.debug("Could not fetch conversation history context: %s", e)

    # Generate answer via centralized AI pipeline
    ai_answer, was_ai_generated = get_ai_answer_detailed(
        question=query,
        retrieved_context=context_text if has_context else "",
        language=detected_lang,
        input_mode=input_mode,
        conversation_history=conv_history_str
    )


    # Determine primary source attribution
    if sources:
        primary_source = sources[0].get("source", sources[0].get("title", "Official Guidelines"))
        is_grounded = True
    else:
        curated = get_curated_answer(topic, query, detected_lang)
        primary_source = curated.get("source", "Official Guidelines")
        is_grounded = curated.get("grounded", True)
        if not sources and curated.get("sources"):
            sources = curated.get("sources", [])

    # Suggested follow-up actions
    suggested_actions = []
    if "pmfby" in topic.lower() or "crop" in topic.lower():
        suggested_actions = ["Check 72h loss deadline", "Call PMFBY helpline 14447", "Find claim documents"]
    elif "pacs" in topic.lower() or "fertilizer" in topic.lower():
        suggested_actions = ["View Urea ₹266.50 MRP rules", "Check e-POS biometric guidelines", "Locate nearest PACS"]
    elif "kcc" in topic.lower() or "credit" in topic.lower():
        suggested_actions = ["Calculate 4% KCC interest", "Check collateral-free limit", "Apply on JanSamarth"]

    return {
        "success": True,
        "answer": ai_answer,
        "language": detected_lang,
        "input_mode": input_mode,
        "topic": topic,
        "intent": intent,
        "source": primary_source,
        "grounded": is_grounded,
        "ai_generated": was_ai_generated,
        "sources": sources,
        "suggested_actions": suggested_actions
    }
