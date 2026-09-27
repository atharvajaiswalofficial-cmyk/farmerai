import React from 'react';
import { Globe, Check, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelectionModal({ isOpen, onClose, isFirstLaunch = false }) {
  const { currentLanguage, setLanguage, languages, confirmLanguageSelection } = useLanguage();

  if (!isOpen) return null;

  const handleSelect = (code) => {
    setLanguage(code);
  };

  const handleConfirm = () => {
    confirmLanguageSelection(currentLanguage);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
        
        {!isFirstLaunch && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-2 mb-6 flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Choose Your Language / अपनी भाषा चुनें
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Select the language you understand best to access all schemes, crop insurance, and AI assistance without barriers.
          </p>
        </div>

        {/* Grid of 12 Language Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 overflow-y-auto pr-1 py-1">
          {Object.entries(languages).map(([code, meta]) => {
            const isSelected = currentLanguage === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/30 shadow-md'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-base font-extrabold ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                    {meta.native}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {meta.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer Button */}
        <div className="pt-6 mt-4 border-t border-slate-100 flex-shrink-0 flex justify-center">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Continue / आगे बढ़ें</span>
          </button>
        </div>

      </div>
    </div>
  );
}
