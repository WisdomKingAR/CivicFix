// frontend/src/views/SettingsView.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import {
  User,
  ShieldCheck,
  Bell,
  Save,
  CheckCircle2,
  Camera,
  History,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const [firstName, setFirstName] = useState<string>(user?.name.split(' ')[0] || 'Alex');
  const [lastName, setLastName] = useState<string>(user?.name.split(' ')[1] || 'Rivera');
  const [email, setEmail] = useState<string>(user?.email || 'alex.rivera@civicfix.org');
  const [ward, setWard] = useState<string>(user?.jurisdiction || 'Ward 84 Central');
  const [smsAlerts, setSmsAlerts] = useState<boolean>(true);
  const [pushAlerts, setPushAlerts] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  const handleRoleSelect = async (role: Role) => {
    try {
      await demoLogin(role);
    } catch {
      // ignore
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#eff4ff] p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block mb-1">
            Account Configuration
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Settings &amp; Profile Management</h1>
          <p className="text-xs text-slate-500">
            Manage your civic identity, role permissions, notification channels, and operational ward
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Audit logs inspected')}
            className="btn-stitch-secondary text-xs"
          >
            <History className="w-4 h-4" />
            Activity Audit
          </button>
          <button onClick={handleSave} className="btn-stitch-primary text-xs shadow-green-500/20">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-green-100 border border-green-300 text-green-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-green-700" />
          Settings successfully updated and synchronized!
        </div>
      )}

      {/* Grid: Profile & Role Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Role Selector */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center font-bold text-2xl text-green-700 border-2 border-green-500 shadow-sm">
                <User className="w-12 h-12" />
              </div>
              <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-md hover:scale-105 transition-transform">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="font-extrabold text-lg text-slate-900">{firstName} {lastName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{email}</p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Municipal Profile</span>
            </div>

            <div className="w-full mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-left text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Member Status</span>
                <span className="font-bold text-slate-900">Active Tier 2</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Reports Filed</span>
                <span className="font-bold text-slate-900">14 Issues</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Resolution Rate</span>
                <span className="font-bold text-green-700">94.2%</span>
              </div>
            </div>
          </div>

          {/* Role Mode Selector */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              Operational Role Permission
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Switch operational modes to preview citizen, field crew, or administrative tools.
            </p>

            <div className="space-y-2">
              <label
                onClick={() => handleRoleSelect('CITIZEN')}
                className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                  user?.role === 'CITIZEN' ? 'bg-green-50 border-green-500' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={user?.role === 'CITIZEN'}
                  onChange={() => {}}
                  className="mt-1 accent-green-600"
                />
                <div className="ml-3 text-xs">
                  <span className="font-bold text-slate-900 block">Citizen Reporter</span>
                  <span className="text-[11px] text-slate-500">Report public issues, track personal tickets &amp; vote.</span>
                </div>
              </label>

              <label
                onClick={() => handleRoleSelect('AUTHORITY')}
                className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                  user?.role === 'AUTHORITY' ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={user?.role === 'AUTHORITY'}
                  onChange={() => {}}
                  className="mt-1 accent-blue-600"
                />
                <div className="ml-3 text-xs">
                  <span className="font-bold text-slate-900 block">Field Dispatch Worker</span>
                  <span className="text-[11px] text-slate-500">Task dispatching, route inspection &amp; before/after repairs.</span>
                </div>
              </label>

              <label
                onClick={() => handleRoleSelect('ADMIN')}
                className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                  user?.role === 'ADMIN' ? 'bg-amber-50 border-amber-500' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={user?.role === 'ADMIN'}
                  onChange={() => {}}
                  className="mt-1 accent-amber-600"
                />
                <div className="ml-3 text-xs">
                  <span className="font-bold text-slate-900 block">Municipal Admin</span>
                  <span className="text-[11px] text-slate-500">Full system control, SLA compliance, and user moderation.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Info & Notifications */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Personal Details &amp; Jurisdiction
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Assigned Jurisdiction / Ward</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-green-600" />
                Notification Channels &amp; Alerts
              </h4>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="font-bold text-slate-800">Critical Incident SMS Dispatch</div>
                    <div className="text-slate-500 text-[11px]">Receive emergency SMS for nearby high-risk civic hazards.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 accent-green-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="font-bold text-slate-800">Browser &amp; Mobile Push Updates</div>
                    <div className="text-slate-500 text-[11px]">Instant notifications when your reported tickets change status.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    className="w-4 h-4 accent-green-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-stitch-primary text-xs px-6 py-2.5 shadow-green-500/25">
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
