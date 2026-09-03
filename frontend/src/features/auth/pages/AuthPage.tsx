// frontend/src/features/auth/pages/AuthPage.tsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import type { Role } from '../../../core/types';
import {
  LogIn,
  UserPlus,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: 'Too weak', color: 'bg-rose-500' },
    1: { label: 'Weak', color: 'bg-orange-500' },
    2: { label: 'Fair', color: 'bg-amber-500' },
    3: { label: 'Good', color: 'bg-blue-500' },
    4: { label: 'Strong', color: 'bg-green-600' },
  };
  return { score, ...map[score] };
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, demoLogin } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register-only fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'AUTHORITY'>('CITIZEN');
  const [jurisdiction, setJurisdiction] = useState('Central Ward 84');

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const passwordChecks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter (A–Z)', ok: /[A-Z]/.test(password) },
    { label: 'One digit (0–9)', ok: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (strength.score < 2) {
        setError('Password is too weak — add uppercase letters and digits.');
        return;
      }
      if (phone && !/^\+?[\d\s\-()]{7,20}$/.test(phone)) {
        setError('Invalid phone number format.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          name: name.trim(),
          email,
          password,
          phone: phone || undefined,
          role,
          jurisdiction: role === 'AUTHORITY' ? jurisdiction : undefined,
        });
      }
      onSuccess();
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
      await demoLogin(personaRole);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setError(null);
    setPassword('');
    setConfirmPassword('');
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
            onClick={() => switchMode(true)}
            className={`py-2 rounded-xl transition-all ${
              isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`py-2 rounded-xl transition-all ${
              !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl font-semibold flex items-start gap-2">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Register-only fields */}
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Phone <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
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
                  {(['CITIZEN', 'AUTHORITY'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        role === r
                          ? r === 'CITIZEN'
                            ? 'bg-green-600 text-white border-green-600 shadow-sm'
                            : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r === 'CITIZEN' ? 'Citizen' : 'Authority Officer'}
                    </button>
                  ))}
                </div>
              </div>

              {role === 'AUTHORITY' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Operational Ward / Jurisdiction *
                  </label>
                  <input
                    type="text"
                    required
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="Ward 84 Central"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl px-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address *</label>
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

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-10 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength meter (register only) */}
            {!isLogin && password.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i <= strength.score ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Password strength:</span>
                  <span
                    className="font-bold"
                    style={{
                      color:
                        strength.score >= 3
                          ? '#16a34a'
                          : strength.score >= 2
                          ? '#d97706'
                          : '#dc2626',
                    }}
                  >
                    {strength.label}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {passwordChecks.map((c) => (
                    <li key={c.label} className="flex items-center gap-1.5 text-[11px]">
                      {c.ok ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      )}
                      <span className={c.ok ? 'text-green-700' : 'text-slate-400'}>{c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password (register only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border outline-none focus:ring-2 focus:ring-green-500 ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-rose-600 font-semibold">Passwords do not match</p>
              )}
            </div>
          )}

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

        {/* Demo Personas */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 text-center">
            One-Click Demo Login
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
