// ============================================================
// SAHAYAK AI - VOICE SERVICE
// ============================================================

class VoiceService {
    constructor() {
        this.recognition = null;

        this.isListening = false;
        this.isSpeakingState = false;

        this.callbacks = {};

        this.accumulatedFinal = "";
        this.interimTranscript = "";

        this.lastSubmittedText = "";

        this.currentLanguage = "hi-IN";

        this.manualStop = false;
        this.hasSubmitted = false;

        this.initializeRecognition();
    }

    // ============================================================
    // INITIALIZE SPEECH RECOGNITION
    // ============================================================

    initializeRecognition() {
        if (typeof window === "undefined") {
            return;
        }

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error(
                "[VoiceService] Speech Recognition is not supported."
            );

            return;
        }

        try {
            this.recognition =
                new SpeechRecognition();

            /*
             * IMPORTANT:
             *
             * false is more reliable for
             * one-question-at-a-time voice input.
             */

            this.recognition.continuous = false;

            this.recognition.interimResults = true;

            this.recognition.maxAlternatives = 1;

            this.recognition.lang =
                this.currentLanguage;

            // ====================================================
            // START
            // ====================================================

            this.recognition.onstart = () => {
                console.log(
                    "[VoiceService] 🎤 Recognition started"
                );

                console.log(
                    "[VoiceService] 🎤 Language:",
                    this.recognition.lang
                );

                this.isListening = true;

                if (this.callbacks.onStart) {
                    this.callbacks.onStart();
                }
            };

            // ====================================================
            // RESULT
            // ====================================================

            this.recognition.onresult = (event) => {
                console.log(
                    "[VoiceService] 📥 Speech result received"
                );

                let finalText = "";
                let interimText = "";

                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                ) {
                    const result =
                        event.results[i];

                    const transcript =
                        result[0]?.transcript || "";

                    console.log(
                        "[VoiceService] Transcript segment:",
                        transcript,
                        "Final:",
                        result.isFinal
                    );

                    if (result.isFinal) {
                        finalText +=
                            transcript + " ";
                    } else {
                        interimText +=
                            transcript;
                    }
                }

                // ====================================================
                // FINAL TEXT
                // ====================================================

                if (finalText.trim()) {
                    this.accumulatedFinal +=
                        finalText.trim() + " ";
                }

                // ====================================================
                // INTERIM TEXT
                // ====================================================

                this.interimTranscript =
                    interimText;

                const displayText =
                    `${this.accumulatedFinal} ${this.interimTranscript}`
                        .replace(/\s+/g, " ")
                        .trim();

                console.log(
                    "[VoiceService] 📝 Current transcript:",
                    displayText
                );

                // ====================================================
                // SEND LIVE TRANSCRIPT TO UI
                // ====================================================

                if (this.callbacks.onResult) {
                    this.callbacks.onResult({
                        transcript:
                            displayText,

                        final:
                            Boolean(
                                finalText.trim()
                            ),
                    });
                }

                // ====================================================
                // FINAL ANSWER
                // ====================================================

                if (finalText.trim()) {
                    this.submitFinalTranscript();
                }
            };

            // ====================================================
            // ERROR
            // ====================================================

