import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  ArrowRight,
  User,
  Settings,
  Sparkles,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { EndCrisisModal } from '../crisis/EndCrisisModal';
import { LogoutModal } from '../auth/LogoutModal';

export const Topbar: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { crisisActive, mode, readiness, startActivation, endCrisis, crisisSession } = useApp();
  const { user, logout } = useAuth();

  const [showEndModal, setShowEndModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEndCrisisConfirm = () => {
    setShowEndModal(false);
    endCrisis();
    navigate('/dashboard');
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const userDisplayName = user?.name || 'Authorized User';
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'CS'
    : 'CS';

  return (
    <>
      <header className={cn(
        "h-16 px-6 border-b flex items-center justify-between transition-colors duration-300 relative z-30",
        crisisActive
          ? "bg-[#090406]/90 backdrop-blur-md border-rose-950/70"
          : "bg-[#090A0E]/80 backdrop-blur-md border-white/[0.06]"
      )}>
        {/* Left section: mobile hamburger & status statement */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className={cn(
              "w-2 h-2 rounded-full shrink-0",
              crisisActive
                ? "bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"
                : mode === 'activating'
                ? "bg-amber-400 animate-ping"
                : "bg-cyan-400 shadow-[0_0_6px_#06b6d4]"
            )} />
            <span className={cn(
              "text-xs sm:text-sm font-medium tracking-wide",
              crisisActive ? "text-rose-200 font-mono" : "text-zinc-300"
            )}>
              {crisisActive
                ? `CRISIS MODE • ${crisisSession.scenario}`
                : mode === 'activating'
                ? 'Selecting emergency scenario...'
                : 'Your Shadow is standing by'}
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {crisisActive ? (
            <>
              <button
                onClick={() => navigate('/crisis/brief')}
                className="hidden sm:inline-flex text-xs font-mono px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors cursor-pointer"
              >
                Emergency Brief
              </button>

              <button
                onClick={() => setShowEndModal(true)}
                className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-rose-600 hover:text-white text-zinc-200 border border-white/10 transition-colors cursor-pointer"
              >
                End Crisis
              </button>
            </>
          ) : (
            <>
              {/* Readiness Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-zinc-300">
                <span className="text-cyan-400 font-semibold">{readiness.overallScore}%</span>
                <span className="text-zinc-500 uppercase">READY</span>
              </div>

              <button
                onClick={() => {
                  startActivation();
                  navigate('/activation');
                }}
                className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Activate Shadow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* User Account / Profile Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs transition-colors cursor-pointer"
              aria-label="User Account Menu"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <span className="hidden md:inline-block font-mono text-zinc-300 text-xs">
                {userDisplayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0C0E14] border border-white/[0.1] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Identity Info */}
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-medium text-white truncate">
                    {userDisplayName}
                  </p>
                  <p className="text-xs font-mono text-zinc-400 truncate mt-0.5">
                    {user?.email || 'standby-protected@shadow.vault'}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                      Standby Protected
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full px-4 py-2 text-left text-zinc-300 hover:text-white hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span>Profile & Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/onboarding?mode=rerun');
                    }}
                    className="w-full px-4 py-2 text-left text-zinc-300 hover:text-white hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Run Onboarding Wizard</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="pt-1 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer text-xs"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Terminate Session / Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Modal for End Crisis */}
      <EndCrisisModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleEndCrisisConfirm}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};
