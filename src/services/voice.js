// Voice Service for Sahayak AI
// Real-time hands-free voice assistant with Web Speech API STT and automatic TTS playback

import api from './api';

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.audioElement = null;
    this.silenceTimer = null;
    this.hasTriggeredFinal = false;
    this.lastProcessedTranscript = '';
  }

  // Pre-unlock Audio context on user gesture for seamless autoplay
  unlockAudio() {
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }
      // Silent play-pause to satisfy browser autoplay policy
      this.audioElement.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.audioElement.pause();
        }).catch(() => {
          // Ignore autoplay restriction warnings during silent unlock
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  // ================= STT (Speech-to-Text) =================
  initRecognition(language = 'hi-IN', callbacks = {}) {
    const { onResult, onError, onEnd, onFinalTranscript } = callbacks;
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    
    if (!SpeechRecognition) {
      console.warn('Web Speech Recognition API not supported in this browser.');
      return null;
    }

    try {
      if (this.recognition) {
        try { this.recognition.abort(); } catch (e) {}
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = language;

      let accumulatedFinal = '';
      this.hasTriggeredFinal = false;

      const finishAndSubmit = (textToSubmit) => {
        if (this.hasTriggeredFinal) return;
        const cleanText = (textToSubmit || '').trim();
        if (cleanText.length > 0) {
          this.hasTriggeredFinal = true;
          this.lastProcessedTranscript = cleanText;
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
          this.stopListening();
          if (onFinalTranscript) {
            onFinalTranscript(cleanText);
          }
        }
      };

      this.recognition.onstart = () => {
        this.isListening = true;
        this.hasTriggeredFinal = false;
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let currentFinal = accumulatedFinal;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += (currentFinal ? ' ' : '') + trans;
          } else {
            interimTranscript += trans;
          }
        }
        accumulatedFinal = currentFinal;

        const totalTranscript = (currentFinal + ' ' + interimTranscript).trim();

        if (onResult) {
          onResult({
            final: currentFinal,
            interim: interimTranscript,
            transcript: totalTranscript
          });
        }

        // Silence timer for end-of-speech auto-submission (750ms threshold)
        if (totalTranscript.length > 0) {
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            finishAndSubmit(totalTranscript);
          }, 750);
        }
      };

      this.recognition.onspeechend = () => {
        // Fast fallback timer when speech natively finishes
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceTimer = setTimeout(() => {
          if (!this.hasTriggeredFinal && accumulatedFinal.trim()) {
            finishAndSubmit(accumulatedFinal);
          }
        }, 350);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        // Ignore non-fatal 'no-speech' or 'aborted' errors
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        let userMessage = event.error;
        if (event.error === 'network') {
          userMessage = 'Speech recognition network service is currently unavailable in this browser environment. You can use quick prompts or type in AI Chat.';
        } else if (event.error === 'not-allowed') {
          userMessage = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
        } else if (event.error === 'audio-capture') {
          userMessage = 'No microphone was detected. Please verify your microphone connection.';
        }
        if (onError) onError(userMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        if (onEnd) onEnd();
      };

      return this.recognition;
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      return null;
    }
  }

  startListening(language = 'hi-IN', callbacks = {}) {
    // Stop any active TTS (barge-in support)
    this.stopSpeaking();
    this.unlockAudio();

    const rec = this.initRecognition(language, callbacks);
    if (!rec) {
      if (callbacks.onError) callbacks.onError('Speech recognition is not supported in this browser. Please use Chrome/Edge.');
      return false;
    }
    try {
      rec.start();
      return true;
    } catch (err) {
      if (callbacks.onError) callbacks.onError(err.message || 'Microphone error');
      return false;
    }
  }

  stopListening() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        // Ignore
      }
    }
    this.isListening = false;
  }

  // ================= TTS (Text-to-Speech) =================
  playAudioUrl(audioUrl, onEnd = null, onError = null) {
    this.stopSpeaking();
    if (!audioUrl) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.audioElement = new Audio(audioUrl);
      this.audioElement.onended = () => {
        this.audioElement = null;
        if (onEnd) onEnd();
      };
      this.audioElement.onerror = (e) => {
        this.audioElement = null;
        if (onError) onError(e);
        else if (onEnd) onEnd();
      };
      
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Auto-playback prevented by browser policy:', err);
          if (onError) onError(err);
          else if (onEnd) onEnd();
        });
      }
    } catch (err) {
      console.error('Audio playback error:', err);
      if (onEnd) onEnd();
    }
  }

  speak(text, lang = 'hi-IN', onEnd = null) {
    this.stopSpeaking();
    if (!text) return;

    // Clean markdown formatting before speaking
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (this.synthesis) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = this.synthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang === lang || v.lang.startsWith(lang.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        console.warn('Browser TTS error, falling back to server TTS:', err);
        this.playServerTTS(cleanText, lang.split('-')[0], onEnd);
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    } else {
      this.playServerTTS(cleanText, lang.split('-')[0], onEnd);
    }
  }

  async playServerTTS(text, language = 'hi', onEnd = null) {
    try {
      const res = await api.synthesizeVoice(text, language);
      if (res && res.audio_url) {
        this.playAudioUrl(res.audio_url, onEnd);
      } else if (onEnd) {
        onEnd();
      }
    } catch (err) {
      console.error('Server TTS failed:', err);
      if (onEnd) onEnd();
    }
  }

  stopSpeaking() {
    if (this.synthesis && this.synthesis.speaking) {
      try { this.synthesis.cancel(); } catch (e) {}
    }
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) {}
      this.audioElement = null;
    }
    this.currentUtterance = null;
  }

  isSpeaking() {
    return (this.synthesis && this.synthesis.speaking) || !!(this.audioElement && !this.audioElement.paused);
  }
}

export const voiceService = new VoiceService();
export default voiceService;