            this.recognition.onerror = (event) => {
                console.error(
                    "[VoiceService] ❌ Recognition error:",
                    event.error
                );

                console.error(
                    "[VoiceService] Error details:",
                    event
                );

                this.isListening = false;

                // ------------------------------------------------
                // NO SPEECH
                // ------------------------------------------------

                if (event.error === "no-speech") {
                    /*
                     * Do not treat this as a fatal application
                     * error. Chrome sometimes produces no-speech
                     * when the microphone doesn't capture audio.
                     */

                    console.warn(
                        "[VoiceService] ⚠️ Chrome detected no speech."
                    );

                    if (
                        this.callbacks.onError
                    ) {
                        this.callbacks.onError({
                            error: "no-speech",

                            message:
                                "No speech was detected. Please speak clearly near the microphone and try again.",
                        });
                    }

                    return;
                }

                // ------------------------------------------------
                // MICROPHONE PERMISSION
                // ------------------------------------------------

                if (
                    event.error ===
                    "not-allowed"
                ) {
                    if (
                        this.callbacks.onError
                    ) {
                        this.callbacks.onError({
                            error:
                                "not-allowed",

                            message:
                                "Microphone permission was denied. Please allow microphone access for this website.",
                        });
                    }

                    return;
                }

                // ------------------------------------------------
                // MICROPHONE NOT FOUND
                // ------------------------------------------------

                if (
                    event.error ===
                    "audio-capture"
                ) {
                    if (
                        this.callbacks.onError
                    ) {
                        this.callbacks.onError({
                            error:
                                "audio-capture",

                            message:
                                "No working microphone was detected. Please check your microphone.",
                        });
                    }

                    return;
                }

                // ------------------------------------------------
                // NETWORK
                // ------------------------------------------------

                if (
                    event.error ===
                    "network"
                ) {
                    if (
                        this.callbacks.onError
                    ) {
                        this.callbacks.onError({
                            error: "network",

                            message:
                                "Speech recognition could not connect to the speech service. Check your internet connection.",
                        });
                    }

                    return;
                }

                // ------------------------------------------------
                // OTHER ERRORS
                // ------------------------------------------------

                if (
                    this.callbacks.onError
                ) {
                    this.callbacks.onError({
                        error:
                            event.error,

                        message:
                            `Voice recognition error: ${event.error}`,
                    });
                }
            };

            // ====================================================
            // END
            // ====================================================

            this.recognition.onend = () => {
                console.log(
                    "[VoiceService] 🛑 Recognition ended"
                );

                this.isListening = false;

                /*
                 * If Chrome ends after capturing final speech,
                 * make sure it is submitted.
                 */

                if (
                    !this.hasSubmitted &&
                    this.accumulatedFinal.trim()
                ) {
                    this.submitFinalTranscript();
                }

                if (this.callbacks.onEnd) {
                    this.callbacks.onEnd();
                }
            };

            // ====================================================
            // SPEECH START
            // ====================================================

            this.recognition.onspeechstart =
                () => {
                    console.log(
                        "[VoiceService] 🗣️ Speech detected"
                    );
                };

            // ====================================================
            // SPEECH END
            // ====================================================

            this.recognition.onspeechend =
                () => {
                    console.log(
                        "[VoiceService] 🗣️ Speech ended"
                    );
                };

