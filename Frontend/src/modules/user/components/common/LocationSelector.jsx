import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { useCity } from '../../../../context/CityContext';

const LocationSelector = ({ location, onLocationClick, darkTheme = false }) => {
  const { currentCity } = useCity();

  // Format location to show only city name
  const formatLocation = (loc) => {
    if (!loc || loc === '...' || loc === 'Select Location') return '';
    
    // Split by comma first, fallback to hyphen
    const parts = loc.includes(',')
      ? loc.split(',').map(part => part.trim()).filter(Boolean)
      : loc.split('-').map(part => part.trim()).filter(Boolean);
      
    if (parts.length >= 2) {
      // Find the city part
      let city = '';
      if (parts.length >= 3) {
        // e.g., "16, Meera Path, Indore, MP" -> parts[0] is short, city is parts[2]
        const firstIsHouse = parts[0].length <= 4;
        city = firstIsHouse ? (parts[2] || parts[1]) : parts[1];
      } else {
        city = parts[1];
      }
      return city;
    }
    
    return parts[0] || '';
  };

  const formattedLocation = formatLocation(location);

  return (
    <div 
      className="flex items-center gap-1 cursor-pointer"
      onClick={onLocationClick}
    >
      <span className={`text-xs truncate max-w-[140px] leading-tight text-right ${darkTheme ? 'text-teal-100/80' : 'text-gray-500'}`}>
        {formattedLocation || currentCity?.name || 'Select City'}
      </span>
      <FiChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: '#F59E0B' }} />
    </div>
  );
};

export default LocationSelector;
