import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (error) setError(null);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (error) setError(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (error) setError(null);
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter a secure password.');
      return;
    }

    if (password.length < 6) {
      setError('Password does not meet the required security requirements (minimum 6 characters).');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(cleanName, cleanEmail, password);
      if (result.requiresEmailConfirmation) {
        setEmailConfirmationPending(true);
        setRegisteredEmail(cleanEmail);
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('[Supabase Auth SignUp Error]', err);
      const rawMsg = err?.message || '';
      if (rawMsg.toLowerCase().includes('already registered') || rawMsg.toLowerCase().includes('user already exists')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (rawMsg.toLowerCase().includes('weak password') || rawMsg.toLowerCase().includes('password should be')) {
        setError('Password does not meet the required security requirements.');
      } else if (rawMsg.toLowerCase().includes('valid email') || rawMsg.toLowerCase().includes('invalid email') || rawMsg.toLowerCase().includes('email_address_invalid')) {
        setError('Please enter a valid email address.');
      } else if (rawMsg.toLowerCase().includes('rate limit')) {
        setError('Email send rate limit reached. Please check if you received an activation email or try again shortly.');
      } else if (rawMsg.toLowerCase().includes('network') || rawMsg.toLowerCase().includes('failed to fetch')) {
        setError('Unable to create your account right now. Please try again.');
      } else {
        setError(rawMsg || 'Unable to create your account right now. Please try again.');
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
          New Registration
        </span>
      </div>

      {/* SignUp Card */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0B0D12] border border-white/[0.08] space-y-7 shadow-2xl">
          {emailConfirmationPending ? (
            <div className="space-y-6 text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-light tracking-tight text-white">
                  Check Your Email
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-sm mx-auto">
                  A verification link has been sent to <span className="text-cyan-300 font-mono font-medium">{registeredEmail}</span>. Check your email to confirm your account before signing in.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.05]">
                <Link
                  to="/login"
                  className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                  Create Your Shadow
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                  Organize your documents, contacts, and emergency playbooks before you need them.
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
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-sans text-xs"
                    />
                  </div>
                </div>

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
                  <label className="block text-zinc-400 uppercase tracking-wider text-[10px]">
                    Secure Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="At least 6 characters"
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

                <div className="space-y-1.5">
                  <label className="block text-zinc-400 uppercase tracking-wider text-[10px]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pl-10 pr-11 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-sans text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Creating account...' : 'Create Account & Begin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 border-t border-white/[0.05] text-center text-xs font-light text-zinc-400">
                Already have a Cognitive Shadow?{' '}
                <Link to="/login" className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-md mx-auto w-full text-center text-[11px] font-mono text-zinc-600">
        Cognitive Shadow • Personal Crisis Operating System
      </div>
    </div>
  );
};