            console.log(
                "[VoiceService] ✅ Recognition initialized"
            );
        } catch (error) {
            console.error(
                "[VoiceService] Initialization failed:",
                error
            );

            this.recognition = null;
        }
    }

    // ============================================================
    // CHECK MICROPHONE
    // ============================================================

    async checkMicrophone() {
        if (
            typeof navigator ===
                "undefined" ||
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            throw new Error(
                "Microphone access is not supported by this browser."
            );
        }

        console.log(
            "[VoiceService] 🎤 Checking microphone..."
        );

        const stream =
            await navigator.mediaDevices.getUserMedia(
                {
                    audio: true,
                }
            );

        const tracks =
            stream.getAudioTracks();

        console.log(
            "[VoiceService] 🎤 Microphones detected:",
            tracks.length
        );

        tracks.forEach((track) => {
            console.log(
                "[VoiceService] 🎤 Device:",
                track.label
            );
        });

        /*
         * We only needed the permission check.
         * Stop the temporary stream.
         */

        tracks.forEach((track) => {
            track.stop();
        });

        if (!tracks.length) {
            throw new Error(
                "No microphone was detected."
            );
        }

        return true;
    }

    // ============================================================
    // START LISTENING
    // ============================================================

    async startListening(
        language = "hi-IN",
        callbacks = {}
    ) {
        if (!this.recognition) {
            const error =
                "Speech recognition is not supported. Please use Google Chrome or Microsoft Edge.";

            if (callbacks.onError) {
                callbacks.onError({
                    error:
                        "not-supported",

                    message:
                        error,
                });
            }

            throw new Error(error);
        }

        this.callbacks =
            callbacks;

        this.currentLanguage =
            this.normalizeLanguage(
                language
            );

        this.recognition.lang =
            this.currentLanguage;

        // Reset
        this.accumulatedFinal = "";
        this.interimTranscript = "";

        this.lastSubmittedText = "";

        this.manualStop = false;

        this.hasSubmitted = false;

        // ========================================================
        // CHECK MICROPHONE BEFORE STARTING
        // ========================================================

        try {
            await this.checkMicrophone();
        } catch (error) {
            console.error(
                "[VoiceService] ❌ Microphone check failed:",
                error
            );

            if (callbacks.onError) {
                callbacks.onError({
                    error:
                        "microphone",

                    message:
                        error.message ||
                        "Unable to access microphone.",
                });
            }

            throw error;
        }

        // ========================================================
        // START RECOGNITION
        // ========================================================

        try {
            if (this.isListening) {
                console.warn(
                    "[VoiceService] Already listening."
                );

                return true;
            }

            console.log(
                "[VoiceService] 🎤 Starting recognition..."
            );

            console.log(
                "[VoiceService] 🎤 Selected language:",
                this.currentLanguage
            );

            this.recognition.start();

            return true;
        } catch (error) {
            console.error(
                "[VoiceService] ❌ Start failed:",
                error
            );

            if (
                error.name ===
                "InvalidStateError"
            ) {
                return true;
            }

            if (callbacks.onError) {
                callbacks.onError({
                    error:
                        error.name,

                    message:
                        error.message ||
                        "Could not start microphone.",
                });
            }

            throw error;
        }
    }

    // ============================================================
    // SUBMIT FINAL TRANSCRIPT
    // ============================================================

    submitFinalTranscript() {
        if (this.hasSubmitted) {
            return;
        }

        const text =
            this.accumulatedFinal
                .replace(/\s+/g, " ")
                .trim();

        if (!text) {
            console.warn(
                "[VoiceService] ⚠️ Empty transcript."
            );

            return;
        }

        if (
            text.toLowerCase() ===
            this.lastSubmittedText.toLowerCase()
        ) {
            console.warn(
                "[VoiceService] Duplicate transcript."
            );

            return;
        }

        this.hasSubmitted = true;

        this.lastSubmittedText =
            text;

        console.log(
            "=============================================="
        );

        console.log(
            "[VoiceService] 🎤 FINAL QUERY:"
        );

        console.log(text);

        console.log(
            "=============================================="
        );

        if (
            this.callbacks
                .onFinalTranscript
        ) {
            this.callbacks.onFinalTranscript(
                text
            );
        }
    }

    // ============================================================
    // STOP LISTENING
    // ============================================================

    stopListening() {
        console.log(
            "[VoiceService] 🛑 Stopping microphone..."
        );

        this.manualStop = true;

        this.isListening = false;

        if (!this.recognition) {
            return;
        }

        try {
            this.recognition.stop();
        } catch (error) {
            console.warn(
                "[VoiceService] Stop error:",
                error
            );
        }
    }

    // ============================================================
    // ABORT
    // ============================================================

    abortListening() {
        this.manualStop = true;

        this.isListening = false;

        if (!this.recognition) {
            return;
        }

        try {
            this.recognition.abort();
        } catch (error) {
            console.warn(
                "[VoiceService] Abort error:",
                error
            );
        }
    }

    // ============================================================
    // LANGUAGE
    // ============================================================

    normalizeLanguage(
        language
    ) {
        if (!language) {
            return "hi-IN";
        }

        const value =
            String(
                language
            ).toLowerCase();

        const languages = {
            en: "en-IN",
            english: "en-IN",
            "en-in": "en-IN",

            hi: "hi-IN",
            hindi: "hi-IN",
            "hi-in": "hi-IN",

            mr: "mr-IN",
            marathi: "mr-IN",
            "mr-in": "mr-IN",

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

        return (
            languages[value] ||
            language
        );
    }

    // ============================================================
    // SUPPORT
    // ============================================================

    isSupported() {
        if (
            typeof window ===
            "undefined"
        ) {
            return false;
        }

        return Boolean(
            window.SpeechRecognition ||
            window.webkitSpeechRecognition
        );
    }

    // ============================================================
    // TEXT TO SPEECH
    // ============================================================

    speak(
        text,
        language = "hi-IN"
    ) {
        return new Promise(
            (resolve) => {
                if (
                    typeof window ===
                        "undefined" ||
                    !window.speechSynthesis
                ) {
                    resolve(false);
                    return;
                }

                if (
                    !text ||
                    !String(
                        text
                    ).trim()
                ) {
                    resolve(false);
                    return;
                }

                try {
                    window.speechSynthesis.cancel();

                    const utterance =
                        new SpeechSynthesisUtterance(
                            text
                        );

                    const targetLanguage =
                        this.normalizeLanguage(
                            language
                        );

                    utterance.lang =
                        targetLanguage;

                    utterance.rate =
                        0.95;

                    utterance.pitch =
                        1;

                    utterance.volume =
                        1;

                    const voices =
                        window.speechSynthesis.getVoices();

                    const baseLanguage =
                        targetLanguage
                            .toLowerCase()
                            .split("-")[0];

                    let selectedVoice =
                        voices.find(
                            (voice) =>
                                voice.lang
                                    ?.toLowerCase() ===
                                targetLanguage.toLowerCase()
                        );

                    if (
                        !selectedVoice
                    ) {
                        selectedVoice =
                            voices.find(
                                (voice) =>
                                    voice.lang
                                        ?.toLowerCase()
                                        .startsWith(
                                            baseLanguage
                                        )
                            );
                    }

                    if (
                        selectedVoice
                    ) {
                        utterance.voice =
                            selectedVoice;
                    }

                    utterance.onstart =
                        () => {
                            this.isSpeakingState =
                                true;
                        };

                    utterance.onend =
                        () => {
                            this.isSpeakingState =
                                false;

                            resolve(true);
                        };

                    utterance.onerror =
                        () => {
                            this.isSpeakingState =
                                false;

                            resolve(false);
                        };

                    window.speechSynthesis.speak(
                        utterance
                    );
                } catch (error) {
                    this.isSpeakingState =
                        false;

                    console.error(
                        "[VoiceService] TTS error:",
                        error
                    );

                    resolve(false);
                }
            }
        );
    }

    // ============================================================
    // PLAY AUDIO URL
    // ============================================================

    playAudioUrl(url) {
        return new Promise(
            (
                resolve,
                reject
            ) => {
                if (!url) {
                    reject(
                        new Error(
                            "No audio URL."
                        )
                    );

                    return;
                }

                const audio =
                    new Audio(url);

                this.isSpeakingState =
                    true;

                audio.onended = () => {
                    this.isSpeakingState =
                        false;

                    resolve(true);
                };

                audio.onerror = () => {
                    this.isSpeakingState =
                        false;

                    reject(
                        new Error(
                            "Audio playback failed."
                        )
                    );
                };

                audio
                    .play()
                    .catch(
                        (error) => {
                            this.isSpeakingState =
                                false;

                            reject(
                                error
                            );
                        }
                    );
            }
        );
    }

    // ============================================================
    // STOP SPEAKING
    // ============================================================

    stopSpeaking() {
        if (
            typeof window !==
                "undefined" &&
            window.speechSynthesis
        ) {
            window.speechSynthesis.cancel();
        }

        this.isSpeakingState =
            false;
    }

    // ============================================================
    // IS SPEAKING
    // ============================================================

    isSpeaking() {
        return this.isSpeakingState;
    }
}

// ============================================================
// SINGLE INSTANCE
// ============================================================

const voiceService =
    new VoiceService();

export default voiceService;
