// frontend/src/features/auth/pages/AuthPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import type { Role } from '../../../core/types';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: (loggedInUser: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, demoLogin } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<'CITIZEN' | 'AUTHORITY'>('CITIZEN');
  const [jurisdiction, setJurisdiction] = useState<string>('Central Ward 84');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let loggedInUser: User;
      if (isLogin) {
        loggedInUser = await login(email, password);
      } else {
        loggedInUser = await register({
          name,
          email,
          password,
          phone: phone || undefined,
          role,
          jurisdiction: role === 'AUTHORITY' ? jurisdiction : undefined,
        });
      }
      onSuccess(loggedInUser);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPersona = async (personaRole: Role) => {
    setError(null);
    setLoading(true);
    try {
      const loggedInUser = await demoLogin(personaRole);
      onSuccess(loggedInUser);
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-700 to-green-500 text-white flex items-center justify-center font-bold mx-auto shadow-md shadow-green-600/25">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isLogin ? 'Welcome Back to CivicFix' : 'Create CivicFix Account'}
          </h1>
          <p className="text-xs text-slate-500">
            {isLogin
              ? 'Sign in to track issues, view ward SLA status & dispatch updates.'
              : 'Join your municipal community and report issues with AI assistance.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl font-semibold">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('CITIZEN')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      role === 'CITIZEN'
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('AUTHORITY')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      role === 'AUTHORITY'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Authority Officer
                  </button>
                </div>
              </div>

              {role === 'AUTHORITY' && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="text-xs font-bold text-slate-700">Operational Ward / Jurisdiction</label>
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="Ward 84 Central"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl px-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@civicfix.com"
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-stitch-primary text-xs w-full py-3 shadow-green-500/25 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to CivicFix</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Verified Account</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Personas */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 text-center">
            One-Click Persona Login
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoPersona('CITIZEN')}
              className="px-2 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 text-[11px] font-bold border border-green-200 transition-colors"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleDemoPersona('AUTHORITY')}
              className="px-2 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 transition-colors"
            >
              Officer
            </button>
            <button
              type="button"
              onClick={() => handleDemoPersona('ADMIN')}
              className="px-2 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold border border-purple-200 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
