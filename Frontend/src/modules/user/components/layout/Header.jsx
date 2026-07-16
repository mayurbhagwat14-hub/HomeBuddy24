import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiLocationMarker, HiChevronDown } from 'react-icons/hi';
import { gsap } from 'gsap';
import LocationSelector from '../common/LocationSelector';
import { animateLogo } from '../../../../utils/gsapAnimations';
import Logo from '../../../../components/common/Logo';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { themeColors } from '../../../../theme';

import CitySelectorModal from '../common/CitySelectorModal';
import { useCity } from '../../../../context/CityContext';
import NotificationBell from '../common/NotificationBell';

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
      <div className="relative z-10 pt-4">
        <div className="w-full">
          <div className="px-5 py-2 flex items-center justify-between">
            
            {/* Left: Location Selector */}
            <div className="flex flex-col cursor-pointer" onClick={onLocationClick}>
              <span className="text-[11px] font-medium text-white/80 mb-0.5 tracking-wide">Location</span>
              <div className="flex items-center gap-1.5">
                <HiLocationMarker className="w-4 h-4 text-[#F7C948]" />
                <span className="text-[15px] font-bold text-white">
                  {(() => {
                    if (!location || location === '...' || location === 'Select Location') return 'Select Location';
                    const parts = location.includes(',')
                      ? location.split(',').map(p => p.trim()).filter(Boolean)
                      : location.split('-').map(p => p.trim()).filter(Boolean);
                    if (parts.length === 0) return 'Select Location';
                    
                    // Filter out purely numeric parts or very short parts (like flat numbers)
                    const meaningfulParts = parts.filter(p => isNaN(p) && p.length > 2);
                    
                    if (meaningfulParts.length === 0) return parts[0];
                    
                    if (meaningfulParts.length > 1 && meaningfulParts[0].length <= 10) {
                      return `${meaningfulParts[0]}, ${meaningfulParts[1]}`;
                    }
                    
                    return meaningfulParts[0];
                  })()}
                </span>
                <HiChevronDown className="w-4 h-4 text-white/80 ml-1" />
              </div>
              {/* Hidden location selector for functionality */}
              <div className="hidden">
                <LocationSelector location={location} onLocationClick={onLocationClick} darkTheme={true} />
              </div>
            </div>

            {/* Right: Notification Bell */}
            <div className="relative">
              <NotificationBell variant="glass" />
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
