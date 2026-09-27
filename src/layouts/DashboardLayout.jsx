import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import LoginModal from '../components/LoginModal';
import LanguageSelectionModal from '../components/LanguageSelectionModal';
import { useLanguage } from '../context/LanguageContext';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isModalOpen, closeLanguageModal, hasSelectedLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Topbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      
      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <LoginModal />
      <LanguageSelectionModal
        isOpen={isModalOpen}
        onClose={closeLanguageModal}
        isFirstLaunch={!hasSelectedLanguage}
      />
    </div>
  );
}
