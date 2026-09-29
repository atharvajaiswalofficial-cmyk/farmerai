// ============================================================
// Sahayak AI Voice Service
// ============================================================

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

        this.manualStop = false;
        this.shouldSubmit = false;

        this.currentLanguage = "hi-IN";

        this.initializeRecognition();
    }

    // ============================================================
    // INITIALIZE SPEECH RECOGNITION
    // ============================================================

    initializeRecognition() {
        if (
            typeof window ===
            "undefined"
        ) {
            return;
        }

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error(
                "[VoiceService] Speech Recognition is not supported."
            );

            this.recognition = null;

            return;
        }

        try {
            this.recognition =
                new SpeechRecognition();

            /*
             * continuous:
             * Allows longer sentences.
             *
             * interimResults:
             * Shows live transcript while speaking.
             */

            this.recognition.continuous =
                true;

            this.recognition.interimResults =
                true;

            this.recognition.maxAlternatives =
                1;

            this.recognition.lang =
                this.currentLanguage;

            // ====================================================
            // START
            // ====================================================

            this.recognition.onstart =
                () => {
                    console.log(
                        "[VoiceService] 🎤 Recognition started"
                    );

                    this.isListening =
                        true;

                    if (
                        this.callbacks
                            .onStart
                    ) {
                        this.callbacks.onStart();
                    }
                };

            // ====================================================
            // RESULT
            // ====================================================

            this.recognition.onresult =
                (event) => {
                    let newFinalText =
                        "";

                    let newInterimText =
                        "";

                    for (
                        let i =
                            event.resultIndex;
                        i <
                        event.results.length;
                        i++
                    ) {
                        const result =
                            event.results[
                                i
                            ];

                        const transcript =
                            result[0]
                                ?.transcript ||
                            "";

                        if (
                            result.isFinal
                        ) {
                            newFinalText +=
                                transcript +
                                " ";
                        } else {
                            newInterimText +=
                                transcript;
                        }
                    }

                    // --------------------------------------------
                    // FINAL TEXT
                    // --------------------------------------------

                    if (
                        newFinalText.trim()
                    ) {
                        this.accumulatedFinal +=
                            newFinalText.trim() +
                            " ";
                    }

                    // --------------------------------------------
                    // INTERIM TEXT
                    // --------------------------------------------

                    this.interimTranscript =
                        newInterimText;

                    // --------------------------------------------
                    // DISPLAY TEXT
                    // --------------------------------------------

                    const displayTranscript =
                        `${this.accumulatedFinal} ${this.interimTranscript}`
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim();

                    console.log(
                        "[VoiceService] Transcript:",
                        displayTranscript
                    );

                    if (
                        this.callbacks
                            .onResult
                    ) {
                        this.callbacks.onResult(
                            {
                                transcript:
                                    displayTranscript,

                                final:
                                    Boolean(
                                        newFinalText.trim()
                                    ),
                            }
                        );
                    }

                    // --------------------------------------------
                    // FINAL SPEECH SEGMENT
                    // --------------------------------------------

                    if (
                        newFinalText.trim()
                    ) {
                        console.log(
                            "[VoiceService] Final speech segment:",
                            newFinalText.trim()
                        );

                        this.scheduleSubmit();
                    }
                };

            // ====================================================
            // ERROR
            // ====================================================

            this.recognition.onerror =
                (event) => {
                    console.error(
                        "[VoiceService] ❌ Recognition error:",
                        event.error
                    );

                    this.isListening =
                        false;

                    let message =
                        "Voice recognition failed.";

                    switch (
                        event.error
                    ) {
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
                                "Microphone could not be accessed. Please check your microphone.";
                            break;

                        case "network":
                            message =
                                "Speech recognition requires an internet connection.";
                            break;

                        case "aborted":
                            message =
                                "Voice recognition stopped.";
                            break;

                        default:
                            message =
                                `Voice recognition error: ${event.error}`;
                    }

                    if (
                        this.callbacks
                            .onError
                    ) {
                        this.callbacks.onError(
                            {
                                error:
                                    event.error,

                                message,
                            }
                        );
                    }
                };

            // ====================================================
            // END
            // ====================================================

            this.recognition.onend =
                () => {
                    console.log(
                        "[VoiceService] Recognition ended"
                    );

                    this.isListening =
                        false;

                    /*
                     * If Chrome ends recognition automatically
                     * and we have final text, submit it.
                     */

                    if (
                        !this.manualStop &&
                        this.accumulatedFinal.trim() &&
                        !this.shouldSubmit
                    ) {
                        this.submitFinalTranscript();
                    }

                    if (
                        this.callbacks
                            .onEnd
                    ) {
                        this.callbacks.onEnd();
                    }
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
    // START LISTENING
    // ============================================================

    startListening(
        language = "hi-IN",
        callbacks = {}
    ) {
        return new Promise(
            (
                resolve,
                reject
            ) => {
                if (
                    !this.recognition
                ) {
                    const error =
                        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.";

                    console.error(
                        "[VoiceService]",
                        error
                    );

                    if (
                        callbacks.onError
                    ) {
                        callbacks.onError(
                            {
                                error:
                                    "not-supported",

                                message:
                                    error,
                            }
                        );
                    }

                    reject(
                        new Error(error)
                    );

                    return;
                }

                this.callbacks =
                    callbacks;

                this.currentLanguage =
                    this.normalizeLanguage(
                        language
                    );

                this.recognition.lang =
                    this.currentLanguage;

                console.log(
                    "[VoiceService] Language:",
                    this.currentLanguage
                );

                // Reset state
                this.accumulatedFinal =
                    "";

                this.interimTranscript =
                    "";

                this.lastSubmittedText =
                    "";

                this.manualStop =
                    false;

                this.shouldSubmit =
                    false;

                if (
                    this.submitTimer
                ) {
                    clearTimeout(
                        this.submitTimer
                    );

                    this.submitTimer =
                        null;
                }

                try {
                    if (
                        this.isListening
                    ) {
                        console.warn(
                            "[VoiceService] Recognition already running."
                        );

                        resolve(true);

                        return;
                    }

                    console.log(
                        "[VoiceService] 🎤 Starting microphone..."
                    );

                    this.recognition.start();

                    resolve(true);
                } catch (error) {
                    console.error(
                        "[VoiceService] Start error:",
                        error
                    );

                    if (
                        error.name ===
                        "InvalidStateError"
                    ) {
                        resolve(true);

                        return;
                    }

                    if (
                        callbacks.onError
                    ) {
                        callbacks.onError(
                            {
                                error:
                                    error.name,

                                message:
                                    error.message ||
                                    "Could not start microphone.",
                            }
                        );
                    }

                    reject(error);
                }
            }
        );
    }

    // ============================================================
    // SCHEDULE SUBMISSION
    // ============================================================

    scheduleSubmit() {
        if (
            this.submitTimer
        ) {
            clearTimeout(
                this.submitTimer
            );
        }

        /*
         * Wait 1.2 seconds after final speech.
         *
         * This prevents partial queries such as:
         *
         * "PM Kisan..."
         *
         * from being submitted too early.
         */

        this.submitTimer =
            setTimeout(
                () => {
                    this.submitFinalTranscript();
                },
                1200
            );
    }

    // ============================================================
    // SUBMIT FINAL TRANSCRIPT
    // ============================================================

    submitFinalTranscript() {
        if (
            this.shouldSubmit
        ) {
            return;
        }

        const finalText =
            this.accumulatedFinal
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

        if (!finalText) {
            console.warn(
                "[VoiceService] No final transcript."
            );

            return;
        }

        if (
            finalText.toLowerCase() ===
            this.lastSubmittedText.toLowerCase()
        ) {
            console.warn(
                "[VoiceService] Duplicate transcript ignored."
            );

            return;
        }

        this.shouldSubmit =
            true;

        this.lastSubmittedText =
            finalText;

        console.log(
            "=============================================="
        );

        console.log(
            "[VoiceService] 🎤 FINAL QUERY:"
        );

        console.log(
            finalText
        );

        console.log(
            "=============================================="
        );

        if (
            this.callbacks
                .onFinalTranscript
        ) {
            this.callbacks.onFinalTranscript(
                finalText
            );
        }

        this.stopListening();
    }

    // ============================================================
    // STOP LISTENING
    // ============================================================

    stopListening() {
        this.manualStop =
            true;

        this.isListening =
            false;

        if (
            this.submitTimer
        ) {
            clearTimeout(
                this.submitTimer
            );

            this.submitTimer =
                null;
        }

        if (
            !this.recognition
        ) {
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
    // ABORT
    // ============================================================

    abortListening() {
        this.manualStop =
            true;

        this.isListening =
            false;

        if (
            this.submitTimer
        ) {
            clearTimeout(
                this.submitTimer
            );

            this.submitTimer =
                null;
        }

        if (
            !this.recognition
        ) {
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
    // NORMALIZE LANGUAGE
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
    // CHECK SUPPORT
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
                    console.warn(
                        "[VoiceService] Speech synthesis unavailable."
                    );

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

                    const voiceLanguage =
                        this.normalizeLanguage(
                            language
                        );

                    utterance.lang =
                        voiceLanguage;

                    utterance.rate =
                        0.95;

                    utterance.pitch =
                        1;

                    utterance.volume =
                        1;

                    const voices =
                        window.speechSynthesis.getVoices();

                    const targetLanguage =
                        voiceLanguage.toLowerCase();

                    const baseLanguage =
                        targetLanguage.split(
                            "-"
                        )[0];

                    let selectedVoice =
                        voices.find(
                            (
                                voice
                            ) =>
                                voice.lang
                                    ?.toLowerCase() ===
                                targetLanguage
                        );

                    if (
                        !selectedVoice
                    ) {
                        selectedVoice =
                            voices.find(
                                (
                                    voice
                                ) =>
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

                            console.log(
                                "[VoiceService] 🔊 TTS started"
                            );
                        };

                    utterance.onend =
                        () => {
                            this.isSpeakingState =
                                false;

                            console.log(
                                "[VoiceService] 🔊 TTS ended"
                            );

                            resolve(true);
                        };

                    utterance.onerror =
                        (error) => {
                            this.isSpeakingState =
                                false;

                            console.error(
                                "[VoiceService] TTS error:",
                                error
                            );

                            resolve(false);
                        };

                    window.speechSynthesis.speak(
                        utterance
                    );
                } catch (error) {
                    this.isSpeakingState =
                        false;

                    console.error(
                        "[VoiceService] TTS exception:",
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

    playAudioUrl(
        url
    ) {
        return new Promise(
            (
                resolve,
                reject
            ) => {
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
                        new Audio(
                            url
                        );

                    audio.preload =
                        "auto";

                    audio.onplay =
                        () => {
                            this.isSpeakingState =
                                true;
                        };

                    audio.onended =
                        () => {
                            this.isSpeakingState =
                                false;

                            resolve(true);
                        };

                    audio.onerror =
                        (error) => {
                            this.isSpeakingState =
                                false;

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

                    audio
                        .play()
                        .catch(
                            (
                                error
                            ) => {
                                this.isSpeakingState =
                                    false;

                                reject(
                                    error
                                );
                            }
                        );
                } catch (error) {
                    reject(error);
                }
            }
        );
    }

    // ============================================================
    // SERVER TTS
    // ============================================================

    async playServerTTS(
        text,
        language = "hi"
    ) {
        try {
            if (
                !text ||
                !String(
                    text
                ).trim()
            ) {
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

                        body:
                            JSON.stringify(
                                {
                                    text,
                                    language,
                                }
                            ),
                    }
                );

            if (
                !response.ok
            ) {
                throw new Error(
                    `TTS request failed: ${response.status}`
                );
            }

            const data =
                await response.json();

            if (
                data?.audio_url
            ) {
                await this.playAudioUrl(
                    data.audio_url
                );

                return true;
            }

            if (
                data?.url
            ) {
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

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default voiceService;
