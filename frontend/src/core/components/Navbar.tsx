// frontend/src/core/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from './Toast';
import {
  Building2,
  FileText,
  ShieldAlert,
  BarChart3,
  LogIn,
  LogOut,
  PlusCircle,
  Radar,
  Menu,
  X,
  Award,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReportModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
}) => {
  const { user, logout, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, [activeTab]);

  const navItem = (id: string, label: string, Icon: React.ElementType, badgeColor?: string) => {
    const isActive = activeTab === id;
    return (
      <button
        key={id}
        onClick={() => {
          setActiveTab(id);
          setMobileMenuOpen(false);
        }}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isActive
            ? badgeColor || 'bg-green-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-[9999] w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-700 to-green-500 text-white flex items-center justify-center font-black shadow-md shadow-green-600/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-slate-900">
                Civic<span className="text-green-600">Fix</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-green-50 text-green-700 rounded-full border border-green-200 hidden sm:inline-block">
                AI Powered
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl border border-slate-200">
          {navItem('landing', 'Home', Building2)}
          {navItem('map', 'Live Radar', Radar)}
          {user && navItem('citizen', 'My Complaints', FileText)}
          {(user?.role === 'AUTHORITY' || user?.role === 'ADMIN') &&
            navItem('authority', 'Triage Queue', ShieldAlert, 'bg-blue-600 text-white')}
          {user?.role === 'ADMIN' &&
            navItem('admin', 'Admin Portal', BarChart3, 'bg-purple-600 text-white')}
          {navItem('analytics', 'Analytics', BarChart3)}
          {user?.role === 'CITIZEN' &&
            navItem('ratna', 'Ratna Rewards', Award, 'bg-amber-500 text-white')}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ratna Score Pill for Citizens */}
          {user?.role === 'CITIZEN' && (
            <button
              onClick={() => setActiveTab('ratna')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-black text-amber-800 transition-colors shadow-sm"
              title="View your earned Ratna civic points"
            >
              <span className="text-amber-600 font-black">✦</span>
              <span>{user.ratnaTotal ?? user.civicPoints ?? 0} Ratna</span>
            </button>
          )}

          {/* Quick Report CTA */}
          <button
            onClick={() => (user ? onOpenReportModal?.() : setActiveTab('auth'))}
            className="btn-stitch-primary text-xs py-2 px-3.5 shadow-green-500/25 hidden sm:inline-flex"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Issue</span>
          </button>

          {/* User Auth Profile / Login */}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('settings')}
                className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-green-400 transition-all"
                title={`${user.name || 'User'} (${user.role || 'CITIZEN'})`}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
              <button
                onClick={() => {
                  logout();
                  toast.info('Logged out successfully');
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Stacked Navigation Drawer */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-3 flex flex-col gap-1.5 shadow-xl animate-fadeIn">
          {navItem('landing', 'Home', Building2)}
          {navItem('map', 'Live Radar', Radar)}
          {user && navItem('citizen', 'My Complaints', FileText)}
          {(user?.role === 'AUTHORITY' || user?.role === 'ADMIN') &&
            navItem('authority', 'Triage Queue', ShieldAlert, 'bg-blue-600 text-white')}
          {user?.role === 'ADMIN' &&
            navItem('admin', 'Admin Portal', BarChart3, 'bg-purple-600 text-white')}
          {navItem('analytics', 'Analytics', BarChart3)}
          {user?.role === 'CITIZEN' &&
            navItem('ratna', 'Ratna Rewards', Award, 'bg-amber-500 text-white')}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (user) {
                onOpenReportModal && onOpenReportModal();
              } else {
                setActiveTab('auth');
              }
            }}
            className="btn-stitch-primary text-xs py-2.5 px-3 mt-2 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </nav>
      )}
    </header>
  );
};
