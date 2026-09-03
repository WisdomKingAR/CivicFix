// frontend/src/views/AuthPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Building2, AlertCircle, Sparkles } from 'lucide-react';
import type { Role } from '../types';

interface AuthPageProps {
  onSuccess: (role: Role) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'AUTHORITY'>('CITIZEN');
  const [jurisdiction, setJurisdiction] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'LOGIN') {
        const u = await login(email, password);
        onSuccess(u.role);
      } else {
        const u = await register({
          name,
          email,
          password,
          phone,
          role,
          jurisdiction,
        });
        onSuccess(u.role);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole: Role) => {
    setLoading(true);
    setError(null);
    try {
      const u = await demoLogin(targetRole);
      onSuccess(u.role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/15 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {mode === 'LOGIN' ? 'Welcome Back' : 'Create CivicFix Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'LOGIN'
              ? 'Access citizen reports, priority triage, and city analytics'
              : 'Register to report issues and track municipal fixes'}
          </p>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Quick Demo Access
            </span>
            <span>One-Click</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('CITIZEN')}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-all"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('AUTHORITY')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all"
            >
              Authority
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs transition-all"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/70 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@civicfix.com"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/70 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/70 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {mode === 'REGISTER' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('CITIZEN')}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      role === 'CITIZEN'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-800/40 border-white/10 text-slate-400'
                    }`}
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('AUTHORITY')}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      role === 'AUTHORITY'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800/40 border-white/10 text-slate-400'
                    }`}
                  >
                    Authority Officer
                  </button>
                </div>
              </div>

              {role === 'AUTHORITY' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jurisdiction / Ward</label>
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="Ward 84 - Central Zone"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/70 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-xs py-3 shadow-cyan-500/25 mt-2"
          >
            {mode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Authenticating...' : mode === 'LOGIN' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          {mode === 'LOGIN' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('REGISTER')}
                className="font-bold text-cyan-400 hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => setMode('LOGIN')}
                className="font-bold text-cyan-400 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
