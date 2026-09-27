import re
from typing import Dict, Any
from config import SUPPORTED_LANGUAGES

def detect_language(text: str) -> str:
    """
    Detect Indian regional language or English from Unicode scripts and common transliterated words.
    """
    if not text:
        return "en"

    # Script Detection via Unicode Ranges
    if re.search(r'[\u0900-\u097F]', text): # Devanagari (Hindi / Marathi)
        if any(w in text for w in ["आहे", "नाही", "शेतकरी", "पीक", "करावे", "झाले", "माझे", "कसे", "पाहिजे"]):
            return "mr"
        return "hi"
    if re.search(r'[\u0A80-\u0AFF]', text): # Gujarati
        return "gu"
    if re.search(r'[\u0A00-\u0A7F]', text): # Gurmukhi / Punjabi
        return "pa"
    if re.search(r'[\u0980-\u09FF]', text): # Bengali / Assamese
        if any(w in text for w in ["আমাৰ", "কৃষক", "হয়"]):
            return "as"
        return "bn"
    if re.search(r'[\u0B80-\u0BFF]', text): # Tamil
        return "ta"
    if re.search(r'[\u0C00-\u0C7F]', text): # Telugu
        return "te"
    if re.search(r'[\u0C80-\u0CFF]', text): # Kannada
        return "kn"
    if re.search(r'[\u0D00-\u0D7F]', text): # Malayalam
        return "ml"
    if re.search(r'[\u0B00-\u0B7F]', text): # Odia
        return "or"

    # Hinglish detection
    hinglish_keywords = [
        "kya", "hai", "kaise", "karein", "kare", "batao", "chahiye", "yojana", "fasal", 
        "kisan", "kitna", "madad", "nuksan", "barish", "kab", "milega", "bima", "paisa", 
        "kaun", "kon", "kisse", "shikayat", "bhi", "bina", "raha", "rahi", "huye", "ho"
    ]
    text_words = re.findall(r'\w+', text.lower())
    if any(w in hinglish_keywords for w in text_words):
        return "hi"

    return "en"

def get_language_meta(lang_code: str) -> Dict[str, str]:
    return SUPPORTED_LANGUAGES.get(lang_code, SUPPORTED_LANGUAGES.get("en", {"name": "English", "native": "English"}))

