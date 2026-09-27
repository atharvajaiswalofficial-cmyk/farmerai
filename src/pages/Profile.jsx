import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { User, Phone, Mail, MapPin, Building, ShieldCheck, CheckCircle2, Globe, Sparkles } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { currentLanguage, setLanguage, languages, replyLanguageMode, setReplyLanguageMode, t } = useLanguage();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [state, setState] = useState(user?.state || 'Madhya Pradesh');
  const [district, setDistrict] = useState(user?.district || 'Hoshangabad');
  const [pacsId, setPacsId] = useState(user?.pacs_id || 'PACS-MP-4402');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.updateProfile({
        name,
        phone,
        email,
        state,
        district,
        pacs_id: pacsId,
        preferred_language: currentLanguage
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {t('profile.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('profile.sub')}
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Language Preference Section */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>{t('profile.prefLangLabel')}</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(languages).map(([code, meta]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`p-2.5 rounded-xl border text-xs text-left font-semibold transition-all ${
                    currentLanguage === code
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div>{meta.native}</div>
                  <div className="text-[10px] opacity-80">{meta.name}</div>
                </button>
              ))}
            </div>

            {/* AI Voice Reply Mode setting (Requirement #11) */}
            <div className="pt-2 border-t border-emerald-200/60 space-y-2">
              <label className="block text-xs font-bold text-emerald-900">{t('profile.aiReplyMode')}</label>
              <div className="space-y-1.5 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="replyMode"
                    value="selected"
                    checked={replyLanguageMode === 'selected'}
                    onChange={(e) => setReplyLanguageMode(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{t('profile.aiReplyModeSelected')} ({languages[currentLanguage]?.native})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="replyMode"
                    value="question"
                    checked={replyLanguageMode === 'question'}
                    onChange={(e) => setReplyLanguageMode(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{t('profile.aiReplyModeQuestion')}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('profile.nameLabel')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('profile.phoneLabel')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('profile.pacsIdLabel')}</label>
              <input
                type="text"
                value={pacsId}
                onChange={(e) => setPacsId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('profile.stateLabel')}</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('profile.districtLabel')}</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('common.success')}</span>
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              {saving ? t('common.loading') : t('profile.saveBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
