import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Banknote, 
  FileText, 
  ArrowRight, 
  Clock,
  Mic,
  Globe
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { t, currentMeta, openLanguageModal } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const s = await api.getSchemes();
        setSchemes(s.slice(0, 4));
      } catch (err) {
        console.error('Failed to load schemes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-700/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <Sparkles className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{t('dashboard.subtitle')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('dashboard.welcome')}, {isAuthenticated ? user?.name : 'Farmer Friend'}! 🌾
          </h1>
          <p className="text-sm sm:text-base text-emerald-50 mt-2 leading-relaxed">
            {t('dashboard.subtitle')} — PMFBY 72h Claims, Subsidized PACS Fertilizers & KCC Loans.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs sm:text-sm hover:bg-emerald-50 shadow-md transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t('common.askAi')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/voice"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 border border-emerald-400/40 text-white font-bold text-xs sm:text-sm hover:bg-emerald-900 transition-all"
            >
              <Mic className="w-4 h-4 text-emerald-300" />
              <span>{t('common.startVoice')}</span>
            </Link>
            <button
              onClick={openLanguageModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all border border-white/20"
            >
              <Globe className="w-4 h-4 text-emerald-200" />
              <span>{currentMeta.native} ▾</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner: 72-Hour PMFBY Claim Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-amber-500/20 text-amber-800 rounded-xl flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">{t('pmfby.alert72hTitle')}</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              {t('pmfby.alert72hDesc')}
            </p>
          </div>
        </div>
        <Link
          to="/pmfby"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          <span>{t('common.viewDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Core Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* PMFBY */}
        <Link
          to="/pmfby"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {t('nav.pmfby')}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {t('pmfby.sub')}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 gap-1">
            <span>{t('common.viewDetails')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* PACS Hub */}
        <Link
          to="/pacs"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
            {t('nav.pacs')}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {t('pacs.ureaMrpDesc')}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 gap-1">
            <span>{t('common.viewDetails')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Financial Literacy & KCC */}
        <Link
          to="/financial"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Banknote className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
            {t('nav.financial')}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {t('financial.kccRateDesc')}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 gap-1">
            <span>{t('common.viewDetails')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Grievance Drafting */}
        <Link
          to="/grievance"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
            {t('nav.grievance')}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {t('grievance.sub')}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-purple-600 gap-1">
            <span>{t('common.viewDetails')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

      </div>

      {/* Featured Schemes Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('schemes.title')}</h2>
            <p className="text-xs text-slate-500">{t('schemes.sub')}</p>
          </div>
          <Link
            to="/schemes"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>{t('common.viewDetails')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schemes.map((s) => (
            <div key={s.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-all">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {s.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Helpline: {s.helpline}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">{s.name}</h4>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{s.description}</p>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium">{s.benefits?.slice(0, 45)}...</span>
                <a
                  href={s.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-slate-700 hover:text-emerald-700 underline"
                >
                  {t('common.verifyOnPortal')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
