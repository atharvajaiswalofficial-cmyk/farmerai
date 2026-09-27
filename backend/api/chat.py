import logging
from fastapi import APIRouter, Depends
from schemas import ChatRequest, ChatResponse
from services.llm_service import generate_grounded_answer
from services.voice_service import synthesize_audio_url
from services.auth_service import get_current_user_optional
from database import save_chat, get_chat_history, clear_chat_history

logger = logging.getLogger("sahayak.chat")
router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

@router.post("", response_model=ChatResponse)
def post_chat_route(req: ChatRequest, current_user: dict = Depends(get_current_user_optional)):
    user_id = current_user["id"] if current_user else (req.user_id or 1)
    conv_id = req.conversation_id or "default"
    input_mode = req.input_mode or "text"

    if input_mode == "voice":
        logger.info("[VOICE] Transcript received: '%s'", req.message)

    grounded_res = generate_grounded_answer(
        query=req.message,
        language=req.language,
        input_mode=input_mode,
        user_id=user_id,
        conversation_id=conv_id
    )

    if input_mode == "voice":
        logger.info("[VOICE] Language: %s", grounded_res.get("language", req.language))

    logger.info("[RAG] Retrieved %d source documents", len(grounded_res.get("sources", [])))
    logger.info("[GEMINI] Response generated: '%s...'", grounded_res.get("answer", "")[:80])

    # Synthesize audio if voice input mode
    audio_url = None
    if input_mode == "voice" and grounded_res.get("answer"):
        try:
            tts_lang = grounded_res.get("language", req.language)
            logger.info("[TTS] Generating %s audio response...", tts_lang)
            audio_url = synthesize_audio_url(grounded_res["answer"], tts_lang)
            if audio_url:
                logger.info("[TTS] Audio ready")
                logger.info("[VOICE] Playback started")
        except Exception as e:
            logger.warning("[TTS] Audio synthesis failed: %s", str(e))

    grounded_res["audio_url"] = audio_url

    # Save chat history safely (database failure must never block/break response)
    try:
        saved = save_chat(
            user_id=user_id,
            conversation_id=conv_id,
            question=req.message,
            answer=grounded_res["answer"],
            language=grounded_res["language"],
            topic=grounded_res["topic"],
            intent=grounded_res.get("intent", "GENERAL_AGRICULTURE"),
            sources=grounded_res.get("sources", [])
        )
        grounded_res["chat_id"] = saved["id"] if saved else None
    except Exception as e:
        logger.warning("Failed to save chat history: %s", str(e))
        grounded_res["chat_id"] = None

    return grounded_res


@router.get("/history")
def get_chat_history_route(current_user: dict = Depends(get_current_user_optional)):
    user_id = current_user["id"] if current_user else 1
    return get_chat_history(user_id=user_id)

@router.delete("/history")
def clear_history_route(current_user: dict = Depends(get_current_user_optional)):
    user_id = current_user["id"] if current_user else 1
    clear_chat_history(user_id)
    return {"status": "success", "message": "Conversation history cleared."}
