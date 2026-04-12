import React from 'react';
import { motion } from 'framer-motion';

const AuraLogo = ({ size = 40, className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* 3D Brand Asset Core */}
      <motion.div
        className="absolute inset-0 z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img 
          src="/images/aura_logo_3d.png" 
          alt="Aura Logo" 
          className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        />
      </motion.div>

      {/* SVG Background Pulse Logic */}
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full opacity-30 z-0"
        initial="initial"
        animate="animate"
      >
        {/* Pulsing Outer Glow */}
        <motion.path
          d="M50 5L89.1747 27.5V72.5L50 95L10.8253 72.5V27.5L50 5Z"
          stroke="url(#aura-gradient-outer)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        <defs>
          <linearGradient id="aura-gradient-outer" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </motion.svg>
      
      {/* Underlying Glow Pulse */}
      <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full scale-125 animate-pulse pointer-events-none" />
    </div>
  );
};

export default AuraLogo;
