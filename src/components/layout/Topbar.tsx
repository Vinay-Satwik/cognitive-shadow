import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { EndCrisisModal } from '../crisis/EndCrisisModal';

export const Topbar: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { crisisActive, mode, readiness, startActivation, endCrisis, crisisSession } = useApp();
  const [showEndModal, setShowEndModal] = useState(false);

  const handleEndCrisisConfirm = () => {
    setShowEndModal(false);
    endCrisis();
    navigate('/dashboard');
  };

  return (
    <>
      <header className={cn(
        "h-16 px-6 border-b flex items-center justify-between transition-colors duration-300",
        crisisActive
          ? "bg-[#090406]/90 backdrop-blur-md border-rose-950/70"
          : "bg-[#090A0E]/80 backdrop-blur-md border-white/[0.06]"
      )}>
        {/* Left section: mobile hamburger & status statement */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200"
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
                className="hidden sm:inline-flex text-xs font-mono px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
              >
                Emergency Brief
              </button>

              <button
                onClick={() => setShowEndModal(true)}
                className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-rose-600 hover:text-white text-zinc-200 border border-white/10 transition-colors"
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
                className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5"
              >
                <span>Activate Shadow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Confirmation Modal */}
      <EndCrisisModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleEndCrisisConfirm}
      />
    </>
  );
};
