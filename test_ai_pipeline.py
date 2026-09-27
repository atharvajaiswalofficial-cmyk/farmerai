import os
import sys
import unittest
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

load_dotenv()

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.llm_service import (
    get_ai_answer, 
    generate_grounded_answer, 
    is_llm_configured,
    get_gemini_client
)
from backend.services.voice_service import synthesize_speech, synthesize_audio_url

class TestAIPipeline(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_01_google_genai_sdk_available(self):
        """Verify google-genai package is installed and importable."""
        from google import genai
        self.assertTrue(hasattr(genai, "Client"), "google.genai must have Client class")
        print("[PASS] google-genai SDK verified.")

    def test_02_central_llm_service_english(self):
        """Test get_ai_answer for English PMFBY question."""
        ans = get_ai_answer(
            question="What is PMFBY?",
            retrieved_context="Pradhan Mantri Fasal Bima Yojana (PMFBY) provides comprehensive crop insurance. Premium rate for Kharif is 2%, Rabi is 1.5%.",
            language="en"
        )
        self.assertIsNotNone(ans)
        self.assertIsInstance(ans, str)
        self.assertTrue(len(ans.strip()) > 10)
        self.assertIn("PMFBY", ans)
        print("[PASS] English AI Answer verified.")

    def test_03_central_llm_service_hindi(self):
        """Test get_ai_answer for Hindi query."""
        ans = get_ai_answer(
            question="PMFBY क्या है?",
            retrieved_context="प्रधानमंत्री फसल बीमा योजना (PMFBY) किसानों को व्यापक फसल बीमा सुरक्षा देती है। खरीफ फसलों के लिए 2% और रबी के लिए 1.5% प्रीमियम है।",
            language="hi"
        )
        self.assertIsNotNone(ans)
        self.assertIsInstance(ans, str)
        self.assertTrue(len(ans.strip()) > 10)
        print("[PASS] Hindi AI Answer verified.")

    def test_04_central_llm_service_hinglish(self):
        """Test get_ai_answer for Hinglish query."""
        ans = get_ai_answer(
            question="PMFBY kya hai aur claim kaise kare?",
            retrieved_context="PMFBY is crop insurance. Localized loss intimation must be done within 72 hours via helpline 14447.",
            language="hi"
        )
        self.assertIsNotNone(ans)
        self.assertIsInstance(ans, str)
        self.assertTrue(len(ans.strip()) > 10)
        print("[PASS] Hinglish AI Answer verified.")

    def test_05_rag_no_context_safe_answer(self):
        """Test when RAG has no context, LLM still returns safe, non-empty response."""
        ans = get_ai_answer(
            question="How do quantum computers work in space rockets?",
            retrieved_context="",
            language="en"
        )
        self.assertIsNotNone(ans)
        self.assertIsInstance(ans, str)
        self.assertTrue(len(ans.strip()) > 10)
        print("[PASS] Out-of-Domain Safe Answer verified.")

    def test_06_fastapi_chat_endpoint_text_mode(self):
        """Test POST /api/chat with input_mode='text'."""
        payload = {
            "message": "What is the PMFBY crop insurance intimation deadline?",
            "input_mode": "text",
            "language": "en"
        }
        res = self.client.post("/api/chat", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        
        self.assertTrue(data.get("success"), "success field must be true")
        self.assertIsNotNone(data.get("answer"), "answer field must not be null")
        self.assertTrue(len(data.get("answer", "").strip()) > 10, "answer must not be empty")
        self.assertEqual(data.get("input_mode"), "text")
        self.assertIsNone(data.get("audio_url"))
        self.assertTrue(len(data.get("sources", [])) > 0, "sources must be returned for PMFBY")
        print("[PASS] /api/chat text mode response verified.")

    def test_07_fastapi_chat_endpoint_voice_mode(self):
        """Test POST /api/chat with input_mode='voice' returns both text answer and audio_url."""
        payload = {
            "message": "मेरी फसल खराब हो गई है, मुझे क्या करना चाहिए?",
            "input_mode": "voice",
            "language": "hi"
        }
        res = self.client.post("/api/chat", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        
        self.assertTrue(data.get("success"), "success field must be true")
        self.assertIsNotNone(data.get("answer"), "answer field must not be null")
        self.assertTrue(len(data.get("answer", "").strip()) > 10, "answer must not be empty")
        self.assertEqual(data.get("input_mode"), "voice")
        self.assertIsNotNone(data.get("audio_url"), "audio_url must be generated for voice mode")
        self.assertTrue(data["audio_url"].startswith("data:audio/mp3;base64,"))
        print("[PASS] /api/chat voice mode (text + audio_url) verified.")

    def test_08_tts_speech_synthesis(self):
        """Test gTTS synthesis helper."""
        res = synthesize_speech("नमस्ते किसान भाई, पीएम फसल बीमा योजना में आपका स्वागत है।", "hi")
        self.assertEqual(res["status"], "success")
        self.assertTrue(len(res["audio_base64"]) > 100)
        
        audio_url = synthesize_audio_url("Hello farmer friend, welcome to Sahayak AI.", "en")
        self.assertIsNotNone(audio_url)
        self.assertTrue(audio_url.startswith("data:audio/mp3;base64,"))
        print("[PASS] TTS speech synthesis verified.")

if __name__ == "__main__":
    unittest.main()
