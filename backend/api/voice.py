from fastapi import APIRouter, HTTPException
from schemas import VoiceTranscribeRequest, VoiceTranscribeResponse, VoiceSynthesizeRequest, VoiceSynthesizeResponse
from services.voice_service import transcribe_audio, synthesize_speech

router = APIRouter(prefix="/api/voice", tags=["Voice Assistant"])

@router.post("/transcribe", response_model=VoiceTranscribeResponse)
def transcribe_route(req: VoiceTranscribeRequest):
    try:
        res = transcribe_audio(req.audio_base64, req.language)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Speech-to-text failed: {str(e)}")

@router.post("/synthesize", response_model=VoiceSynthesizeResponse)
def synthesize_route(req: VoiceSynthesizeRequest):
    try:
        res = synthesize_speech(req.text, req.language)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Text-to-speech failed: {str(e)}")
