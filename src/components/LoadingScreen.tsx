import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: '#0B0C10' }}
      aria-label="Loading Focus Sanctuary"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Subtle Matcha Green Glowing Aura */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.4, 0.15]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute w-24 h-24 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #A3E635 0%, rgba(163, 230, 53, 0) 70%)'
          }}
        />

        {/* Central Core Pulse - Matcha Green Dot */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.85, 1, 0.85]
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="w-4 h-4 rounded-full shadow-[0_0_20px_#A3E635]"
            style={{ backgroundColor: '#A3E635' }}
          />
          <motion.div
            animate={{
              scale: [1, 2.2],
              opacity: [0.6, 0]
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeOut'
            }}
            className="absolute w-4 h-4 rounded-full border border-[#A3E635]/60 pointer-events-none"
          />
        </div>

        {/* Minimalist Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 text-[11px] font-mono tracking-[0.25em] uppercase text-slate-400"
        >
          Focus Sanctuary
        </motion.p>
      </div>
    </div>
  );
};
