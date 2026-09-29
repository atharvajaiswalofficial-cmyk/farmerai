import React, {
    useState,
    useEffect,
    useRef,
} from "react";

import {
    useAuth,
} from "../context/AuthContext";

import {
    useLanguage,
} from "../context/LanguageContext";

import api from "../services/api";
import voiceService from "../services/voice";

import {
    Send,
    Sparkles,
    Bot,
    FileText,
    ExternalLink,
    Loader2,
    Globe,
    ShieldCheck,
    Trash2,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Compass,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

export default function AIChat() {
    // ============================================================
    // CONTEXT
    // ============================================================

    const {
        user,
        isAuthenticated,
    } = useAuth();

    const {
        currentLanguage,
        setLanguage,
        languages,
        getVoiceCode,
        t,
        openLanguageModal,
    } = useLanguage();

    // ============================================================
    // STATE
    // ============================================================

    const [
        messages,
        setMessages,
    ] = useState([
        {
            id: 0,
            sender: "bot",
            text: t(
                "chat.greeting"
            ),
            language:
                currentLanguage,
            grounded: true,
            sources: [],
        },
    ]);

    const [
        inputMessage,
        setInputMessage,
    ] = useState("");

    const [
        isLoading,
        setIsLoading,
    ] = useState(false);

    const [
        isRecording,
        setIsRecording,
    ] = useState(false);

    const [
        speakingMsgId,
        setSpeakingMsgId,
    ] = useState(null);

    const [
        micError,
        setMicError,
    ] = useState(null);

    const messagesEndRef =
        useRef(null);

    const conversationIdRef =
        useRef(
            `conversation-${Date.now()}`
        );

    // ============================================================
    // SCROLL
    // ============================================================

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView(
            {
                behavior: "smooth",
            }
        );
    }, [messages]);

    // ============================================================
    // UPDATE GREETING
    // ============================================================

    useEffect(() => {
        setMessages(
            (prev) => {
                if (
                    prev.length === 1 &&
                    prev[0].id === 0
                ) {
                    return [
                        {
                            ...prev[0],
                            text: t(
                                "chat.greeting"
                            ),
                            language:
                                currentLanguage,
                        },
                    ];
                }

                return prev;
            }
        );
    }, [
        currentLanguage,
        t,
    ]);

    // ============================================================
    // LOAD CHAT HISTORY
    // ============================================================

    useEffect(() => {
        async function loadHistory() {
            if (
                !isAuthenticated
            ) {
                return;
            }

            try {
                const hist =
                    await api.getChatHistory();

                if (
                    hist &&
                    hist.length > 0
                ) {
                    const formatted =
                        [];

                    formatted.push({
                        id: "greeting",
                        sender:
                            "bot",
                        text: t(
                            "chat.greeting"
                        ),
                        language:
                            currentLanguage,
                        grounded:
                            true,
                        sources: [],
                    });

                    [
                        ...hist,
                    ]
                        .reverse()
                        .forEach(
                            (h) => {
                                formatted.push(
                                    {
                                        id: `q-${h.id}`,
                                        sender:
                                            "user",
                                        text:
                                            h.question,
                                        language:
                                            h.language,
                                    }
                                );

                                formatted.push(
                                    {
                                        id: `a-${h.id}`,
                                        sender:
                                            "bot",
                                        text:
                                            h.answer,
                                        topic:
                                            h.topic,
                                        language:
                                            h.language,
                                        grounded:
                                            true,
                                        sources:
                                            [],
                                    }
                                );
                            }
                        );

                    setMessages(
                        formatted
                    );
                }
            } catch (err) {
                console.warn(
                    "Could not load chat history:",
                    err
                );
            }
        }

        loadHistory();
    }, [
        isAuthenticated,
        currentLanguage,
        t,
    ]);

    // ============================================================
    // SEND MESSAGE
    // ============================================================

    const handleSendMessage =
        async (
            e,
            overrideText = null,
            mode = "text"
        ) => {
            if (e) {
                e.preventDefault();
            }

            const query = (
                overrideText ||
                inputMessage
            )
                .trim();

            if (
                !query ||
                isLoading
            ) {
                return;
            }

            console.log(
                "[AIChat] =================================="
            );

            console.log(
                "[AIChat] Sending query:",
                query
            );

            console.log(
                "[AIChat] Mode:",
                mode
            );

            console.log(
                "[AIChat] Language:",
                currentLanguage
            );

            console.log(
                "[AIChat] =================================="
            );

            // Stop current speech
            voiceService.stopSpeaking();

            setSpeakingMsgId(
                null
            );

            // ========================================================
            // USER MESSAGE
            // ========================================================

            const userMsgId =
                Date.now();

            const newMessages = [
                ...messages,
                {
                    id: userMsgId,
                    sender: "user",
                    text: query,
                    language:
                        currentLanguage,
                },
            ];

            setMessages(
                newMessages
            );

            setInputMessage("");

            setIsLoading(true);

            try {
                // ====================================================
                // API
                // ====================================================

                const response =
                    await api.sendChatMessage(
                        query,
                        currentLanguage,
                        mode,
                        user?.id ||
                            null,
                        conversationIdRef.current
                    );

                console.log(
                    "[AIChat] API response:",
                    response
                );

                // ====================================================
                // ANSWER
                // ====================================================

                const botMsgId =
                    response?.chat_id ||
                    Date.now() + 1;

                const answerText =
                    response?.answer ||
                    response?.message ||
                    response?.response ||
                    "Answer retrieved successfully.";

                // ====================================================
                // BOT MESSAGE
                // ====================================================

                setMessages([
                    ...newMessages,
                    {
                        id: botMsgId,
                        sender:
                            "bot",
                        text: answerText,
                        language:
                            response?.language ||
                            currentLanguage,
                        topic:
                            response?.topic,
                        source:
                            response?.source,
                        grounded:
                            response?.grounded,
                        ai_generated:
                            response?.ai_generated,
                        sources:
                            response?.sources ||
                            [],
                    },
                ]);

                // ====================================================
                // VOICE RESPONSE
                // ====================================================

                if (
                    mode ===
                        "voice" &&
                    answerText
                ) {
                    const targetVoice =
                        getVoiceCode();

                    setSpeakingMsgId(
                        botMsgId
                    );

                    try {
                        if (
                            response?.audio_url
                        ) {
                            await voiceService.playAudioUrl(
                                response.audio_url
                            );
                        } else {
                            await voiceService.speak(
                                answerText,
                                targetVoice
                            );
                        }
                    } catch (
                        voiceError
                    ) {
                        console.error(
                            "[AIChat] TTS error:",
                            voiceError
                        );
                    } finally {
                        setSpeakingMsgId(
                            null
                        );
                    }
                }
            } catch (err) {
                console.error(
                    "[AIChat] Chat error:",
                    err
                );

                setMessages([
                    ...newMessages,
                    {
                        id:
                            Date.now() +
                            1,
                        sender:
                            "bot",
                        text: t(
                            "common.error"
                        ),
                        grounded:
                            false,
                        sources: [],
                    },
                ]);
            } finally {
                setIsLoading(
                    false
                );
            }
        };

    // ============================================================
    // MICROPHONE
    // ============================================================

    const handleMicToggle =
        async () => {
            setMicError(null);

            // --------------------------------------------------------
            // STOP RECORDING
            // --------------------------------------------------------

            if (
                isRecording
            ) {
                console.log(
                    "[AIChat] 🛑 Stopping microphone..."
                );

                voiceService.stopListening();

                setIsRecording(
                    false
                );

                return;
            }

            // --------------------------------------------------------
            // START RECORDING
            // --------------------------------------------------------

            try {
                if (
                    !voiceService.isSupported()
                ) {
                    throw new Error(
                        "Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
                    );
                }

                const voiceCode =
                    getVoiceCode();

                console.log(
                    "[AIChat] 🎤 Starting microphone:",
                    voiceCode
                );

                setIsRecording(
                    true
                );

                await voiceService.startListening(
                    voiceCode,
                    {
                        // ============================================
                        // START
                        // ============================================

                        onStart:
                            () => {
                                console.log(
                                    "[AIChat] 🎤 Microphone started"
                                );

                                setIsRecording(
                                    true
                                );
                            },

                        // ============================================
                        // LIVE RESULT
                        // ============================================

                        onResult:
                            (
                                res
                            ) => {
                                if (
                                    res?.transcript
                                ) {
                                    console.log(
                                        "[AIChat] Live transcript:",
                                        res.transcript
                                    );

                                    setInputMessage(
                                        res.transcript
                                    );
                                }
                            },

                        // ============================================
                        // FINAL TRANSCRIPT
                        // ============================================

                        onFinalTranscript:
                            async (
                                finalText
                            ) => {
                                const query =
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
                                    "[AIChat] =================================="
                                );

                                console.log(
                                    "[AIChat] 🎤 FINAL QUERY:"
                                );

                                console.log(
                                    query
                                );

                                console.log(
                                    "[AIChat] =================================="
                                );

                                setIsRecording(
                                    false
                                );

                                if (
                                    !query
                                ) {
                                    return;
                                }

                                await handleSendMessage(
                                    null,
                                    query,
                                    "voice"
                                );
                            },

                        // ============================================
                        // ERROR
                        // ============================================

                        onError:
                            (
                                err
                            ) => {
                                console.error(
                                    "[AIChat] ❌ Voice error:",
                                    err
                                );

                                setIsRecording(
                                    false
                                );

                                const message =
                                    err?.message ||
                                    String(
                                        err ||
                                            ""
                                    );

                                if (
                                    message &&
                                    !message
                                        .toLowerCase()
                                        .includes(
                                            "no-speech"
                                        )
                                ) {
                                    setMicError(
                                        message
                                    );
                                }
                            },

                        // ============================================
                        // END
                        // ============================================

                        onEnd:
                            () => {
                                console.log(
                                    "[AIChat] Recognition ended"
                                );

                                setIsRecording(
                                    false
                                );
                            },
                    }
                );
            } catch (error) {
                console.error(
                    "[AIChat] ❌ Could not start microphone:",
                    error
                );

                setIsRecording(
                    false
                );

                setMicError(
                    error?.message ||
                        "Could not start microphone."
                );
            }
        };

    // ============================================================
    // SPEAK MESSAGE
    // ============================================================

    const handleSpeakToggle =
        async (
            msgId,
            text,
            lang
        ) => {
            // Stop
            if (
                speakingMsgId ===
                msgId
            ) {
                voiceService.stopSpeaking();

                setSpeakingMsgId(
                    null
                );

                return;
            }

            setSpeakingMsgId(
                msgId
            );

            try {
                const targetLang =
                    getVoiceCode();

                await voiceService.speak(
                    text,
                    targetLang
                );
            } catch (error) {
                console.error(
                    "[AIChat] TTS error:",
                    error
                );
            } finally {
                setSpeakingMsgId(
                    null
                );
            }
        };

    // ============================================================
    // CLEAR HISTORY
    // ============================================================

    const handleClearHistory =
        async () => {
            try {
                if (
                    isAuthenticated
                ) {
                    await api.clearChatHistory();
                }

                setMessages([
                    {
                        id: Date.now(),
                        sender:
                            "bot",
                        text: t(
                            "chat.greeting"
                        ),
                        language:
                            currentLanguage,
                        grounded:
                            true,
                        sources: [],
                    },
                ]);
            } catch (err) {
                console.warn(
                    "Failed to clear history:",
                    err
                );
            }
        };

    // ============================================================
    // QUICK QUESTIONS
    // ============================================================

    const quickQuestions =
        currentLanguage ===
        "hi"
            ? [
                  {
                      label:
                          "पीएम फसल बीमा दरें",

                      q: "पीएम फसल बीमा योजना की प्रीमियम दर क्या है?",
                  },

                  {
                      label:
                          "72 घंटे दावा नियम",

                      q: "फसल क्षति के बाद दावा करने की समय सीमा क्या है?",
                  },

                  {
                      label:
                          "पैक्स यूरिया खाद",

                      q: "पैक्स (PACS) से सब्सिडी वाली खाद लेने के नियम क्या हैं?",
                  },

                  {
                      label:
                          "केसीसी 4% ब्याज",

                      q: "किसान क्रेडिट कार्ड पर ब्याज दर और सब्सिडी क्या है?",
                  },
              ]
            : [
                  {
                      label:
                          "PMFBY Rates",

                      q: "What is the PMFBY crop insurance premium rate?",
                  },

                  {
                      label:
                          "72h Claim Rule",

                      q: "What is the deadline for PMFBY intimation?",
                  },

                  {
                      label:
                          "PACS Fertilizer",

                      q: "What services are provided by PACS for fertilizer?",
                  },

                  {
                      label:
                          "KCC 4% Subvention",

                      q: "What is KCC interest subvention rate?",
                  },
              ];

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-fadeIn">

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                        <Sparkles className="w-5 h-5" />
                    </div>

                    <div>
                        <h2 className="text-sm font-bold flex items-center gap-2">

                            <span>
                                {t(
                                    "chat.title"
                                )}
                            </span>

                            <span className="text-[10px] bg-emerald-700/80 text-emerald-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">

                                <CheckCircle2 className="w-2.5 h-2.5" />

                                <span>
                                    Grounded
                                </span>

                            </span>

                        </h2>

                        <p className="text-[11px] text-slate-400">
                            {t(
                                "chat.sub"
                            )}
                        </p>
                    </div>
                </div>

                {/* CONTROLS */}

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={
                            openLanguageModal
                        }
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-xl text-xs font-bold text-white transition-colors"
                    >
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />

                        <span>
                            {
                                languages[
                                    currentLanguage
                                ]
                                    ?.native
                            }{" "}
                            ▾
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleClearHistory
                        }
                        title={t(
                            "common.clear"
                        )}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                </div>
            </div>

            {/* ================================================== */}
            {/* MIC ERROR */}
            {/* ================================================== */}

            {micError && (
                <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs flex items-center justify-between">

                    <div className="flex items-center gap-2">

                        <AlertCircle className="w-4 h-4 flex-shrink-0" />

                        <span>
                            {micError}
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setMicError(
                                null
                            )
                        }
                        className="font-bold hover:underline"
                    >
                        {t(
                            "common.dismiss"
                        )}
                    </button>

                </div>
            )}

            {/* ================================================== */}
            {/* MESSAGES */}
            {/* ================================================== */}

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">

                {messages.map(
                    (m) => (
                        <div
                            key={m.id}
                            className={`flex items-start gap-3 ${
                                m.sender ===
                                "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >

                            {m.sender ===
                                "bot" && (
                                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                                    <Bot className="w-4 h-4" />
                                </div>
                            )}

                            <div
                                className={`max-w-[85%] sm:max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                    m.sender ===
                                    "user"
                                        ? "bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10"
                                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs"
                                }`}
                            >

                                <div className="flex items-start justify-between gap-2">

                                    <p className="whitespace-pre-wrap flex-1">
                                        {
                                            m.text
                                        }
                                    </p>

                                    {m.sender ===
                                        "bot" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSpeakToggle(
                                                    m.id,
                                                    m.text,
                                                    m.language
                                                )
                                            }
                                            title={
                                                speakingMsgId ===
                                                m.id
                                                    ? t(
                                                          "common.stopVoice"
                                                      )
                                                    : t(
                                                          "common.listenAgain"
                                                      )
                                            }
                                            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                                                speakingMsgId ===
                                                m.id
                                                    ? "bg-emerald-100 text-emerald-700 animate-pulse"
                                                    : "text-slate-400 hover:text-emerald-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            {speakingMsgId ===
                                            m.id ? (
                                                <VolumeX className="w-4 h-4" />
                                            ) : (
                                                <Volume2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    )}

                                </div>

                                {/* TOPIC */}

                                {m.topic && (
                                    <div className="mt-2 flex items-center gap-1.5">

                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">

                                            <Compass className="w-3 h-3 text-emerald-600" />

                                            <span>
                                                {t(
                                                    "common.topic"
                                                )}
                                                :{" "}
                                                {
                                                    m.topic
                                                }
                                            </span>

                                        </span>

                                    </div>
                                )}

                                {/* SOURCES */}

                                {m.sources &&
                                    m
                                        .sources
                                        .length >
                                        0 && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">

                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">

                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />

                                                <span>
                                                    {t(
                                                        "common.officialSources"
                                                    )}
                                                    :
                                                </span>

                                            </div>

                                            {m.sources.map(
                                                (
                                                    s,
                                                    idx
                                                ) => (
                                                    <div
                                                        key={
                                                            idx
                                                        }
                                                        className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-[11px]"
                                                    >

                                                        <div className="flex items-center gap-1.5 text-slate-700 truncate mr-2">

                                                            <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

                                                            <span className="font-semibold truncate">
                                                                {
                                                                    s.title ||
                                                                    s.document_name
                                                                }
                                                            </span>

                                                        </div>

                                                        {s.source_url && (
                                                            <a
                                                                href={
                                                                    s.source_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline flex-shrink-0"
                                                            >

                                                                <span>
                                                                    Portal
                                                                </span>

                                                                <ExternalLink className="w-3 h-3" />

                                                            </a>
                                                        )}

                                                    </div>
                                                )
                                            )}

                                        </div>
                                    )}

                            </div>

                            {m.sender ===
                                "user" && (
                                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs font-bold text-xs">
                                    {
                                        user
                                            ?.name?.[0] ||
                                        "U"
                                    }
                                </div>
                            )}

                        </div>
                    )
                )}

                {/* LOADING */}

                {isLoading && (
                    <div className="flex items-start gap-3">

                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                            <Bot className="w-4 h-4" />
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200 rounded-tl-none flex items-center gap-2 text-xs text-slate-500">

                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />

                            <span>
                                {t(
                                    "common.loading"
                                )}
                            </span>

                        </div>
                    </div>
                )}

                <div
                    ref={
                        messagesEndRef
                    }
                />

            </div>

            {/* ================================================== */}
            {/* QUICK QUESTIONS */}
            {/* ================================================== */}

            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">

                {quickQuestions.map(
                    (
                        item,
                        idx
                    ) => (
                        <button
                            key={
                                idx
                            }
                            type="button"
                            onClick={() =>
                                handleSendMessage(
                                    null,
                                    item.q
                                )
                            }
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 font-medium whitespace-nowrap transition-colors text-xs"
                        >
                            {
                                item.label
                            }
                        </button>
                    )
                )}

            </div>

            {/* ================================================== */}
            {/* INPUT */}
            {/* ================================================== */}

            <form
                onSubmit={(e) =>
                    handleSendMessage(
                        e
                    )
                }
                className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
            >

                {/* MICROPHONE */}

                <button
                    type="button"
                    onClick={
                        handleMicToggle
                    }
                    title={
                        isRecording
                            ? t(
                                  "common.stopVoice"
                              )
                            : t(
                                  "common.startVoice"
                              )
                    }
                    className={`p-3 rounded-2xl transition-all flex items-center justify-center ${
                        isRecording
                            ? "bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30 ring-4 ring-rose-200"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                >
                    {isRecording ? (
                        <MicOff className="w-5 h-5" />
                    ) : (
                        <Mic className="w-5 h-5" />
                    )}
                </button>

                {/* TEXT INPUT */}

                <input
                    type="text"
                    placeholder={
                        isRecording
                            ? t(
                                  "voice.micListening"
                              )
                            : t(
                                  "chat.inputPlaceholder"
                              )
                    }
                    value={
                        inputMessage
                    }
                    onChange={(e) =>
                        setInputMessage(
                            e.target
                                .value
                        )
                    }
                    className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    disabled={
                        isLoading
                    }
                />

                {/* SEND */}

                <button
                    type="submit"
                    disabled={
                        isLoading ||
                        !inputMessage.trim()
                    }
                    className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label={t(
                        "common.send"
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>

            </form>
        </div>
    );
}
