import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Copy, 
  Loader2,
  Globe
} from 'lucide-react';

export default function Grievance() {
  const { user } = useAuth();
  const { currentLanguage, t } = useLanguage();
  
  const [category, setCategory] = useState('Crop Insurance');
  const [description, setDescription] = useState('');
  const [farmerName, setFarmerName] = useState(user?.name || 'Rameshwar Patel');
  const [district, setDistrict] = useState(user?.district || 'Hoshangabad');
  const [state, setState] = useState(user?.state || 'Madhya Pradesh');
  const [contact, setContact] = useState(user?.phone || '+91 98765 43210');

  const [guidance, setGuidance] = useState(null);
  const [generatedLetter, setGeneratedLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targetLang, setTargetLang] = useState(currentLanguage);

  const handleGetGuidance = async () => {
    if (!description.trim()) return;
    try {
      const g = await api.getGrievanceGuidance(category, description);
      setGuidance(g);
    } catch (err) {
      console.error('Failed to fetch guidance:', err);
    }
  };

  const handleGenerateLetter = async (e, langOverride = null) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;
    setIsLoading(true);
    const langToUse = langOverride || targetLang || currentLanguage;
    try {
      const draft = await api.draftGrievance({
        category,
        description,
        farmer_name: farmerName,
        district,
        state,
        contact,
        user_id: user?.id,
        language: langToUse
      });
      setGeneratedLetter(draft.letter_text);
      await handleGetGuidance();
    } catch (err) {
      console.error('Failed to generate letter:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {t('grievance.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('grievance.sub')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>{t('grievance.selectCategory')}</span>
          </h2>

          <form onSubmit={(e) => handleGenerateLetter(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('grievance.selectCategory')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Crop Insurance">Crop Insurance / Claim Delay (फसल बीमा)</option>
                <option value="Subsidized Fertilizer">Fertilizer Hoarding / PACS Overcharging (उर्वरक)</option>
                <option value="Agricultural Credit">KCC Loan / Bank Subsidy Delay (केसीसी ऋण)</option>
                <option value="PM-KISAN DBT">PM-KISAN Installment Not Credited (सम्मान निधि)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('profile.nameLabel')}</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('profile.phoneLabel')}</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('profile.districtLabel')}</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('profile.stateLabel')}</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('grievance.describeIssue')}</label>
              <textarea
                rows={4}
                placeholder={t('grievance.placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none placeholder:text-slate-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <span>{t('grievance.generateBtn')}</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output & Guidance Column */}
        <div className="lg:col-span-6 space-y-4">
          {generatedLetter ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Generated Formal Complaint Letter</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                {generatedLetter}
              </div>

              {/* Requirement #16: Option to Export English version for CP-GRAMS without silently changing farmer language */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleGenerateLetter(e, 'en')}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('grievance.exportEnglish')}</span>
                </button>
              </div>

              {guidance && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2 text-xs">
                  <p className="font-bold text-emerald-950">Escalation Authority: {guidance.escalation_authority}</p>
                  <p className="text-emerald-800">Helpline: {guidance.helpline}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-100/70 border border-dashed border-slate-300 rounded-3xl p-8 text-center flex flex-col items-center justify-center text-slate-400 h-full min-h-[300px]">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-semibold text-slate-600">No grievance letter generated yet.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Fill in your problem details on the left and click "{t('grievance.generateBtn')}".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
