import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (error) setError(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(cleanEmail, password);
      if (!user.hasCompletedOnboarding) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('[Supabase Auth Login Error]', err);
      const rawMsg = err?.message || '';
      if (rawMsg.toLowerCase().includes('invalid login credentials') || rawMsg.toLowerCase().includes('invalid credentials')) {
        setError('Invalid email or password.');
      } else if (rawMsg.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email before signing in.');
      } else if (rawMsg.toLowerCase().includes('network') || rawMsg.toLowerCase().includes('failed to fetch')) {
        setError('Unable to connect to the authentication service. Please try again.');
      } else {
        setError(rawMsg || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-zinc-100 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Top Brand Link */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <span className="font-medium text-sm tracking-wider uppercase text-zinc-200 group-hover:text-white transition-colors">
            Cognitive Shadow
          </span>
        </Link>
        <span className="text-xs font-mono text-zinc-500">
          Standby Access
        </span>
      </div>

      {/* Login Card */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0B0D12] border border-white/[0.08] space-y-7 shadow-2xl">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              Enter your credentials to unlock your personal crisis vault and standby monitoring.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="block text-zinc-400 uppercase tracking-wider text-[10px]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-sans text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-zinc-400 uppercase tracking-wider text-[10px]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-zinc-400 hover:text-cyan-300 font-sans transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pl-10 pr-11 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-sans text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Enter Shadow'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-white/[0.05] text-center text-xs font-light text-zinc-400">
            Don't have a personal Shadow yet?{' '}
            <Link to="/signup" className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-md mx-auto w-full text-center text-[11px] font-mono text-zinc-600">
        Cognitive Shadow • Personal Crisis Operating System
      </div>
    </div>
  );
};
