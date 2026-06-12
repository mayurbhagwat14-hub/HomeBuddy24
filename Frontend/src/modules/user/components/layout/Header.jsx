import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiLocationMarker } from 'react-icons/hi';
import { gsap } from 'gsap';
import LocationSelector from '../common/LocationSelector';
import { animateLogo } from '../../../../utils/gsapAnimations';
import Logo from '../../../../components/common/Logo';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { themeColors } from '../../../../theme';

import CitySelectorModal from '../common/CitySelectorModal';
import { useCity } from '../../../../context/CityContext';
import { HiChevronDown } from 'react-icons/hi';

const Header = ({ location, onLocationClick, darkTheme = false }) => {
  const logoRef = useRef(null);
  const { currentCity } = useCity();
  const [isCityModalOpen, setIsCityModalOpen] = React.useState(false);

  useEffect(() => {
    if (logoRef.current) {
      animateLogo(logoRef.current);
    }
  }, []);

  return (
    <header className="relative overflow-hidden">
      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
        <div className="w-full">
          {/* Top Row: Logo (Left) and Location (Right) */}
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Left: Logo */}
            <Link
              to="/user/home"
              className="cursor-pointer shrink-0"
              onMouseEnter={() => {
                if (logoRef.current) {
                  gsap.to(logoRef.current, {
                    scale: 1.1,
                    filter: `drop-shadow(0 0 16px ${themeColors.brand.teal}40)`,
                    duration: 0.3,
                    ease: 'power2.out',
                  });
                }
              }}
              onMouseLeave={() => {
                if (logoRef.current) {
                  gsap.to(logoRef.current, {
                    scale: 1,
                    filter: '',
                    duration: 0.3,
                    ease: 'power2.out',
                  });
                }
              }}
            >
              <Logo
                ref={logoRef}
                className="h-9 sm:h-12 w-auto"
                darkTheme={darkTheme}
              />
            </Link>

            {/* Desktop Navigation - Hidden on Mobile */}
            <nav className="hidden lg:flex items-center gap-8 ml-10">
              <Link to="/user/home" className={`${darkTheme ? 'text-white' : 'text-gray-700'} font-semibold hover:text-[#347989] transition-colors`}>Home</Link>
              <Link to="/user/my-bookings" className={`${darkTheme ? 'text-white' : 'text-gray-700'} font-semibold hover:text-[#347989] transition-colors`}>Bookings</Link>
              <Link to="/user/scrap" className={`${darkTheme ? 'text-white' : 'text-gray-700'} font-semibold hover:text-[#347989] transition-colors`}>Scrap</Link>
              <Link to="/user/cart" className={`${darkTheme ? 'text-white' : 'text-gray-700'} font-semibold hover:text-[#347989] transition-colors`}>Cart</Link>
              <Link to="/user/account" className={`${darkTheme ? 'text-white' : 'text-gray-700'} font-semibold hover:text-[#347989] transition-colors`}>Account</Link>
            </nav>

            {/* Right: City & Location */}
            <div className="flex flex-col items-end gap-1 flex-1 min-w-0 ml-4">
              {/* Location Selector */}
              <div className="flex flex-col items-end cursor-pointer" onClick={onLocationClick}>
                <div className="flex items-center gap-1 mb-0.5">
                  <HiLocationMarker
                    className="w-4 h-4 shrink-0"
                    style={{ color: darkTheme ? '#ffffff' : '#00a6a6' }}
                  />
                  <span className="text-sm font-bold truncate max-w-[100px] sm:max-w-[160px]" style={{
                    color: darkTheme ? '#ffffff' : '#00a6a6'
                  }}>
                    {(() => {
                      if (!location || location === '...' || location === 'Select Location') return 'Select Location';
                      const parts = location.includes(',')
                        ? location.split(',').map(p => p.trim()).filter(Boolean)
                        : location.split('-').map(p => p.trim()).filter(Boolean);
                      if (parts.length === 0) return 'Select Location';
                      
                      let area = parts[0];
                      if (area.length <= 4 && parts[1]) {
                        area = `${parts[0]}, ${parts[1]}`;
                      }
                      return area;
                    })()}
                  </span>
                </div>
                <LocationSelector
                  location={location}
                  onLocationClick={onLocationClick}
                  darkTheme={darkTheme}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
      />
    </header>
  );
};

export default Header;
