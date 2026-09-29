import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import voiceService from "../services/voice";

const VoiceAssistant = () => {
    // ============================================================
    // LANGUAGE
    // ============================================================

    const languageContext = useLanguage();

    const selectedLanguage =
        languageContext?.language ||
        languageContext?.currentLanguage ||
        "hi";

    const getVoiceCode = () => {
        const language = String(
            selectedLanguage || "hi"
        ).toLowerCase();

        const languageMap = {
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

        return languageMap[language] || "hi-IN";
    };

    // ============================================================
    // STATE
    // ============================================================

    const [isListening, setIsListening] =
        useState(false);

    const [isProcessing, setIsProcessing] =
        useState(false);

    const [isSpeaking, setIsSpeaking] =
        useState(false);

    const [transcript, setTranscript] =
        useState("");

    const [response, setResponse] =
        useState("");

    const [error, setError] =
        useState("");

    // ============================================================
    // REFS
    // ============================================================

    const mountedRef = useRef(true);

    const conversationIdRef =
        useRef(
            `voice-${Date.now()}`
        );

    // Prevent duplicate queries
    const lastQueryRef = useRef("");

    // ============================================================
    // MOUNT / UNMOUNT
    // ============================================================

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;

            try {
                voiceService.stopListening();
            } catch (error) {
                console.warn(
                    "[VoiceAssistant] Stop listening cleanup:",
                    error
                );
            }

            try {
                voiceService.stopSpeaking();
            } catch (error) {
                console.warn(
                    "[VoiceAssistant] Stop speaking cleanup:",
                    error
                );
            }
        };
    }, []);

    // ============================================================
    // START LISTENING
    // ============================================================

    const startListeningSession =
        async () => {
            console.log(
                "[VoiceAssistant] 🎤 Starting voice input..."
            );

            setError("");
            setTranscript("");
            setResponse("");

            // Check browser support
            if (
                !voiceService.isSupported()
            ) {
                const message =
                    "Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.";

                console.error(
                    "[VoiceAssistant]",
                    message
                );

                setError(message);
                return;
            }

            // Stop previous speech
            try {
                voiceService.stopSpeaking();
            } catch (error) {
                console.warn(
                    "[VoiceAssistant] Could not stop previous speech:",
                    error
                );
            }

            setIsSpeaking(false);
            setIsProcessing(false);
            setIsListening(true);

            const voiceCode =
                getVoiceCode();

            console.log(
                "[VoiceAssistant] Voice language:",
                voiceCode
            );

            try {
                await voiceService.startListening(
                    voiceCode,
                    {
                        // =========================================
                        // START
                        // =========================================

                        onStart: () => {
                            console.log(
                                "[VoiceAssistant] 🎤 Microphone started"
                            );

                            if (
                                mountedRef.current
                            ) {
                                setIsListening(
                                    true
                                );

                                setError(
                                    ""
                                );
                            }
                        },

                        // =========================================
                        // LIVE RESULT
                        // =========================================

                        onResult: (
                            result
                        ) => {
                            const text =
                                result?.transcript ||
                                "";

                            console.log(
                                "[VoiceAssistant] Live transcript:",
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

                        // =========================================
                        // FINAL RESULT
                        // =========================================

                        onFinalTranscript: (
                            finalText
                        ) => {
                            const cleanText =
                                String(
                                    finalText ||
                                        ""
                                )
                                    .replace(
                                        /\s+/g,
                                        " "
                                    )
                                    .trim();

                            console.log(
                                "[VoiceAssistant] =================================="
                            );

                            console.log(
                                "[VoiceAssistant] 🎤 FINAL VOICE INPUT:"
                            );

                            console.log(
                                cleanText
                            );

                            console.log(
                                "[VoiceAssistant] =================================="
                            );

                            if (
                                !cleanText
                            ) {
                                console.warn(
                                    "[VoiceAssistant] Empty final transcript."
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
                                }

                                return;
                            }

                            if (
                                mountedRef.current
                            ) {
                                setTranscript(
                                    cleanText
                                );

                                setIsListening(
                                    false
                                );

                                setIsProcessing(
                                    true
                                );
                            }

                            handleFinalTranscript(
                                cleanText
                            );
                        },

                        // =========================================
                        // ERROR
                        // =========================================

                        onError: (
                            voiceError
                        ) => {
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

                        // =========================================
                        // END
                        // =========================================

                        onEnd: () => {
                            console.log(
                                "[VoiceAssistant] Voice recognition ended."
                            );

                            if (
                                mountedRef.current
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
                    "[VoiceAssistant] ❌ Failed to start voice:",
                    error
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
                        error?.message ||
                            "Unable to access microphone."
                    );
                }
            }
        };

    // ============================================================
    // STOP LISTENING
    // ============================================================

    const stopListeningSession =
        () => {
            console.log(
                "[VoiceAssistant] 🛑 Stopping voice input..."
            );

            try {
                voiceService.stopListening();
            } catch (error) {
                console.error(
                    "[VoiceAssistant] Stop error:",
                    error
                );
            }

            if (
                mountedRef.current
            ) {
                setIsListening(
                    false
                );
            }
        };

    // ============================================================
    // FINAL TRANSCRIPT
    // ============================================================

    const handleFinalTranscript =
        async (text) => {
            const query =
                String(text || "")
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();

            if (!query) {
                setIsProcessing(
                    false
                );
                return;
            }

            // Prevent accidental duplicate query
            if (
                query.toLowerCase() ===
                lastQueryRef.current.toLowerCase()
            ) {
                console.warn(
                    "[VoiceAssistant] Duplicate query ignored:",
                    query
                );

                setIsProcessing(
                    false
                );

                return;
            }

            lastQueryRef.current =
                query;

            console.log(
                "[VoiceAssistant] Sending voice query to API:",
                query
            );

            await processVoiceQuery(
                query
            );
        };

    // ============================================================
    // PROCESS QUERY
    // ============================================================

    const processVoiceQuery =
        async (queryText) => {
            if (!queryText) {
                return;
            }

            setIsProcessing(true);
            setError("");

            try {
                // Make sure microphone isn't still running.
                try {
                    voiceService.stopListening();
                } catch (error) {
                    console.warn(
                        "[VoiceAssistant] Stop warning:",
                        error
                    );
                }

                // =================================================
                // SEND EXACT TRANSCRIPT TO BACKEND
                // =================================================

                console.log(
                    "[VoiceAssistant] 🚀 POST /api/chat"
                );

                console.log(
                    "[VoiceAssistant] message:",
                    queryText
                );

                console.log(
                    "[VoiceAssistant] language:",
                    selectedLanguage
                );

                console.log(
                    "[VoiceAssistant] input_mode: voice"
                );

                const result =
                    await api.sendChatMessage(
                        queryText,
                        selectedLanguage,
                        "voice",
                        null,
                        conversationIdRef.current
                    );

                console.log(
                    "[VoiceAssistant] ✅ API response:",
                    result
                );

                // =================================================
                // GET ANSWER
                // =================================================

                const answer =
                    result?.answer ||
                    result?.message ||
                    result?.response ||
                    "";

                if (!answer) {
                    throw new Error(
                        "Sahayak AI did not return an answer."
                    );
                }

                console.log(
                    "[VoiceAssistant] 🤖 Answer:",
                    answer
                );

                if (
                    mountedRef.current
                ) {
                    setResponse(
                        answer
                    );
                }

                // =================================================
                // SERVER AUDIO
                // =================================================

                if (
                    result?.audio_url
                ) {
                    console.log(
                        "[VoiceAssistant] 🔊 Playing server audio..."
                    );

                    if (
                        mountedRef.current
                    ) {
                        setIsSpeaking(
                            true
                        );
                    }

                    try {
                        await voiceService.playAudioUrl(
                            result.audio_url
                        );
                    } catch (audioError) {
                        console.warn(
                            "[VoiceAssistant] Server audio failed. Using browser TTS.",
                            audioError
                        );

                        await speakAnswer(
                            answer
                        );
                    }

                    if (
                        mountedRef.current
                    ) {
                        setIsSpeaking(
                            false
                        );
                    }
                } else {
                    // =================================================
                    // BROWSER TTS FALLBACK
                    // =================================================

                    await speakAnswer(
                        answer
                    );
                }
            } catch (error) {
                console.error(
                    "[VoiceAssistant] ❌ API processing error:",
                    error
                );

                if (
                    mountedRef.current
                ) {
                    setError(
                        error?.message ||
                            "Unable to process your question."
                    );
                }
            } finally {
                if (
                    mountedRef.current
                ) {
                    setIsProcessing(
                        false
                    );

                    setIsListening(
                        false
                    );
                }
            }
        };

    // ============================================================
    // SPEAK ANSWER
    // ============================================================

    const speakAnswer =
        async (answer) => {
            if (!answer) {
                return;
            }

            try {
                if (
                    mountedRef.current
                ) {
                    setIsSpeaking(
                        true
                    );
                }

                console.log(
                    "[VoiceAssistant] 🔊 Browser TTS..."
                );

                await voiceService.speak(
                    answer,
                    getVoiceCode()
                );
            } catch (error) {
                console.error(
                    "[VoiceAssistant] TTS error:",
                    error
                );
            } finally {
                if (
                    mountedRef.current
                ) {
                    setIsSpeaking(
                        false
                    );
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
                "[VoiceAssistant] Stop TTS error:",
                error
            );
        }

        setIsSpeaking(false);
    };

    // ============================================================
    // MICROPHONE BUTTON
    // ============================================================

    const handleMicrophoneClick =
        async () => {
            if (isProcessing) {
                return;
            }

            if (isSpeaking) {
                stopSpeaking();
                return;
            }

            if (isListening) {
                stopListeningSession();
                return;
            }

            await startListeningSession();
        };

    // ============================================================
    // QUICK QUESTIONS
    // ============================================================

    const quickQuestions = [
        "PM Kisan kya hai?",
        "PM Kisan mein registration kaise karein?",
        "Kisan Credit Card kya hai?",
        "Fasal Bima Yojana kya hai?",
    ];

    const handleQuickQuestion =
        async (question) => {
            if (
                isListening ||
                isProcessing
            ) {
                return;
            }

            console.log(
                "[VoiceAssistant] Quick question:",
                question
            );

            setTranscript(
                question
            );

            setError("");

            await processVoiceQuery(
                question
            );
        };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="w-full max-w-2xl mx-auto p-4">

            {/* ================================================== */}
            {/* CARD */}
            {/* ================================================== */}

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">

                {/* ================================================== */}
                {/* HEADER */}
                {/* ================================================== */}

                <div className="text-center mb-6">

                    <h2 className="text-2xl font-bold text-gray-900">
                        Sahayak AI
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                        आपका डिजिटल किसान सहायक
                    </p>

                </div>

                {/* ================================================== */}
                {/* MICROPHONE */}
                {/* ================================================== */}

                <div className="flex flex-col items-center">

                    <button
                        type="button"
                        onClick={
                            handleMicrophoneClick
                        }
                        disabled={
                            isProcessing
                        }
                        aria-label={
                            isListening
                                ? "Stop listening"
                                : "Start voice input"
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
                            shadow-xl
                            transition-all
                            duration-200
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

                        {isListening && (
                            <>
                                <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-50" />

                                <span className="absolute -inset-3 rounded-full border border-red-200 animate-pulse" />
                            </>
                        )}

                    </button>

                    {/* ================================================== */}
                    {/* STATUS */}
                    {/* ================================================== */}

                    <p className="mt-4 text-sm font-medium text-gray-600 text-center">

                        {isListening
                            ? "🎤 सुन रहा हूँ... बोलिए"
                            : isProcessing
                            ? "⏳ जवाब तैयार हो रहा है..."
                            : isSpeaking
                            ? "🔊 जवाब सुनिए..."
                            : "🎤 माइक्रोफोन दबाकर बोलें"}

                    </p>

                </div>

                {/* ================================================== */}
                {/* ERROR */}
                {/* ================================================== */}

                {error && (
                    <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">

                        <div className="font-semibold mb-1">
                            Voice Error
                        </div>

                        <div>
                            {error}
                        </div>

                    </div>
                )}

                {/* ================================================== */}
                {/* TRANSCRIPT */}
                {/* ================================================== */}

                {transcript && (
                    <div className="mt-6">

                        <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                            आपने पूछा
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-800">

                            {transcript}

                        </div>

                    </div>
                )}

                {/* ================================================== */}
                {/* RESPONSE */}
                {/* ================================================== */}

                {response && (
                    <div className="mt-5">

                        <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                            Sahayak AI
                        </div>

                        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-gray-800 leading-relaxed">

                            {response}

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                speakAnswer(
                                    response
                                )
                            }
                            className="mt-3 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm"
                        >
                            🔊 जवाब सुनें
                        </button>

                    </div>
                )}

                {/* ================================================== */}
                {/* QUICK QUESTIONS */}
                {/* ================================================== */}

                <div className="mt-7">

                    <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
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
                                    disabled={
                                        isListening ||
                                        isProcessing
                                    }
                                    onClick={() =>
                                        handleQuickQuestion(
                                            question
                                        )
                                    }
                                    className="text-left p-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700"
                                >
                                    {question}
                                </button>
                            )
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default VoiceAssistant;
