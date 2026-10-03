// frontend/src/App.tsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './core/context/AuthContext';
import { Navbar } from './core/components/Navbar';
import { LandingPage } from './features/home/pages/LandingPage';
import { AuthPage } from './features/auth/pages/AuthPage';
import { CitizenDashboard } from './features/complaints/pages/CitizenDashboard';
import { ReportIssueView } from './features/complaints/pages/ReportIssueView';
import { ComplaintDetailView } from './features/complaints/pages/ComplaintDetailView';
import { LiveMapView } from './features/map/pages/LiveMapView';
import { AuthorityTriage } from './features/authority/pages/AuthorityTriage';
import { AdminDashboard } from './features/admin/pages/AdminDashboard';
import { CityAnalyticsView } from './features/analytics/pages/CityAnalyticsView';
import { SettingsView } from './features/settings/pages/SettingsView';
import { RatnaView } from './features/ratna/pages/RatnaView';
import type { Complaint, User } from './core/types';

import { ErrorBoundary } from './core/components/ErrorBoundary';
import { Toaster } from './core/components/Toast';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('civicfix_active_tab') : null) || 'landing';
  });
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const handleNavigate = (tab: string) => {
    // Protected tabs require user login
    const protectedTabs = ['report', 'citizen', 'authority', 'admin', 'settings', 'ratna'];
    if (protectedTabs.includes(tab) && !user) {
      setPendingTab(tab);
      setActiveTab('auth');
      if (typeof window !== 'undefined') {
        localStorage.setItem('civicfix_active_tab', 'auth');
      }
      return;
    }
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('civicfix_active_tab', tab);
    }
  };

  const handleInspectComplaint = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setActiveTab('detail');
  };

  const handleAuthSuccess = (loggedInUser?: User) => {
    try {
      if (pendingTab) {
        const target = pendingTab;
        setPendingTab(null);
        setActiveTab(target);
        if (typeof window !== 'undefined') {
          localStorage.setItem('civicfix_active_tab', target);
        }
        return;
      }
      const role = loggedInUser?.role ?? user?.role ?? 'CITIZEN';
      let nextTab = 'citizen';
      if (role === 'AUTHORITY') {
        nextTab = 'authority';
      } else if (role === 'ADMIN') {
        nextTab = 'admin';
      }
      setActiveTab(nextTab);
      if (typeof window !== 'undefined') {
        localStorage.setItem('civicfix_active_tab', nextTab);
      }
    } catch {
      setActiveTab('citizen');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Restoring session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenReportModal={() => handleNavigate('report')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'landing' && (
          <LandingPage
            onOpenReportModal={() => handleNavigate('report')}
            onNavigateToAuth={() => handleNavigate('auth')}
          />
        )}

        {activeTab === 'map' && (
          <LiveMapView onSelectComplaint={handleInspectComplaint} />
        )}

        {activeTab === 'report' && (
          <ReportIssueView
            onSuccess={() => handleNavigate('citizen')}
            onCancel={() => handleNavigate('landing')}
          />
        )}

        {activeTab === 'citizen' && (
          <CitizenDashboard
            onOpenReportModal={() => handleNavigate('report')}
            onInspectComplaint={handleInspectComplaint}
          />
        )}

        {activeTab === 'detail' && (
          selectedComplaint ? (
            <ComplaintDetailView
              complaint={selectedComplaint}
              onBack={() => handleNavigate('citizen')}
            />
          ) : (
            <CitizenDashboard
              onOpenReportModal={() => handleNavigate('report')}
              onInspectComplaint={handleInspectComplaint}
            />
          )
        )}

        {activeTab === 'authority' && <AuthorityTriage />}

        {activeTab === 'analytics' && <CityAnalyticsView />}

        {activeTab === 'admin' && <AdminDashboard />}

        {activeTab === 'ratna' && <RatnaView />}

        {activeTab === 'settings' && <SettingsView />}

        {activeTab === 'auth' && (
          <AuthPage onSuccess={handleAuthSuccess} />
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}
