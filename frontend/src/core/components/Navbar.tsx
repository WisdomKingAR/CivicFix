// frontend/src/core/components/Navbar.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  FileText,
  ShieldAlert,
  BarChart3,
  LogIn,
  LogOut,
  PlusCircle,
  Settings,
  Radar,
  ChevronDown,
  Sparkles,
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

  const handleRoleSwitch = async (role: Role) => {
    setShowRoleMenu(false);
    try {
      await demoLogin(role);
      if (role === 'CITIZEN') setActiveTab('citizen');
      else if (role === 'AUTHORITY') setActiveTab('authority');
      else if (role === 'ADMIN') setActiveTab('admin');
    } catch (err: any) {
      alert(err.message || 'Demo login failed');
    }
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

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'landing'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Home
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'map'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            Live Radar
          </button>

          {/* Citizen Tab */}
          <button
            onClick={() => setActiveTab('citizen')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'citizen'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            My Complaints
          </button>

          {/* Authority Tab */}
          {(user?.role === 'AUTHORITY' || user?.role === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('authority')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'authority'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-700 hover:bg-blue-100/70'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Triage Queue
            </button>
          )}

          {/* Admin Tab */}
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-700 hover:bg-purple-100/70'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          )}

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
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
              <span className="hidden md:inline">Demo Switch</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('settings')}
                className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-green-400 transition-all"
                title={`${user.name} (${user.role})`}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
              <button
                onClick={logout}
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
        </div>
      </div>
    </header>
  );
};
