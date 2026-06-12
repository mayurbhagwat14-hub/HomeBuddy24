import React, { forwardRef } from 'react';
import { useBranding } from '../../context/BrandingContext';
import StyledAppName from './StyledAppName';

/**
 * Centralized Logo Component
 * Usage: <Logo className="h-8 w-auto" />
 * Supports ref for animations
 */
const Logo = forwardRef(({ className = "h-8 w-auto", darkTheme = false, ...props }, ref) => {
  const { branding } = useBranding();

  const logoSrc = branding?.appLogo || "/HomeBuddy24-logo.png";

  const finalLogoSrc = logoSrc.startsWith('http') || logoSrc.startsWith('/') 
    ? logoSrc 
    : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${logoSrc}`;

  const isDefaultLogo = logoSrc === "/HomeBuddy24-logo.png";

  return (
    <div ref={ref} className={`flex items-center w-fit gap-1.5 ${className}`} {...props}>
      {isDefaultLogo ? (
        <div className={`relative h-full aspect-square overflow-hidden shrink-0 flex items-center justify-center rounded-xl ${darkTheme ? 'bg-white/20 shadow-md border border-white/20' : ''}`}>
          <img 
            src={finalLogoSrc} 
            alt="Icon" 
            className="absolute top-0 left-0 h-full w-auto max-w-none object-left"
          />
        </div>
      ) : (
        <img 
          src={finalLogoSrc} 
          alt="Logo" 
          className="h-full w-auto object-contain shrink-0 rounded-xl"
        />
      )}
      <StyledAppName className="font-extrabold tracking-tight whitespace-nowrap text-2xl drop-shadow-sm" style={{ marginLeft: '4px' }} darkTheme={darkTheme} />
    </div>
  );
});

Logo.displayName = 'Logo';

export default Logo;
