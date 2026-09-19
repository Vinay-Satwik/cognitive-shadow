import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'demo-token';
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password.');
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
          Password Reset
        </span>
      </div>

      {/* Reset Card */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0B0D12] border border-white/[0.08] space-y-7 shadow-2xl">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              Create New Password
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              Choose a strong password to secure your standby vault and emergency protocols.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-3 text-xs text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-white block">Password Updated</span>
                <span>Your credentials have been securely reset. Redirecting to login...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="block text-zinc-400 uppercase tracking-wider text-[10px]">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-sans text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 uppercase tracking-wider text-[10px]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-sans text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Saving...' : 'Set Password & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link to="/login" className="text-[11px] text-zinc-400 hover:text-white transition-colors">
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full text-center text-[11px] font-mono text-zinc-600">
        Cognitive Shadow • Personal Crisis Operating System
      </div>
    </div>
  );
};
