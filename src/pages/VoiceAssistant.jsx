import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";
import voiceService from "../services/voice";

const VoiceAssistant = ({
    language = "hi",
    voiceCode = "hi-IN",
    conversationId = "default",
    onResponse,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const [transcript, setTranscript] = useState("");
    const [response, setResponse] = useState("");
    const [error, setError] = useState("");

    const conversationIdRef = useRef(
        conversationId || "default"
    );

    const mountedRef = useRef(true);

    // ============================================================
    // COMPONENT MOUNT
    // ============================================================

    useEffect(() => {
        mountedRef.current = true;

        conversationIdRef.current =
            conversationId || "default";

        return () => {
            mountedRef.current = false;

            try {
                voiceService.stopListening();
                voiceService.stopSpeaking();
            } catch (error) {
                console.warn(
                    "[VoiceAssistant] Cleanup error:",
                    error
                );
            }
        };
    }, [conversationId]);

    // ============================================================
    // LANGUAGE
    // ============================================================

    const getVoiceLanguage = () => {
        if (!voiceCode) {
            return "hi-IN";
        }

        return voiceCode;
    };

    // ============================================================
    // START LISTENING
    // ============================================================

    const startListeningSession = async () => {
        if (isListening || isProcessing) {
            return;
        }

        console.log(
            "[VoiceAssistant] 🎤 Starting microphone..."
        );

        setError("");
        setTranscript("");
        setResponse("");
        setIsListening(true);
        setIsProcessing(false);

        try {
            // Check browser support.
            if (!voiceService.isSupported()) {
                throw new Error(
                    "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
                );
            }

            const selectedLanguage =
                getVoiceLanguage();

            console.log(
                "[VoiceAssistant] Language:",
                selectedLanguage
            );

            await voiceService.startListening(
                selectedLanguage,
                {
                    // ------------------------------------------------
                    // Recognition started
                    // ------------------------------------------------

                    onStart: () => {
                        console.log(
                            "[VoiceAssistant] 🎤 Microphone started"
                        );

                        if (
                            mountedRef.current
                        ) {
                            setIsListening(true);
                            setError("");
                        }
                    },

                    // ------------------------------------------------
                    // Live transcript
                    // ------------------------------------------------

                    onResult: (result) => {
                        const text =
                            result?.transcript ||
                            "";

                        console.log(
                            "[VoiceAssistant] Transcript:",
                            text
                        );

                        if (
                            mountedRef.current
                        ) {
                            setTranscript(
                                text
                            );
                        }
                    },

                    // ------------------------------------------------
                    // Final transcript
                    // ------------------------------------------------

                    onFinalTranscript: (
                        finalText
                    ) => {
                        console.log(
                            "[VoiceAssistant] ================================="
                        );

                        console.log(
                            "[VoiceAssistant] ✅ FINAL TRANSCRIPT:"
                        );

                        console.log(
                            finalText
                        );

                        console.log(
                            "[VoiceAssistant] ================================="
                        );

                        if (
                            mountedRef.current
                        ) {
                            setIsListening(
                                false
                            );
                            setIsProcessing(
                                true
                            );
                            setTranscript(
                                finalText
                            );
                        }

                        // Send actual transcript to backend.
                        handleFinalTranscript(
                            finalText
                        );
                    },

                    // ------------------------------------------------
                    // Error
                    // ------------------------------------------------

                    onError: (voiceError) => {
                        console.error(
                            "[VoiceAssistant] ❌ Voice error:",
                            voiceError
                        );

                        if (
                            mountedRef.current
                        ) {
                            setIsListening(
                                false
                            );
                            setIsProcessing(
                                false
                            );

                            setError(
                                voiceError?.message ||
                                    "Voice recognition failed."
                            );
                        }
                    },

                    // ------------------------------------------------
                    // Recognition ended
                    // ------------------------------------------------

                    onEnd: () => {
                        console.log(
                            "[VoiceAssistant] Recognition ended"
                        );

                        if (
                            mountedRef.current &&
                            !isProcessing
                        ) {
                            setIsListening(
                                false
                            );
                        }
                    },
                }
            );
        } catch (error) {
            console.error(
                "[VoiceAssistant] ❌ Could not start microphone:",
                error
            );

            if (
                mountedRef.current
            ) {
                setIsListening(false);
                setIsProcessing(false);

                setError(
                    error?.message ||
                        "Could not start microphone."
                );
            }
        }
    };

    // ============================================================
    // STOP LISTENING
    // ============================================================

    const stopListeningSession = () => {
        console.log(
            "[VoiceAssistant] Stopping microphone..."
        );

        try {
            voiceService.stopListening();
        } catch (error) {
            console.error(
                "[VoiceAssistant] Stop error:",
                error
            );
        }

        if (mountedRef.current) {
            setIsListening(false);
        }
    };

    // ============================================================
    // HANDLE FINAL TRANSCRIPT
    // ============================================================

    const handleFinalTranscript = async (
        finalText
    ) => {
        if (!finalText) {
            console.warn(
                "[VoiceAssistant] Empty transcript."
            );

            if (mountedRef.current) {
                setIsProcessing(false);
            }

            return;
        }

        const queryText =
            finalText
                .replace(/\s+/g, " ")
                .trim();

        if (!queryText) {
            if (mountedRef.current) {
                setIsProcessing(false);
            }

            return;
        }

        console.log(
            "[VoiceAssistant] Sending query:"
        );

        console.log(queryText);

        await processVoiceQuery(
            queryText
        );
    };

    // ============================================================
    // SEND QUERY TO API
    // ============================================================

    const processVoiceQuery = async (
        queryText
    ) => {
        if (!queryText) {
            return;
        }

        console.log(
            "[VoiceAssistant] ================================="
        );

        console.log(
            "[VoiceAssistant] 🚀 PROCESSING QUERY:"
        );

        console.log(
            queryText
        );

        console.log(
            "[VoiceAssistant] ================================="
        );

        if (mountedRef.current) {
            setIsProcessing(true);
            setError("");
        }

        try {
            // Make sure microphone is stopped.
            try {
                voiceService.stopListening();
            } catch (error) {
                console.warn(
                    "[VoiceAssistant] Stop recognition warning:",
                    error
                );
            }

            // --------------------------------------------------------
            // API CALL
            // --------------------------------------------------------

            const result =
                await api.sendChatMessage(
                    queryText,
                    language,
                    "voice",
                    null,
                    conversationIdRef.current
                );

            console.log(
                "[VoiceAssistant] API response:",
                result
            );

            // --------------------------------------------------------
            // Extract answer
            // --------------------------------------------------------

            const answer =
                result?.answer ||
                result?.message ||
                result?.response ||
                "";

            if (!answer) {
                throw new Error(
                    "The AI did not return an answer."
                );
            }

            console.log(
                "[VoiceAssistant] 🤖 AI ANSWER:",
                answer
            );

            if (mountedRef.current) {
                setResponse(answer);
            }

            // Send answer to parent if required.
            if (onResponse) {
                try {
                    onResponse(result);
                } catch (callbackError) {
                    console.warn(
                        "[VoiceAssistant] onResponse callback error:",
                        callbackError
                    );
                }
            }

            // --------------------------------------------------------
            // PLAY SERVER AUDIO
            // --------------------------------------------------------

            if (result?.audio_url) {
                console.log(
                    "[VoiceAssistant] 🔊 Playing server audio..."
                );

                if (mountedRef.current) {
                    setIsSpeaking(true);
                }

                try {
                    await voiceService.playAudioUrl(
                        result.audio_url
                    );
                } catch (audioError) {
                    console.warn(
                        "[VoiceAssistant] Server audio failed:",
                        audioError
                    );

                    // Fallback to browser TTS.
                    await speakAnswer(answer);
                }

                if (mountedRef.current) {
                    setIsSpeaking(false);
                }
            } else {
                // ----------------------------------------------------
                // BROWSER TTS FALLBACK
                // ----------------------------------------------------

                await speakAnswer(answer);
            }
        } catch (error) {
            console.error(
                "[VoiceAssistant] ❌ Query processing failed:",
                error
            );

            if (mountedRef.current) {
                setError(
                    error?.message ||
                        "Unable to process your question."
                );
            }
        } finally {
            if (mountedRef.current) {
                setIsProcessing(false);
                setIsListening(false);
            }
        }
    };

    // ============================================================
    // SPEAK ANSWER
    // ============================================================

    const speakAnswer = async (
        answer
    ) => {
        if (!answer) {
            return;
        }

        try {
            console.log(
                "[VoiceAssistant] 🔊 Speaking answer..."
            );

            if (mountedRef.current) {
                setIsSpeaking(true);
            }

            await voiceService.speak(
                answer,
                getVoiceLanguage()
            );
        } catch (error) {
            console.error(
                "[VoiceAssistant] TTS error:",
                error
            );
        } finally {
            if (mountedRef.current) {
                setIsSpeaking(false);
            }
        }
    };

    // ============================================================
    // STOP SPEAKING
    // ============================================================

    const stopSpeaking = () => {
        try {
            voiceService.stopSpeaking();
        } catch (error) {
            console.warn(
                "[VoiceAssistant] Stop speaking error:",
                error
            );
        }

        if (mountedRef.current) {
            setIsSpeaking(false);
        }
    };

    // ============================================================
    // MICROPHONE BUTTON
    // ============================================================

    const handleMicrophoneClick = async () => {
        if (isSpeaking) {
            stopSpeaking();
            return;
        }

        if (isProcessing) {
            return;
        }

        if (isListening) {
            stopListeningSession();
            return;
        }

        await startListeningSession();
    };

    // ============================================================
    // QUICK TEST QUESTIONS
    // ============================================================

    const quickQuestions = [
        {
            text:
                "PM Kisan kya hai?",
            label:
                "PM Kisan kya hai?"
        },
        {
            text:
                "PM Kisan mein registration kaise karein?",
            label:
                "PM Kisan registration"
        },
        {
            text:
                "Kisan Credit Card kya hai?",
            label:
                "Kisan Credit Card"
        },
        {
            text:
                "Fasal Bima Yojana kya hai?",
            label:
                "Fasal Bima Yojana"
        },
    ];

    // ============================================================
    // QUICK QUESTION
    // ============================================================

    const handleQuickQuestion = (
        question
    ) => {
        if (
            isListening ||
            isProcessing
        ) {
            return;
        }

        setTranscript(question);

        processVoiceQuery(question);
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            {/* ---------------------------------------------------- */}
            {/* MAIN CARD */}
            {/* ---------------------------------------------------- */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
                {/* ------------------------------------------------ */}
                {/* TITLE */}
                {/* ------------------------------------------------ */}

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Sahayak AI
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Ask your question using your voice
                    </p>
                </div>

                {/* ------------------------------------------------ */}
                {/* MICROPHONE */}
                {/* ------------------------------------------------ */}

                <div className="flex flex-col items-center">
                    <button
                        type="button"
                        onClick={
                            handleMicrophoneClick
                        }
                        disabled={
                            isProcessing
                        }
                        className={`
                            relative
                            w-24
                            h-24
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-4xl
                            transition-all
                            duration-200
                            shadow-lg
                            ${
                                isListening
                                    ? "bg-red-500 text-white scale-110"
                                    : isProcessing
                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                    : isSpeaking
                                    ? "bg-blue-500 text-white"
                                    : "bg-green-600 text-white hover:bg-green-700 hover:scale-105"
                            }
                        `}
                    >
                        {isListening
                            ? "🎙️"
                            : isProcessing
                            ? "⏳"
                            : isSpeaking
                            ? "🔊"
                            : "🎤"}

                        {/* Listening animation */}
                        {isListening && (
                            <>
                                <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-50" />

                                <span className="absolute -inset-3 rounded-full border border-red-200 animate-pulse" />
                            </>
                        )}
                    </button>

                    {/* Status */}
                    <p className="mt-4 text-sm font-medium text-gray-600">
                        {isListening
                            ? "Listening... Speak now"
                            : isProcessing
                            ? "Processing your question..."
                            : isSpeaking
                            ? "Speaking..."
                            : "Tap the microphone to speak"}
                    </p>
                </div>

                {/* ------------------------------------------------ */}
                {/* ERROR */}
                {/* ------------------------------------------------ */}

                {error && (
                    <div className="mt-5 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        <strong>
                            Voice Error:
                        </strong>{" "}
                        {error}
                    </div>
                )}

                {/* ------------------------------------------------ */}
                {/* TRANSCRIPT */}
                {/* ------------------------------------------------ */}

                {transcript && (
                    <div className="mt-6">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            You said
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-gray-800">
                            {transcript}
                        </div>
                    </div>
                )}

                {/* ------------------------------------------------ */}
                {/* AI RESPONSE */}
                {/* ------------------------------------------------ */}

                {response && (
                    <div className="mt-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Sahayak AI
                        </div>

                        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-gray-800 leading-relaxed">
                            {response}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                speakAnswer(
                                    response
                                )
                            }
                            className="mt-3 px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                        >
                            🔊 Hear Answer
                        </button>
                    </div>
                )}

                {/* ------------------------------------------------ */}
                {/* QUICK QUESTIONS */}
                {/* ------------------------------------------------ */}

                <div className="mt-7">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
                        Try asking
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quickQuestions.map(
                            (
                                question,
                                index
                            ) => (
                                <button
                                    key={
                                        index
                                    }
                                    type="button"
                                    onClick={() =>
                                        handleQuickQuestion(
                                            question.text
                                        )
                                    }
                                    disabled={
                                        isListening ||
                                        isProcessing
                                    }
                                    className="text-left px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {question.label}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* DEBUG INFORMATION */}
            {/* ---------------------------------------------------- */}

            {process.env.NODE_ENV ===
                "development" && (
                <div className="mt-4 rounded-lg bg-gray-900 text-green-400 p-4 text-xs font-mono">
                    <div>
                        Listening:{" "}
                        {String(
                            isListening
                        )}
                    </div>

                    <div>
                        Processing:{" "}
                        {String(
                            isProcessing
                        )}
                    </div>

                    <div>
                        Speaking:{" "}
                        {String(
                            isSpeaking
                        )}
                    </div>

                    <div>
                        Language:{" "}
                        {getVoiceLanguage()}
                    </div>

                    <div className="mt-2">
                        Transcript:{" "}
                        {transcript ||
                            "(empty)"}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAssistant;
