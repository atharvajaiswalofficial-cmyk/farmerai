import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, getTranslation } from '../i18n/translations';

export const LANGUAGES = {
  en: { name: 'English', native: 'English', code: 'en', voiceCode: 'en-IN' },
  hi: { name: 'Hindi', native: 'हिंदी', code: 'hi', voiceCode: 'hi-IN' },
  mr: { name: 'Marathi', native: 'मराठी', code: 'mr', voiceCode: 'mr-IN' },
  gu: { name: 'Gujarati', native: 'ગુજરાતી', code: 'gu', voiceCode: 'gu-IN' },
  pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', code: 'pa', voiceCode: 'pa-IN' },
  bn: { name: 'Bengali', native: 'বাংলা', code: 'bn', voiceCode: 'bn-IN' },
  ta: { name: 'Tamil', native: 'தமிழ்', code: 'ta', voiceCode: 'ta-IN' },
  te: { name: 'Telugu', native: 'తెలుగు', code: 'te', voiceCode: 'te-IN' },
  kn: { name: 'Kannada', native: 'ಕನ್ನಡ', code: 'kn', voiceCode: 'kn-IN' },
  ml: { name: 'Malayalam', native: 'മലയാളം', code: 'ml', voiceCode: 'ml-IN' },
  or: { name: 'Odia', native: 'ଓଡ଼ିଆ', code: 'or', voiceCode: 'or-IN' },
  as: { name: 'Assamese', native: 'অসমীয়া', code: 'as', voiceCode: 'as-IN' },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(
    () => localStorage.getItem('sahayak_language') || 'hi'
  );

  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(
    () => localStorage.getItem('sahayak_lang_selected') === 'true'
  );

  const [isModalOpen, setIsModalOpen] = useState(
    () => !localStorage.getItem('sahayak_lang_selected')
  );

  const [replyLanguageMode, setReplyLanguageMode] = useState(
    () => localStorage.getItem('sahayak_reply_mode') || 'selected'
  );

  useEffect(() => {
    localStorage.setItem('sahayak_language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('sahayak_reply_mode', replyLanguageMode);
  }, [replyLanguageMode]);

  const setLanguage = (langCode) => {
    if (LANGUAGES[langCode]) {
      setCurrentLanguage(langCode);
    }
  };

  const confirmLanguageSelection = (langCode) => {
    if (langCode && LANGUAGES[langCode]) {
      setCurrentLanguage(langCode);
    }
    setHasSelectedLanguage(true);
    localStorage.setItem('sahayak_lang_selected', 'true');
    setIsModalOpen(false);
  };

  const openLanguageModal = () => setIsModalOpen(true);
  const closeLanguageModal = () => setIsModalOpen(false);

  const t = (keyPath) => {
    return getTranslation(currentLanguage, keyPath);
  };

  const getVoiceCode = () => {
    return LANGUAGES[currentLanguage]?.voiceCode || 'hi-IN';
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        languages: LANGUAGES,
        currentMeta: LANGUAGES[currentLanguage] || LANGUAGES.hi,
        getVoiceCode,
        t,
        hasSelectedLanguage,
        isModalOpen,
        openLanguageModal,
        closeLanguageModal,
        confirmLanguageSelection,
        replyLanguageMode,
        setReplyLanguageMode
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
