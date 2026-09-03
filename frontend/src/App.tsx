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
import type { Complaint } from './core/types';

export const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const handleNavigate = (tab: string) => {
    // Protected tabs require user login
    const protectedTabs = ['report', 'citizen', 'authority', 'admin', 'settings'];
    if (protectedTabs.includes(tab) && !user) {
      setPendingTab(tab);
      setActiveTab('auth');
      return;
    }
    setActiveTab(tab);
  };

  const handleInspectComplaint = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setActiveTab('detail');
  };

  const handleAuthSuccess = () => {
    if (pendingTab) {
      const target = pendingTab;
      setPendingTab(null);
      setActiveTab(target);
    } else {
      setActiveTab('citizen');
    }
  };

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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
