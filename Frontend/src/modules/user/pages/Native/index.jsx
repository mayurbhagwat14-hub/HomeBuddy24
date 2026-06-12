import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import NativeSmartLocks from './components/NativeSmartLocks';
import NativeROPurifiers from './components/NativeROPurifiers';
import BestInClassFeatures from './components/BestInClassFeatures';
import TestimonialsSection from './components/TestimonialsSection';
import BrandPhilosophy from './components/BrandPhilosophy';

const Native = () => {
  const [location, setLocation] = useState('...');

  // Auto-detect location on mount
  React.useEffect(() => {
    const autoDetectLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
              );
              const data = await response.json();

              if (data.status === 'OK' && data.results.length > 0) {
                const result = data.results[0];
                const getComponent = (type) =>
                  result.address_components.find(c => c.types.includes(type))?.long_name || '';

                const area = getComponent('sublocality_level_1') || getComponent('neighborhood') || getComponent('locality');
                const city = getComponent('locality') || getComponent('administrative_area_level_2');
                const state = getComponent('administrative_area_level_1');

                const formattedAddress = `${area}- ${city}- ${state}`;
                setLocation(formattedAddress);
              }
            } catch (error) {
            }
          },
          (error) => {
          }
        );
      }
    };

    autoDetectLocation();
  }, []);
  const [cartCount] = useState(0);

  const handleLocationClick = () => {
  };

  const handleCartClick = () => {
  };

  const handleKnowMoreClick = (productType) => {
  };

  const handleFeatureClick = (feature) => {
  };

  return (
        <div className="min-h-[100dvh] pb-32 relative bg-[#F8FAFC] overflow-x-hidden">
      {/* Premium Modern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>
      <Header
        location={location}
        cartCount={cartCount}
        onLocationClick={handleLocationClick}
        onCartClick={handleCartClick}
      />

      <main className="pt-1">
        <BestInClassFeatures onFeatureClick={handleFeatureClick} />
        <NativeSmartLocks onKnowMoreClick={handleKnowMoreClick} />
        <NativeROPurifiers onKnowMoreClick={handleKnowMoreClick} />
        <TestimonialsSection />
        <BrandPhilosophy />
      </main>

      <BottomNav />
    </div>
  );
};

export default Native;

