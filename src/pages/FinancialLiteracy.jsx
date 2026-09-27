import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Banknote, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function FinancialLiteracy() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {t('financial.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('financial.sub')}
        </p>
      </div>

      <div className="bg-amber-500 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-amber-100 text-xs font-bold uppercase tracking-wider">
          <Banknote className="w-5 h-5 text-yellow-200" />
          <span>{t('financial.kccRateTitle')}</span>
        </div>
        <p className="text-sm sm:text-base font-semibold leading-relaxed">
          {t('financial.kccRateDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <h4 className="text-sm font-bold text-slate-900">Collateral-Free Loan Limit</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{t('financial.collateralLimit')}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-rose-200 bg-rose-50/40 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>{t('financial.fraudSafetyTitle')}</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{t('financial.fraudSafetyDesc')}</p>
        </div>
      </div>
    </div>
  );
}
