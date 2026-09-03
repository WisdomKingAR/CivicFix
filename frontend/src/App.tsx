// frontend/src/App.tsx
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { AuthPage } from './views/AuthPage';
import { CitizenDashboard } from './views/CitizenDashboard';
import { AuthorityTriage } from './views/AuthorityTriage';
import { AdminDashboard } from './views/AdminDashboard';
import { ReportIssueView } from './views/ReportIssueView';
import { ComplaintDetailView } from './views/ComplaintDetailView';
import { LiveMapView } from './views/LiveMapView';
import { CityAnalyticsView } from './views/CityAnalyticsView';
import { SettingsView } from './views/SettingsView';
import { CreateComplaintModal } from './components/CreateComplaintModal';
import type { Complaint } from './types';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const handleInspectComplaint = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setActiveTab('detail');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setActiveTab('report')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'landing' && (
          <LandingPage
            onOpenReportModal={() => setActiveTab('report')}
            onNavigateToAuth={() => setActiveTab('auth')}
          />
        )}

        {activeTab === 'map' && (
          <LiveMapView onSelectComplaint={handleInspectComplaint} />
        )}

        {activeTab === 'report' && (
          <ReportIssueView
            onSuccess={() => setActiveTab('citizen')}
            onCancel={() => setActiveTab('landing')}
          />
        )}

        {activeTab === 'citizen' && (
          <CitizenDashboard
            onOpenReportModal={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'detail' && selectedComplaint && (
          <ComplaintDetailView
            complaint={selectedComplaint}
            onBack={() => setActiveTab('citizen')}
          />
        )}

        {activeTab === 'authority' && <AuthorityTriage />}

        {activeTab === 'analytics' && <CityAnalyticsView />}

        {activeTab === 'admin' && <AdminDashboard />}

        {activeTab === 'settings' && <SettingsView />}

        {activeTab === 'auth' && (
          <AuthPage
            onSuccess={() => setActiveTab('citizen')}
          />
        )}
      </main>

      {/* Global Quick Create Modal */}
      <CreateComplaintModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={() => {
          setShowReportModal(false);
          setActiveTab('citizen');
        }}
      />
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
