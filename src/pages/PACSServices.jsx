import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  Banknote, 
  Tractor, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function PACSServices() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {t('pacs.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('pacs.sub')}
        </p>
      </div>

      {/* Fertilizer MRP Banner */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-emerald-300" />
          <span>{t('pacs.ureaMrpTitle')}</span>
        </div>
        <p className="text-sm sm:text-base font-semibold text-emerald-50 leading-relaxed">
          {t('pacs.ureaMrpDesc')}
        </p>
      </div>

      {/* Services Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('pacs.ureaMrpTitle')}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{t('pacs.ureaMrpDesc')}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Banknote className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('pacs.kccLoanTitle')}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{t('pacs.kccLoanDesc')}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Tractor className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('pacs.customHiringTitle')}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{t('pacs.customHiringDesc')}</p>
        </div>
      </div>
    </div>
  );
}
