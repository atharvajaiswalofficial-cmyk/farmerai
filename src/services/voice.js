// src/services/voice.js

class VoiceService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSpeakingState = false;

        this.callbacks = {};

        this.accumulatedFinal = "";
        this.interimTranscript = "";

        this.submitTimer = null;
        this.lastSubmittedText = "";

        this.shouldSubmit = false;
        this.manualStop = false;

        this.currentLanguage = "en-IN";

        this.initRecognition();
    }

    // ============================================================
    // INITIALIZE SPEECH RECOGNITION
    // ============================================================

    initRecognition() {
        if (typeof window === "undefined") {
            return;
        }

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error(
                "[VoiceService] Speech Recognition is not supported in this browser."
            );

            this.recognition = null;
            return;
        }

        try {
            this.recognition = new SpeechRecognition();

            // IMPORTANT:
            // continuous=false makes Chrome reliably return the final
            // transcript and prevents endless recognition sessions.
            this.recognition.continuous = false;

            // Show partial words while user is speaking.
            this.recognition.interimResults = true;

            // Return multiple alternatives is unnecessary.
            this.recognition.maxAlternatives = 1;

            // Default language.
            this.recognition.lang = this.currentLanguage;

            // ========================================================
            // ON START
            // ========================================================

            this.recognition.onstart = () => {
                console.log(
                    "[VoiceService] 🎤 Speech recognition started"
                );

                this.isListening = true;
                this.manualStop = false;

                if (this.callbacks.onStart) {
                    this.callbacks.onStart();
                }
            };

            // ========================================================
            // ON RESULT
            // ========================================================

            this.recognition.onresult = (event) => {
                let finalText = "";
                let interimText = "";

                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                ) {
                    const transcript =
                        event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        finalText += transcript + " ";
                    } else {
                        interimText += transcript;
                    }
                }

                // Add final transcript to accumulated text.
                if (finalText.trim()) {
                    this.accumulatedFinal +=
                        finalText.trim() + " ";
                }

                this.interimTranscript = interimText;

                const completeText =
                    `${this.accumulatedFinal} ${this.interimTranscript}`
                        .replace(/\s+/g, " ")
                        .trim();

                console.log(
                    "[VoiceService] Interim:",
                    this.interimTranscript
                );

                console.log(
                    "[VoiceService] Current transcript:",
                    completeText
                );

                // Send transcript to UI.
                if (this.callbacks.onResult) {
                    this.callbacks.onResult({
                        transcript: completeText,
                        final: Boolean(finalText.trim()),
                    });
                }

                // If browser has given us a FINAL result,
                // wait a little before submitting.
                if (finalText.trim()) {
                    this.scheduleSubmit();
                }
            };

            // ========================================================
            // ON ERROR
            // ========================================================

            this.recognition.onerror = (event) => {
                console.error(
                    "[VoiceService] ❌ Recognition error:",
                    event.error
                );

                this.isListening = false;

                let message = "Voice recognition failed.";

                switch (event.error) {
                    case "not-allowed":
                        message =
                            "Microphone permission was denied. Please allow microphone access.";
                        break;

                    case "service-not-allowed":
                        message =
                            "Speech recognition service is not allowed.";
                        break;

                    case "no-speech":
                        message =
                            "No speech detected. Please speak again.";
                        break;

                    case "audio-capture":
                        message =
                            "Microphone could not be accessed. Check your microphone.";
                        break;

                    case "network":
                        message =
                            "Speech recognition requires an internet connection.";
                        break;

                    case "aborted":
                        // User stopped recognition.
                        message = "Voice recognition stopped.";
                        break;

                    default:
                        message =
                            `Voice recognition error: ${event.error}`;
                }

                if (this.callbacks.onError) {
                    this.callbacks.onError({
                        error: event.error,
                        message,
                    });
                }
            };

            // ========================================================
            // ON END
            // ========================================================

            this.recognition.onend = () => {
                console.log(
                    "[VoiceService] Speech recognition ended."
                );

                this.isListening = false;

                if (this.callbacks.onEnd) {
                    this.callbacks.onEnd();
                }

                // If we already have a final transcript and haven't
                // submitted it yet, submit it now.
                if (
                    !this.manualStop &&
                    this.accumulatedFinal.trim() &&
                    !this.shouldSubmit
                ) {
                    this.submitFinalTranscript();
                }
            };

            console.log(
                "[VoiceService] ✅ Speech recognition initialized"
            );
        } catch (error) {
            console.error(
                "[VoiceService] Failed to initialize recognition:",
                error
            );

            this.recognition = null;
        }
    }

    // ============================================================
    // START LISTENING
    // ============================================================

    startListening(language = "en-IN", callbacks = {}) {
        return new Promise((resolve, reject) => {
            if (!this.recognition) {
                const error =
                    "Speech recognition is not supported. Please use Google Chrome or Microsoft Edge.";

                console.error(
                    "[VoiceService]",
                    error
                );

                if (callbacks.onError) {
                    callbacks.onError({
                        error: "not-supported",
                        message: error,
                    });
                }

                reject(new Error(error));
                return;
            }

            // Save callbacks.
            this.callbacks = callbacks;

            // Save language.
            this.currentLanguage =
                language || "en-IN";

            // Convert common language codes to browser locale.
            this.currentLanguage =
                this.normalizeLanguage(
                    this.currentLanguage
                );

            this.recognition.lang =
                this.currentLanguage;

            // Reset transcript state.
            this.accumulatedFinal = "";
            this.interimTranscript = "";
            this.lastSubmittedText = "";

            this.shouldSubmit = false;
            this.manualStop = false;

            if (this.submitTimer) {
                clearTimeout(this.submitTimer);
                this.submitTimer = null;
            }

            console.log(
                "[VoiceService] 🎤 Starting microphone"
            );

            console.log(
                "[VoiceService] Language:",
                this.currentLanguage
            );

            try {
                this.recognition.start();

                resolve(true);
            } catch (error) {
                console.error(
                    "[VoiceService] Start error:",
                    error
                );

                // Chrome can throw InvalidStateError if start()
                // is called while already running.
                if (
                    error.name ===
                    "InvalidStateError"
                ) {
                    console.warn(
                        "[VoiceService] Recognition is already running."
                    );

                    resolve(true);
                    return;
                }

                if (callbacks.onError) {
                    callbacks.onError({
                        error: error.name,
                        message:
                            error.message ||
                            "Could not start microphone.",
                    });
                }

                reject(error);
            }
        });
    }

    // ============================================================
    // SCHEDULE FINAL SUBMISSION
    // ============================================================

    scheduleSubmit() {
        if (this.submitTimer) {
            clearTimeout(this.submitTimer);
        }

        this.submitTimer = setTimeout(() => {
            this.submitFinalTranscript();
        }, 1000);
    }

    // ============================================================
    // SUBMIT FINAL TRANSCRIPT
    // ============================================================

    submitFinalTranscript() {
        if (this.shouldSubmit) {
            return;
        }

        const text =
            this.accumulatedFinal
                .replace(/\s+/g, " ")
                .trim();

        if (!text) {
            console.warn(
                "[VoiceService] No final transcript available."
            );
            return;
        }

        // Prevent duplicate submission.
        if (
            text.toLowerCase() ===
            this.lastSubmittedText.toLowerCase()
        ) {
            console.warn(
                "[VoiceService] Duplicate transcript ignored."
            );
            return;
        }

        this.shouldSubmit = true;
        this.lastSubmittedText = text;

        console.log(
            "[VoiceService] ================================="
        );

        console.log(
            "[VoiceService] 🎤 FINAL QUERY:"
        );

        console.log(text);

        console.log(
            "[VoiceService] ================================="
        );

        if (this.callbacks.onFinalTranscript) {
            this.callbacks.onFinalTranscript(text);
        }

        // Stop recognition after final transcript.
        this.stopListening();
    }

    // ============================================================
    // STOP LISTENING
    // ============================================================

    stopListening() {
        this.manualStop = true;
        this.isListening = false;

        if (this.submitTimer) {
            clearTimeout(this.submitTimer);
            this.submitTimer = null;
        }

        if (!this.recognition) {
            return;
        }

        try {
            this.recognition.stop();

            console.log(
                "[VoiceService] 🎤 Microphone stopped"
            );
        } catch (error) {
            console.warn(
                "[VoiceService] Stop error:",
                error
            );
        }
    }

    // ============================================================
    // ABORT LISTENING
    // ============================================================

    abortListening() {
        this.manualStop = true;
        this.isListening = false;

        if (this.submitTimer) {
            clearTimeout(this.submitTimer);
            this.submitTimer = null;
        }

        if (!this.recognition) {
            return;
        }

        try {
            this.recognition.abort();

            console.log(
                "[VoiceService] Voice recognition aborted."
            );
        } catch (error) {
            console.warn(
                "[VoiceService] Abort error:",
                error
            );
        }
    }

    // ============================================================
    // LANGUAGE NORMALIZATION
    // ============================================================

    normalizeLanguage(language) {
        if (!language) {
            return "en-IN";
        }

        const lang = language.toLowerCase();

        const languages = {
            en: "en-IN",
            english: "en-IN",

            hi: "hi-IN",
            hindi: "hi-IN",

            mr: "mr-IN",
            marathi: "mr-IN",

            gu: "gu-IN",
            gujarati: "gu-IN",

            pa: "pa-IN",
            punjabi: "pa-IN",

            bn: "bn-IN",
            bengali: "bn-IN",

            ta: "ta-IN",
            tamil: "ta-IN",

            te: "te-IN",
            telugu: "te-IN",

            kn: "kn-IN",
            kannada: "kn-IN",

            ml: "ml-IN",
            malayalam: "ml-IN",

            or: "or-IN",
            odia: "or-IN",
        };

        return languages[lang] || language;
    }

    // ============================================================
    // TEXT TO SPEECH
    // ============================================================

    speak(text, language = "hi-IN") {
        return new Promise((resolve, reject) => {
            if (
                typeof window === "undefined" ||
                !window.speechSynthesis
            ) {
                console.warn(
                    "[VoiceService] Speech synthesis unavailable."
                );

                resolve(false);
                return;
            }

            if (!text || !text.trim()) {
                resolve(false);
                return;
            }

            try {
                window.speechSynthesis.cancel();

                const utterance =
                    new SpeechSynthesisUtterance(
                        text
                    );

                utterance.lang =
                    this.normalizeLanguage(language);

                utterance.rate = 0.95;
                utterance.pitch = 1;
                utterance.volume = 1;

                const voices =
                    window.speechSynthesis.getVoices();

                const normalizedLanguage =
                    this.normalizeLanguage(language)
                        .toLowerCase();

                const baseLanguage =
                    normalizedLanguage.split("-")[0];

                const matchingVoice =
                    voices.find((voice) => {
                        const voiceLang =
                            voice.lang.toLowerCase();

                        return (
                            voiceLang ===
                            normalizedLanguage
                        );
                    }) ||
                    voices.find((voice) => {
                        const voiceLang =
                            voice.lang.toLowerCase();

                        return voiceLang.startsWith(
                            baseLanguage
                        );
                    });

                if (matchingVoice) {
                    utterance.voice =
                        matchingVoice;
                }

                utterance.onstart = () => {
                    this.isSpeakingState = true;
                };

                utterance.onend = () => {
                    this.isSpeakingState = false;
                    resolve(true);
                };

                utterance.onerror = (event) => {
                    this.isSpeakingState = false;

                    console.error(
                        "[VoiceService] TTS error:",
                        event
                    );

                    resolve(false);
                };

                window.speechSynthesis.speak(
                    utterance
                );

                console.log(
                    "[VoiceService] 🔊 Speaking response"
                );
            } catch (error) {
                this.isSpeakingState = false;

                console.error(
                    "[VoiceService] TTS exception:",
                    error
                );

                reject(error);
            }
        });
    }

    // ============================================================
    // PLAY AUDIO URL
    // ============================================================

    playAudioUrl(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(
                    new Error(
                        "No audio URL provided."
                    )
                );
                return;
            }

            try {
                const audio =
                    new Audio(url);

                audio.onplay = () => {
                    this.isSpeakingState = true;
                };

                audio.onended = () => {
                    this.isSpeakingState = false;
                    resolve(true);
                };

                audio.onerror = (error) => {
                    this.isSpeakingState = false;

                    console.error(
                        "[VoiceService] Audio error:",
                        error
                    );

                    reject(
                        new Error(
                            "Could not play audio."
                        )
                    );
                };

                audio.play().catch((error) => {
                    this.isSpeakingState = false;

                    console.error(
                        "[VoiceService] Audio play error:",
                        error
                    );

                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // ============================================================
    // SERVER TTS
    // ============================================================

    async playServerTTS(
        text,
        language = "hi"
    ) {
        try {
            if (!text || !text.trim()) {
                return false;
            }

            const API_BASE =
                "https://farmerai-2nic.onrender.com/api";

            const response =
                await fetch(
                    `${API_BASE}/voice/synthesize`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            text,
                            language,
                        }),
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `TTS request failed: ${response.status}`
                );
            }

            const data =
                await response.json();

            if (data.audio_url) {
                await this.playAudioUrl(
                    data.audio_url
                );

                return true;
            }

            if (data.url) {
                await this.playAudioUrl(
                    data.url
                );

                return true;
            }

            return false;
        } catch (error) {
            console.error(
                "[VoiceService] Server TTS error:",
                error
            );

            return false;
        }
    }

    // ============================================================
    // STOP SPEAKING
    // ============================================================

    stopSpeaking() {
        if (
            typeof window !== "undefined" &&
            window.speechSynthesis
        ) {
            window.speechSynthesis.cancel();
        }

        this.isSpeakingState = false;
    }

    // ============================================================
    // CHECK SPEAKING
    // ============================================================

    isSpeaking() {
        return this.isSpeakingState;
    }

    // ============================================================
    // CHECK SUPPORT
    // ============================================================

    isSupported() {
        if (typeof window === "undefined") {
            return false;
        }

        return Boolean(
            window.SpeechRecognition ||
            window.webkitSpeechRecognition
        );
    }
}

const voiceService = new VoiceService();

export default voiceService;
