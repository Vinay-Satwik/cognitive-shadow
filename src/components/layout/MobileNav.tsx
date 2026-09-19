import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-72 max-w-[85vw] h-full z-10 flex flex-col shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-3 p-1.5 rounded-md text-zinc-400 hover:text-white bg-zinc-900/80 border border-white/10 z-20"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
            <Sidebar onCloseMobile={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
