import React from 'react';
import { motion } from 'framer-motion';

const AuraLogo = ({ size = 40, className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,168,204,0.5)]"
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <defs>
          <linearGradient id="aura-unique-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#0072FF" />
            <stop offset="100%" stopColor="#7000FF" />
          </linearGradient>
          <radialGradient id="aura-glow-unique" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00A8CC" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Geometric Frame - Hexagonal Bloom */}
        <motion.path
          d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z"
          stroke="url(#aura-unique-gradient)"
          strokeWidth="1.5"
          fill="rgba(0,168,204,0.03)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
        
        {/* Interlocking Secondary Frame */}
        <motion.path
          d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
          stroke="url(#aura-unique-gradient)"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Central Stylized 'A' - Kinetic Design */}
        <motion.path
          d="M35 75 L50 25 L65 75"
          stroke="url(#aura-unique-gradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        />
        <motion.path
          d="M42 58 H58"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        />

        {/* Pulsing Energy Rings */}
        {[38, 44, 50].map((r, i) => (
          <motion.circle 
            key={i}
            cx="50" cy="50" r={r} 
            stroke="url(#aura-unique-gradient)" 
            strokeWidth="0.2" 
            fill="none"
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, delay: i * 0.5, repeat: Infinity }}
          />
        ))}
        
        {/* Core Radiance */}
        <motion.circle 
          cx="50" cy="50" r="12" 
          fill="url(#aura-glow-unique)" 
          className="blur-[2px]"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.svg>
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00a8cc]/10 to-transparent rounded-full blur-2xl -z-10 animate-pulse" />
    </div>
  );
};

export default AuraLogo;
