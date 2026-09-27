import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Scale, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

export default function CooperativeLaws() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {t('cooperative.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('cooperative.sub')}
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-900">{t('cooperative.voteRight')}</h4>
            <p className="text-xs text-emerald-800 mt-0.5">Every member of a PACS or Multi-State Cooperative Society holds equal voting rights regardless of shareholding size.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
          <FileText className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">{t('cooperative.agmRight')}</h4>
            <p className="text-xs text-slate-600 mt-0.5">Members have the statutory right to inspect audited balance sheets, register of members, and AGM proceedings.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
          <Scale className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">{t('cooperative.section84')}</h4>
            <p className="text-xs text-slate-600 mt-0.5">Disputes touch constitution, management, or business of a multi-state cooperative society shall be referred to arbitration under Section 84.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
