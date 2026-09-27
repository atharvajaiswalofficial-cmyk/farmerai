import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sprout, 
  LogIn, 
  LogOut, 
  Globe, 
  Menu,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Topbar({ onToggleSidebar }) {
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();
  const { currentLanguage, setLanguage, languages, currentMeta, openLanguageModal, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">Sahayak AI</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {currentMeta?.native || 'सहायक AI'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block font-medium">Agricultural & Cooperative Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Center / Navigation Quick Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-600">
          <Link to="/chat" className="px-3 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-1.5 font-semibold text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {t('nav.aiAssistant')}
          </Link>
          <Link to="/schemes" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
            {t('nav.schemeFinder')}
          </Link>
          <Link to="/pmfby" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
            {t('nav.pmfby')}
          </Link>
          <Link to="/pacs" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
            {t('nav.pacs')}
          </Link>
          <Link to="/grievance" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
            {t('nav.grievance')}
          </Link>
        </nav>

        {/* Right: Language Selector & Auth */}
        <div className="flex items-center gap-2.5">
          
          {/* Prominent Header Language Switcher Dropdown */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onClick={openLanguageModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-all shadow-xs"
              title="Change Language / भाषा बदलें"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{currentMeta.native}</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-medium text-slate-800"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                  {user?.name?.[0] || 'F'}
                </div>
                <span className="hidden sm:inline font-semibold">{user?.name || 'Farmer'}</span>
              </Link>
              <button
                onClick={logout}
                title={t('nav.logout')}
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('nav.login')}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
