// frontend/src/components/Navbar.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  FileText,
  ShieldCheck,
  BarChart3,
  LogIn,
  LogOut,
  PlusCircle,
  Settings,
  Radar,
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

  const handleRoleSwitch = async (role: Role) => {
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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-green-500 text-white flex items-center justify-center font-black shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-slate-900">
                CivicFix
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-green-100 text-green-700 rounded-full border border-green-200">
                Stitch
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'map'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            Live Map
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'report'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Issue
          </button>

          <button
            onClick={() => setActiveTab('citizen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'citizen'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            My Reports
          </button>

          <button
            onClick={() => setActiveTab('authority')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'authority'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Staff Triage
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            City Analytics
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Suite
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </nav>

        {/* Right Role Switcher & User Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-bold px-1 text-[11px]">Role:</span>
            <button
              onClick={() => handleRoleSwitch('CITIZEN')}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors ${
                user?.role === 'CITIZEN' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Citizen
            </button>
            <button
              onClick={() => handleRoleSwitch('AUTHORITY')}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors ${
                user?.role === 'AUTHORITY' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors ${
                user?.role === 'ADMIN' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* New Report Button */}
          <button
            onClick={onOpenReportModal || (() => setActiveTab('report'))}
            className="btn-stitch-primary text-xs py-2 px-3.5 shadow-green-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Report</span>
          </button>

          {/* Auth State */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('settings')}
                className="hidden sm:flex flex-col text-right cursor-pointer hover:opacity-80"
              >
                <span className="text-xs font-bold text-slate-900">{user.name}</span>
                <span className="text-[10px] font-bold text-green-700 uppercase">{user.role}</span>
              </button>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className="btn-stitch-secondary text-xs py-2 px-3.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
