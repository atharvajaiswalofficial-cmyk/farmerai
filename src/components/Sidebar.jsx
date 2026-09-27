import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Home, 
  MessageSquareText, 
  FileSearch, 
  ShieldCheck, 
  Building2, 
  Scale, 
  Banknote, 
  FileText, 
  Mic, 
  LayoutDashboard
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { to: '/', labelKey: 'nav.overview', icon: Home, exact: true },
    { to: '/chat', labelKey: 'nav.aiAssistant', icon: MessageSquareText },
    { to: '/schemes', labelKey: 'nav.schemeFinder', icon: FileSearch },
    { to: '/pmfby', labelKey: 'nav.pmfby', icon: ShieldCheck },
    { to: '/pacs', labelKey: 'nav.pacs', icon: Building2 },
    { to: '/cooperative', labelKey: 'nav.cooperative', icon: Scale },
    { to: '/financial', labelKey: 'nav.financial', icon: Banknote },
    { to: '/grievance', labelKey: 'nav.grievance', icon: FileText },
    { to: '/voice', labelKey: 'nav.voice', icon: Mic },
    ...(user?.role === 'admin' ? [{ to: '/admin', labelKey: 'nav.admin', icon: LayoutDashboard }] : []),
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Services & Guidance
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card at bottom */}
        {isAuthenticated && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/50">
            <NavLink
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.[0] || 'F'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Farmer User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.phone || user?.email || 'Logged In'}</p>
              </div>
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}
