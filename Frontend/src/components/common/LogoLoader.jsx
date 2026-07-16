import React from 'react';
import { motion } from 'framer-motion';
import { useBranding } from '../../context/BrandingContext';
import StyledAppName from './StyledAppName';

/**
 * LogoLoader Component
 * @param {boolean} fullScreen - If true, shows a full-screen overlay (for initial app load). 
 *                               If false, shows an inline loader (for route transitions).
 * @param {boolean} overlay - If true with fullScreen, uses solid white background. 
 *                            If false, uses transparent background (doesn't hide BottomNav).
 * @param {string} size - Size classes for the logo
 */
const LogoLoader = ({ fullScreen = false, overlay = false, inline = false, size = "w-20 h-20" }) => {
  // For route transitions (default), use a non-blocking loader
  // For initial app load, use fullScreen with overlay
  // For inline loading (e.g. buttons), use inline
  const containerClasses = fullScreen
    ? overlay
      ? "fixed inset-0 flex items-center justify-center bg-white z-[9999]"
      : "fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[100]"
    : inline
      ? "flex items-center justify-center"
      : "flex items-center justify-center w-full min-h-[60vh] pb-20"; // Leave space for bottom nav

  const { branding } = useBranding();
  const appName = branding?.appName || "HomeBuddy24";
  const logoSrc = branding?.appLogo || "/HomeBuddy24-logo.png";
  
  const finalLogoSrc = logoSrc.startsWith('http') || logoSrc.startsWith('/') 
    ? logoSrc 
    : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${logoSrc}`;
  
  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0.7 }}
        animate={{
          scale: [0.9, 1.05, 0.9],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`relative ${size} flex items-center justify-center`}
      >
        <div className="flex items-center gap-2 h-full">
          <div className="relative h-full aspect-square overflow-hidden shrink-0 flex items-center justify-center">
            <img 
              src={finalLogoSrc} 
              alt="Icon" 
              className={logoSrc === "/HomeBuddy24-logo.png" 
                ? "absolute top-0 left-0 h-full w-auto max-w-none object-left" 
                : "h-full w-full object-contain"}
            />
          </div>
          <StyledAppName className="font-extrabold tracking-tight whitespace-nowrap text-4xl" style={{ marginLeft: '-8px' }} />
        </div>
        {/* Subtle ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-teal-200"
          animate={{
            scale: [1, 1.4],
            opacity: [0.6, 0]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.div>
    </div>
  );
};

export default LogoLoader;
