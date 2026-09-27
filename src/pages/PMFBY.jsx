import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PMFBY() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {t('pmfby.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('pmfby.sub')}
        </p>
      </div>

      {/* Critical 72h Rule Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-rose-100 font-bold text-xs uppercase tracking-wider">
          <Clock className="w-5 h-5 text-yellow-300" />
          <span>{t('pmfby.alert72hTitle')}</span>
        </div>
        <p className="text-sm sm:text-base font-semibold leading-relaxed">
          {t('pmfby.alert72hDesc')}
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href="tel:14447"
            className="px-4 py-2 bg-white text-rose-700 font-extrabold rounded-xl text-xs shadow-xs hover:bg-rose-50 transition-colors flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>Call Helpline 14447</span>
          </a>
          <a
            href="https://pmfby.gov.in"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-rose-800/80 border border-white/30 text-white font-bold rounded-xl text-xs hover:bg-rose-900 transition-colors flex items-center gap-1.5"
          >
            <span>PMFBY Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Premium Rates Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kharif Crops</h4>
          <p className="text-sm font-extrabold text-emerald-800">{t('pmfby.kharifRate')}</p>
          <p className="text-xs text-slate-500 mt-1">Foodgrains & Oilseeds</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rabi Crops</h4>
          <p className="text-sm font-extrabold text-emerald-800">{t('pmfby.rabiRate')}</p>
          <p className="text-xs text-slate-500 mt-1">Wheat, Gram & Mustard</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Commercial / Horticulture</h4>
          <p className="text-sm font-extrabold text-emerald-800">{t('pmfby.commercialRate')}</p>
          <p className="text-xs text-slate-500 mt-1">Cotton, Sugarcane, Vegetables</p>
        </div>
      </div>

      {/* Claim Steps */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">{t('pmfby.claimStepsTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <h5 className="text-xs font-bold text-emerald-900">{t('pmfby.step1')}</h5>
            <p className="text-xs text-slate-600">Intimate damage within 72 hours via 14447, bank branch, or PACS.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <h5 className="text-xs font-bold text-emerald-900">{t('pmfby.step2')}</h5>
            <p className="text-xs text-slate-600">Provide survey (khasra) number, bank account details & geotagged photos.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <h5 className="text-xs font-bold text-emerald-900">{t('pmfby.step3')}</h5>
            <p className="text-xs text-slate-600">Joint assessment by District Agriculture Officer & Insurance Representative.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <h5 className="text-xs font-bold text-emerald-900">{t('pmfby.step4')}</h5>
            <p className="text-xs text-slate-600">Direct Benefit Transfer (DBT) credit to Aadhaar-seeded bank account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
