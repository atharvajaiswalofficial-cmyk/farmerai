import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import SchemeFinder from './pages/SchemeFinder';
import PMFBY from './pages/PMFBY';
import PACSServices from './pages/PACSServices';
import CooperativeLaws from './pages/CooperativeLaws';
import FinancialLiteracy from './pages/FinancialLiteracy';
import Grievance from './pages/Grievance';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import VoiceAssistant from './pages/VoiceAssistant';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="chat" element={<AIChat />} />
              <Route path="schemes" element={<SchemeFinder />} />
              <Route path="pmfby" element={<PMFBY />} />
              <Route path="pacs" element={<PACSServices />} />
              <Route path="cooperative" element={<CooperativeLaws />} />
              <Route path="financial" element={<FinancialLiteracy />} />
              <Route path="grievance" element={<Grievance />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="voice" element={<VoiceAssistant />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
