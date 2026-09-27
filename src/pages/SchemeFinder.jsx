import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { 
  ExternalLink, 
  Phone, 
  Loader2 
} from 'lucide-react';

export default function SchemeFinder() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('All');
  const [requirement, setRequirement] = useState('All');
  const [state, setState] = useState('All');

  useEffect(() => {
    async function fetchSchemes() {
      setLoading(true);
      try {
        const res = await api.searchSchemes(
          userType === 'All' ? null : userType,
          requirement === 'All' ? null : requirement,
          state === 'All' ? null : state
        );
        setSchemes(res.results || []);
      } catch (err) {
        console.error('Failed to search schemes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchemes();
  }, [userType, requirement, state]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {t('schemes.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('schemes.sub')}
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('schemes.farmerType')}</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="All">All Beneficiaries</option>
            <option value="Farmer">Individual Farmer</option>
            <option value="PACS">PACS / Cooperative</option>
            <option value="Agri-entrepreneur">Agri-entrepreneur / FPO</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('schemes.filterCategory')}</label>
          <select
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Crop Insurance">Crop Insurance</option>
            <option value="Direct Benefit Transfer">Direct Income Support</option>
            <option value="Credit & Finance">Credit & KCC Loans</option>
            <option value="Irrigation">Irrigation Subsidy</option>
            <option value="Fertilizer">Soil & Fertilizer</option>
            <option value="Post-Harvest">Infrastructure & Storage</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('schemes.filterState')}</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="All">All India</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>
        </div>
      </div>

      {/* Schemes Results */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs">{t('common.loading')}</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">{t('common.noResults')}</p>
          <button
            onClick={() => { setUserType('All'); setRequirement('All'); setState('All'); }}
            className="mt-3 text-xs text-emerald-600 font-bold hover:underline"
          >
            {t('common.clear')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {schemes.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {s.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">State: {s.state}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.description}</p>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-emerald-900">{t('schemes.benefits')}: </span>
                    <span className="text-slate-700">{s.benefits}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">{t('schemes.eligible')}: </span>
                    <span className="text-slate-600">{s.eligibility}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Helpline: {s.helpline}</span>
                </div>
                {s.official_url && (
                  <a
                    href={s.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
                  >
                    <span>{t('schemes.howToApply')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
