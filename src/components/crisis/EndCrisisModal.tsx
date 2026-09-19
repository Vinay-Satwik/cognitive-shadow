import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface EndCrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const EndCrisisModal: React.FC<EndCrisisModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md bg-[#0D0E14] border border-white/[0.1] rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white tracking-wide font-mono uppercase">
                  END CRISIS MODE?
                </h2>
                <span className="text-xs text-zinc-400 font-mono">
                  Standby Restoration
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
              Your Shadow will return to standby. Temporary access will be expired and this crisis timeline will be archived.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-mono transition-colors"
              >
                Continue Crisis
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs font-mono transition-colors shadow-sm"
              >
                End Crisis
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
