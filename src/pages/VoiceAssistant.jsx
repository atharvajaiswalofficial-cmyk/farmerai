import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Loader2, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  Globe,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { voiceService } from '../services/voice';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceAssistant() {
  const { currentLanguage, setLanguage, languages, getVoiceCode, t, openLanguageModal } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const isProcessingRef = useRef(false);
  const conversationIdRef = useRef(`voice-session-${Date.now()}`);

  const sampleQueries = currentLanguage === 'hi' ? [
    "मेरी फसल बारिश से खराब हो गई है, मुझे क्या करना चाहिए?",
    "पीएम फसल बीमा योजना की अंतिम तिथि क्या है?",
    "पैक्स (PACS) से यूरिया खाद की बोरी का क्या भाव है?",
    "किसान क्रेडिट कार्ड (KCC) पर कितना ब्याज लगता है?"
  ] : currentLanguage === 'mr' ? [
    "माझे पीक पावसामुळे खराब झाले आहे, मी काय करावे?",
    "पीएम पीक विमा योजनेची शेवटची तारीख काय आहे?",
    "पैक्स (PACS) मध्ये युरिया खताची किंमत काय आहे?",
    "किसान क्रेडिट कार्डवर (KCC) किती व्याज लागते?"
  ] : [
    "My crop is damaged by heavy rain, what should I do?",
    "What is the PMFBY crop insurance intimation deadline?",
    "What is the subsidized price of Urea fertilizer at PACS?",
    "What is KCC interest subvention rate and limit?"
  ];

  // Cleanup audio/mic on unmount
  useEffect(() => {
    return () => {
      voiceService.stopListening();
      voiceService.stopSpeaking();
    };
  }, []);

  const startListeningSession = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    setErrorMessage(null);
    setTranscript('');

    const voiceCode = getVoiceCode();
    const started = voiceService.startListening(voiceCode, {
      onResult: (res) => {
        if (res.transcript) {
          setTranscript(res.transcript);
        }
      },
      onFinalTranscript: (finalText) => {
        handleFinalTranscript(finalText);
      },
      onError: (err) => {
        setIsListening(false);
        if (typeof err === 'string' && !err.includes('no-speech')) {
          setErrorMessage(err);
        }
      },
      onEnd: () => {
        if (!isProcessingRef.current && !voiceService.isSpeaking()) {
          setIsListening(false);
        }
      }
    });

    if (started) {
      setIsListening(true);
    }
  };

  const handleFinalTranscript = (finalText) => {
    if (!finalText || !finalText.trim()) return;
    if (isProcessingRef.current) return;
    processVoiceQuery(finalText.trim());
  };

  const processVoiceQuery = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    voiceService.stopListening();
    setIsListening(false);
    setLoading(true);
    setErrorMessage(null);
    setTranscript(queryText);

    try {
      const res = await api.sendChatMessage(
        queryText.trim(),
        currentLanguage,
        'voice',
        null,
        conversationIdRef.current
      );
      const answerText = res?.answer || res?.message || res?.response || 'Answer retrieved successfully.';
      
      const normalizedResponse = {
        ...res,
        answer: answerText
      };
      setResponse(normalizedResponse);
      setLoading(false);

      if (answerText) {
        setIsSpeaking(true);

        const onSpeechEnd = () => {
          setIsSpeaking(false);
          isProcessingRef.current = false;
        };

        if (res?.audio_url) {
          voiceService.playAudioUrl(
            res.audio_url,
            onSpeechEnd,
            () => {
              const voiceCode = getVoiceCode();
              voiceService.speak(answerText, voiceCode, onSpeechEnd);
            }
          );
        } else {
          const voiceCode = getVoiceCode();
          voiceService.speak(answerText, voiceCode, onSpeechEnd);
        }
      } else {
        isProcessingRef.current = false;
      }
    } catch (err) {
      console.error('Voice query failed:', err);
      setErrorMessage(t('common.error'));
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  const handleToggleMic = () => {
    setErrorMessage(null);
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
      isProcessingRef.current = false;
      startListeningSession();
    } else if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      if (transcript.trim() && !isProcessingRef.current) {
        processVoiceQuery(transcript.trim());
      }
    } else {
      setResponse(null);
      startListeningSession();
    }
  };

  const handleSelectSample = (sampleText) => {
    setTranscript(sampleText);
    processVoiceQuery(sampleText);
  };

  const handleStopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    isProcessingRef.current = false;
  };

  const handleReplaySpeaking = () => {
    if (response?.answer) {
      setIsSpeaking(true);
      const onEnd = () => setIsSpeaking(false);
      if (response.audio_url) {
        voiceService.playAudioUrl(response.audio_url, onEnd, () => {
          const voiceCode = getVoiceCode();
          voiceService.speak(response.answer, voiceCode, onEnd);
        });
      } else {
        const voiceCode = getVoiceCode();
        voiceService.speak(response.answer, voiceCode, onEnd);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-center animate-fadeIn py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <span>{t('voice.title')}</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
            Hands-Free Real Voice
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
          {t('voice.sub')}
        </p>
      </div>

      {/* Language Switcher */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={openLanguageModal}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-2xl shadow-xs hover:border-emerald-300 transition-colors cursor-pointer text-xs font-bold text-slate-800"
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{t('common.language')}:</span>
          <span className="text-emerald-700 font-extrabold">{languages[currentLanguage]?.native} ({languages[currentLanguage]?.name}) ▾</span>
        </button>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="font-bold hover:underline">{t('common.dismiss')}</button>
        </div>
      )}

      {/* Large Voice Mic Circle with Waveforms */}
      <div className="py-6 flex flex-col items-center justify-center">
        <div className="relative">
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-30"></div>
              <div className="absolute -inset-4 rounded-full bg-rose-200 animate-pulse opacity-40"></div>
            </>
          )}

          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25"></div>
              <div className="absolute -inset-3 rounded-full bg-emerald-200 animate-pulse opacity-50"></div>
            </>
          )}

          <button
            type="button"
            onClick={handleToggleMic}
            className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl transition-all transform active:scale-95 ${
              isListening 
                ? 'bg-rose-600 ring-8 ring-rose-200 shadow-rose-600/40' 
                : isSpeaking
                ? 'bg-emerald-600 ring-8 ring-emerald-200 shadow-emerald-600/40'
                : 'bg-gradient-to-tr from-emerald-600 to-green-500 ring-8 ring-emerald-100 hover:scale-105 shadow-emerald-600/30'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-10 h-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        <p className="text-xs font-bold text-slate-700 mt-5">
          {isListening
            ? t('voice.micListening')
            : loading
            ? t('voice.micThinking')
            : isSpeaking
            ? t('voice.micSpeaking')
            : t('voice.micTap')}
        </p>

        {transcript && (
          <div className="mt-3 px-4 py-2 bg-slate-100 rounded-2xl max-w-md text-xs text-slate-800 font-medium italic border border-slate-200">
            "{transcript}"
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-500 shadow-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span>{t('common.loading')}</span>
        </div>
      )}

      {/* Grounded Response Card */}
      {response && !loading && (
        <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl text-left shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{t('common.verifiedAnswer')}</span>
            </div>

            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <button
                  onClick={handleStopSpeaking}
                  className="px-3 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{t('common.stopVoice')}</span>
                </button>
              ) : (
                <button
                  onClick={handleReplaySpeaking}
                  className="px-3 py-1 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t('common.listenAgain')}</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">
            {response.answer}
          </p>

          {/* Sources Citations */}
          {response.sources && response.sources.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('common.officialSources')}:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {response.sources.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate mr-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-slate-200 truncate">{s.title || s.document_name}</span>
                    </div>
                    {s.source_url && (
                      <a
                        href={s.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 flex-shrink-0"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Prompts */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-left">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          {t('voice.quickPromptsTitle')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(q)}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 text-xs text-slate-700 font-medium text-left flex items-center justify-between group transition-colors"
            >
              <span className="pr-2 leading-snug">"{q}"</span>
              <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
