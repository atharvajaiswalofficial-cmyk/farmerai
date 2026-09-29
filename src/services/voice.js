// Voice Service for Sahayak AI
// Real-time hands-free voice assistant with Web Speech API STT and TTS

import api from './api';

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;

    this.synthesis =
      typeof window !== 'undefined'
        ? window.speechSynthesis
        : null;

    this.currentUtterance = null;
    this.audioElement = null;

    this.silenceTimer = null;

    // Prevent duplicate submission
    this.hasTriggeredFinal = false;

    // Stores the complete FINAL transcript
    this.lastProcessedTranscript = '';

    // Stores callbacks for current recognition session
    this.callbacks = {};
  }

  // ============================================================
  // AUDIO UNLOCK
  // ============================================================

  unlockAudio() {
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }

      // Silent audio used to satisfy browser autoplay policies
      this.audioElement.src =
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

      const playPromise = this.audioElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            try {
              this.audioElement.pause();
              this.audioElement.currentTime = 0;
            } catch (e) {
              // Ignore
            }
          })
          .catch(() => {
            // Browser may block silent autoplay.
            // This is not a fatal error.
          });
      }
    } catch (e) {
      // Ignore audio unlock errors
    }
  }

  // ============================================================
  // SPEECH TO TEXT
  // ============================================================

  initRecognition(language = 'hi-IN', callbacks = {}) {
    const {
      onResult,
      onError,
      onEnd,
      onFinalTranscript
    } = callbacks;

    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition ||
        window.webkitSpeechRecognition);

    // Browser support check
    if (!SpeechRecognition) {
      console.warn(
        'Web Speech Recognition API is not supported in this browser.'
      );

      if (onError) {
        onError(
          'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
        );
      }

      return null;
    }

    try {
      // Stop previous recognition session
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch (e) {
          // Ignore
        }
      }

      // Clear previous timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }

      // Create recognition instance
      this.recognition = new SpeechRecognition();

      // IMPORTANT SETTINGS
      this.recognition.continuous = true;

      // We need interim results so the UI can show live transcription,
      // BUT interim results will NEVER be submitted to the AI.
      this.recognition.interimResults = true;

      this.recognition.lang = language;

      // Keep enough alternatives for better browser recognition
      this.recognition.maxAlternatives = 1;

      // Save callbacks
      this.callbacks = callbacks;

      // Complete FINAL transcript
      let accumulatedFinal = '';

      this.hasTriggeredFinal = false;
      this.lastProcessedTranscript = '';

      // ------------------------------------------------------------
      // SUBMIT FINAL QUERY
      // ------------------------------------------------------------

      const finishAndSubmit = (textToSubmit) => {
        if (this.hasTriggeredFinal) {
          return;
        }

        const cleanText = (textToSubmit || '').trim();

        if (!cleanText) {
          return;
        }

        // Prevent duplicate submissions
        this.hasTriggeredFinal = true;

        this.lastProcessedTranscript = cleanText;

        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }

        this.stopListening();

        console.log(
          '[VoiceService] FINAL QUERY:',
          cleanText
        );

        if (onFinalTranscript) {
          onFinalTranscript(cleanText);
        }
      };

      // ------------------------------------------------------------
      // RECOGNITION START
      // ------------------------------------------------------------

      this.recognition.onstart = () => {
        console.log(
          '[VoiceService] Speech recognition started:',
          language
        );

        this.isListening = true;
        this.hasTriggeredFinal = false;
        this.lastProcessedTranscript = '';
      };

      // ------------------------------------------------------------
      // RECOGNITION RESULT
      // ------------------------------------------------------------

      this.recognition.onresult = (event) => {
        let interimTranscript = '';

        // Start with previously confirmed final text
        let currentFinal = accumulatedFinal;

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const result = event.results[i];

          if (!result || !result[0]) {
            continue;
          }

          const text = result[0].transcript || '';

          if (result.isFinal) {
            // ONLY FINAL RESULTS are added to accumulatedFinal
            currentFinal +=
              (currentFinal ? ' ' : '') + text.trim();
          } else {
            // Interim text is ONLY displayed
            interimTranscript += text;
          }
        }

        // Save confirmed final transcript
        accumulatedFinal = currentFinal.trim();

        // Transcript shown in UI
        const totalTranscript = (
          accumulatedFinal +
          ' ' +
          interimTranscript
        ).trim();

        console.log(
          '[VoiceService] Transcript:',
          totalTranscript
        );

        // Update UI with live transcript
        if (onResult) {
          onResult({
            final: accumulatedFinal,
            interim: interimTranscript,
            transcript: totalTranscript
          });
        }

        // ==========================================================
        // IMPORTANT:
        //
        // DO NOT submit interim results.
        //
        // Only submit when we have an actual FINAL result.
        // ==========================================================

        if (
          accumulatedFinal &&
          !this.hasTriggeredFinal
        ) {
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
          }

          // Give browser time to finish recognition.
          this.silenceTimer = setTimeout(() => {
            if (
              !this.hasTriggeredFinal &&
              accumulatedFinal.trim()
            ) {
              finishAndSubmit(accumulatedFinal);
            }
          }, 1200);
        }
      };

      // ------------------------------------------------------------
      // SPEECH END
      // ------------------------------------------------------------

      this.recognition.onspeechend = () => {
        console.log(
          '[VoiceService] Native speech end detected.'
        );

        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
        }

        // Only FINAL transcript can be submitted.
        if (
          !this.hasTriggeredFinal &&
          accumulatedFinal.trim()
        ) {
          this.silenceTimer = setTimeout(() => {
            if (
              !this.hasTriggeredFinal &&
              accumulatedFinal.trim()
            ) {
              finishAndSubmit(accumulatedFinal);
            }
          }, 500);
        }
      };

      // ------------------------------------------------------------
      // RECOGNITION ERROR
      // ------------------------------------------------------------

      this.recognition.onerror = (event) => {
        console.error(
          '[VoiceService] Speech recognition error:',
          event.error
        );

        this.isListening = false;

        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }

        // These are usually not fatal
        if (
          event.error === 'no-speech' ||
          event.error === 'aborted'
        ) {
          return;
        }

        let userMessage = event.error;

        if (event.error === 'network') {
          userMessage =
            'Speech recognition network service is unavailable. Please check your internet connection or use Chrome/Edge.';
        }

        if (event.error === 'not-allowed') {
          userMessage =
            'Microphone permission was denied. Please allow microphone access in your browser settings.';
        }

        if (event.error === 'audio-capture') {
          userMessage =
            'No microphone was detected. Please check your microphone connection.';
        }

        if (onError) {
          onError(userMessage);
        }
      };

      // ------------------------------------------------------------
      // RECOGNITION END
      // ------------------------------------------------------------

      this.recognition.onend = () => {
        console.log(
          '[VoiceService] Speech recognition ended.'
        );

        this.isListening = false;

        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }

        if (onEnd) {
          onEnd();
        }
      };

      return this.recognition;

    } catch (err) {
      console.error(
        '[VoiceService] Failed to initialize speech recognition:',
        err
      );

      if (onError) {
        onError(
          err.message ||
          'Failed to initialize speech recognition.'
        );
      }

      return null;
    }
  }

  // ============================================================
  // START LISTENING
  // ============================================================

  startListening(
    language = 'hi-IN',
    callbacks = {}
  ) {
    // Stop currently playing voice
    this.stopSpeaking();

    // Unlock browser audio
    this.unlockAudio();

    const recognition = this.initRecognition(
      language,
      callbacks
    );

    if (!recognition) {
      return false;
    }

    try {
      recognition.start();

      console.log(
        '[VoiceService] Listening started:',
        language
      );

      return true;

    } catch (err) {
      console.error(
        '[VoiceService] Failed to start recognition:',
        err
      );

      if (callbacks.onError) {
        callbacks.onError(
          err.message ||
          'Unable to start microphone.'
        );
      }

      return false;
    }
  }

  // ============================================================
  // STOP LISTENING
  // ============================================================

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

  // ============================================================
  // TEXT TO SPEECH
  // ============================================================

  playAudioUrl(
    audioUrl,
    onEnd = null,
    onError = null
  ) {
    this.stopSpeaking();

    if (!audioUrl) {
      if (onEnd) {
        onEnd();
      }

      return;
    }

    try {
      this.audioElement = new Audio(audioUrl);

      this.audioElement.onended = () => {
        this.audioElement = null;

        if (onEnd) {
          onEnd();
        }
      };

      this.audioElement.onerror = (error) => {
        console.warn(
          '[VoiceService] Audio URL playback failed:',
          error
        );

        this.audioElement = null;

        if (onError) {
          onError(error);
        } else if (onEnd) {
          onEnd();
        }
      };

      const playPromise =
        this.audioElement.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(
            '[VoiceService] Browser blocked audio playback:',
            error
          );

          if (onError) {
            onError(error);
          } else if (onEnd) {
            onEnd();
          }
        });
      }

    } catch (err) {
      console.error(
        '[VoiceService] Audio playback error:',
        err
      );

      if (onEnd) {
        onEnd();
      }
    }
  }

  // ============================================================
  // BROWSER TTS
  // ============================================================

  speak(
    text,
    lang = 'hi-IN',
    onEnd = null
  ) {
    this.stopSpeaking();

    if (!text || !text.trim()) {
      if (onEnd) {
        onEnd();
      }

      return;
    }

    // Clean markdown before speaking
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    // Browser Speech Synthesis
    if (this.synthesis) {
      try {
        const utterance =
          new SpeechSynthesisUtterance(
            cleanText
          );

        utterance.lang = lang;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Get available voices
        let voices =
          this.synthesis.getVoices();

        // Some browsers load voices asynchronously
        if (!voices.length) {
          this.synthesis.onvoiceschanged = () => {
            voices =
              this.synthesis.getVoices();

            this.assignVoice(
              utterance,
              voices,
              lang
            );

            this.currentUtterance =
              utterance;

            this.synthesis.speak(
              utterance
            );
          };

          return;
        }

        this.assignVoice(
          utterance,
          voices,
          lang
        );

        utterance.onstart = () => {
          console.log(
            '[VoiceService] TTS started:',
            lang
          );
        };

        utterance.onend = () => {
          console.log(
            '[VoiceService] TTS finished.'
          );

          this.currentUtterance = null;

          if (onEnd) {
            onEnd();
          }
        };

        utterance.onerror = (error) => {
          console.warn(
            '[VoiceService] Browser TTS error:',
            error
          );

          this.currentUtterance = null;

          // Try server-side TTS
          this.playServerTTS(
            cleanText,
            lang.split('-')[0],
            onEnd
          );
        };

        this.currentUtterance =
          utterance;

        this.synthesis.speak(
          utterance
        );

      } catch (err) {
        console.error(
          '[VoiceService] Browser TTS failed:',
          err
        );

        this.playServerTTS(
          cleanText,
          lang.split('-')[0],
          onEnd
        );
      }

    } else {
      // No browser TTS
      this.playServerTTS(
        cleanText,
        lang.split('-')[0],
        onEnd
      );
    }
  }

  // ============================================================
  // FIND MATCHING VOICE
  // ============================================================

  assignVoice(
    utterance,
    voices,
    language
  ) {
    if (!voices || !voices.length) {
      return;
    }

    const exactVoice = voices.find(
      (voice) =>
        voice.lang &&
        voice.lang.toLowerCase() ===
          language.toLowerCase()
    );

    if (exactVoice) {
      utterance.voice = exactVoice;
      return;
    }

    const languageCode =
      language.split('-')[0].toLowerCase();

    const languageVoice = voices.find(
      (voice) =>
        voice.lang &&
        voice.lang
          .toLowerCase()
          .startsWith(languageCode)
    );

    if (languageVoice) {
      utterance.voice = languageVoice;
    }
  }

  // ============================================================
  // SERVER TTS FALLBACK
  // ============================================================

  async playServerTTS(
    text,
    language = 'hi',
    onEnd = null
  ) {
    try {
      console.log(
        '[VoiceService] Using server TTS:',
        language
      );

      const res =
        await api.synthesizeVoice(
          text,
          language
        );

      if (
        res &&
        res.audio_url
      ) {
        this.playAudioUrl(
          res.audio_url,
          onEnd
        );
      } else {
        console.warn(
          '[VoiceService] Server TTS returned no audio URL.'
        );

        if (onEnd) {
          onEnd();
        }
      }

    } catch (err) {
      console.error(
        '[VoiceService] Server TTS failed:',
        err
      );

      if (onEnd) {
        onEnd();
      }
    }
  }

  // ============================================================
  // STOP SPEAKING
  // ============================================================

  stopSpeaking() {
    if (
      this.synthesis &&
      this.synthesis.speaking
    ) {
      try {
        this.synthesis.cancel();
      } catch (e) {
        // Ignore
      }
    }

    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) {
        // Ignore
      }

      this.audioElement = null;
    }

    this.currentUtterance = null;
  }

  // ============================================================
  // CHECK SPEAKING STATE
  // ============================================================

  isSpeaking() {
    return (
      !!(
        this.synthesis &&
        this.synthesis.speaking
      ) ||
      !!(
        this.audioElement &&
        !this.audioElement.paused
      )
    );
  }
}

// ============================================================
// SINGLETON
// ============================================================

export const voiceService =
  new VoiceService();

export default voiceService;
