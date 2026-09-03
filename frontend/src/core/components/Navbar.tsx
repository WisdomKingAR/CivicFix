// frontend/src/core/components/Navbar.tsx
import React, { useState } from 'react';
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
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Award,
} from 'lucide-react';
import type { Role } from '../types';

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
  const { user, logout, demoLogin } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleRoleSwitch = async (role: Role) => {
    setShowRoleMenu(false);
    try {
      const loggedUser = await demoLogin(role);
      toast.success(`Switched persona to ${role}`);
      if (role === 'CITIZEN') setActiveTab('citizen');
      else if (role === 'AUTHORITY') setActiveTab('authority');
      else if (role === 'ADMIN') setActiveTab('admin');
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Demo login failed');
    }
  };

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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
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
          {navItem('citizen', 'My Complaints', FileText)}
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
              <span>{(user as any).ratnaTotal ?? 45} Ratna</span>
            </button>
          )}

          {/* Quick Report CTA */}
          <button
            onClick={onOpenReportModal}
            className="btn-stitch-primary text-xs py-2 px-3.5 shadow-green-500/25 hidden sm:inline-flex"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Issue</span>
          </button>

          {/* Demo Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              title="Switch demo persona for testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Dev Mode</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Instant Demo Login
                </div>
                <button
                  onClick={() => handleRoleSwitch('CITIZEN')}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Citizen Persona
                </button>
                <button
                  onClick={() => handleRoleSwitch('AUTHORITY')}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Authority Officer
                </button>
                <button
                  onClick={() => handleRoleSwitch('ADMIN')}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Municipal Admin
                </button>
              </div>
            )}
          </div>

          {/* User Auth Profile / Login */}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('settings')}
                className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-green-400 transition-all"
                title={`${user.name} (${user.role})`}
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
          {navItem('citizen', 'My Complaints', FileText)}
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
              onOpenReportModal && onOpenReportModal();
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
