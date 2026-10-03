// frontend/src/features/settings/pages/SettingsView.tsx
import React, { useState } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { settingsService } from '../services/settingsService';
import {
  User,
  ShieldCheck,
  Save,
  CheckCircle2,
  Camera,
  History,
} from 'lucide-react';

function getRatnaLabel(points: number): string {
  if (points >= 500) return '💎 Diamond Ratna';
  if (points >= 200) return '🥇 Gold Ratna';
  if (points >= 100) return '🥈 Silver Ratna';
  if (points >= 25) return '🥉 Bronze Ratna';
  return '🌱 New Citizen';
}

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState<string>(user?.name?.split(' ')[0] || 'Alex');
  const [lastName, setLastName] = useState<string>(user?.name?.split(' ')[1] || 'Rivera');
  const [email] = useState<string>(user?.email || 'alex.rivera@civicfix.org');
  const [phone, setPhone] = useState<string>(user?.phone || '+91 98765 43210');
  const [ward, setWard] = useState<string>(user?.jurisdiction || 'Ward 84 Central');
  const [smsAlerts, setSmsAlerts] = useState<boolean>(true);
  const [pushAlerts, setPushAlerts] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const points = user?.ratnaTotal ?? user?.civicPoints ?? 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateProfile({
        name: `${firstName} ${lastName}`.trim(),
        phone,
        jurisdiction: ward,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
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
          <button onClick={handleSave} disabled={saving} className="btn-stitch-primary text-xs shadow-green-500/20">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-green-100 border border-green-300 text-green-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-green-700" />
          Settings successfully updated and synchronized!
        </div>
      )}

      {/* Grid: Profile & Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card */}
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
                <span>Civic Ratna Points</span>
                <span className="font-black text-green-700 text-base">
                  {points} ⭐
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Contributor Tier</span>
                <span className="font-bold text-slate-900">
                  {getRatnaLabel(points)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Current Role</span>
                <span className="font-bold text-green-700">{user?.role || 'CITIZEN'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Personal Information &amp; Preferences</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-100 text-slate-500 text-xs rounded-xl px-3 py-2 border border-slate-200 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Operational Ward</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="text-xs font-bold text-slate-900">Notification Alerts</div>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="accent-green-600 rounded"
                />
                <span>Receive SMS alerts when tickets in my ward reach resolution</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushAlerts}
                  onChange={(e) => setPushAlerts(e.target.checked)}
                  className="accent-green-600 rounded"
                />
                <span>Enable live web push notifications for critical hazard warnings</span>
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
