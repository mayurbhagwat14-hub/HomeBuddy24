import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiX, FiSearch, FiMapPin, FiHome } from 'react-icons/fi';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { themeColors } from '../../../../../theme';
import LocationPicker from './LocationPicker';

const libraries = ['places', 'geometry'];

const AddressSelectionModal = ({ isOpen, onClose, address = '', houseNumber = '', onHouseNumberChange, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapAddress, setMapAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [autocomplete, setAutocomplete] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      setIsClosing(false);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setMapAddress(location.address);
    setSearchQuery(location.address);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
          components: place.address_components
        };
        setSelectedLocation(location);
        setMapAddress(place.formatted_address);
        setSearchQuery(place.formatted_address);
      }
    }
  };

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <AnimatePresence>
      {isOpen && !isClosing && (
        <>
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-slate-900/40 z-[9998]"
            onClick={handleClose}
          />
          <motion.div 
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] px-2 sm:px-0"
          >
            {/* Close Button */}
            <div className="absolute -top-14 right-4 sm:right-6 z-[60]">
              <button
                onClick={handleClose}
                className="w-12 h-12 bg-white/90 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-white hover:scale-105 active:scale-95 transition-all"
              >
                <FiX className="w-6 h-6 text-slate-800" />
              </button>
            </div>

            <div
              className="bg-white/95 backdrop-blur-xl rounded-t-[32px] sm:rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/50"
              style={{
                height: '85vh',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle indicator */}
              <div className="w-full flex justify-center pt-4 pb-2 bg-transparent shrink-0">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="bg-transparent px-5 py-2 z-10 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={handleClose} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors border border-slate-100 active:scale-95 text-slate-700">
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-[20px] font-black text-slate-800 tracking-tight">Confirm Location</h1>
                </div>
              </div>

              {/* Info Card - Styled with Premium Look */}
              <div className="px-5 pt-4 shrink-0">
                <div className="relative overflow-hidden rounded-[24px] p-4 mb-2 shadow-sm border border-brand/20 bg-brand/5">
                  {/* Background Glow */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-brand/10">
                      <FiMapPin className="w-5 h-5 text-brand animate-bounce-slow" />
                    </div>
                    <div>
                      <h3 className="font-black mb-1 text-[15px] text-slate-800 tracking-tight">Set Delivery Location</h3>
                      <p className="text-[12px] font-medium text-slate-500 leading-relaxed pr-2">
                        Place the pin accurately on the map to help the professional find you easily.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="px-5 pb-3 shrink-0 relative mt-2">
                <div className="absolute inset-x-5 inset-y-0 bg-brand/5 blur-xl rounded-[24px]"></div>
                <div className="rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(52,121,137,0.15)] border-4 border-white relative z-10">
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialPosition={selectedLocation}
                  />
                </div>
              </div>

              {/* Address Details - Scrollable */}
              <div
                className="px-5 py-4 pb-10 overflow-y-auto flex-1"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain'
                }}
              >
                {/* Address Search */}
                <div className="mb-6">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                    Pinpoint your Address
                  </label>
                  {isLoaded ? (
                    <Autocomplete
                      onLoad={onAutocompleteLoad}
                      onPlaceChanged={onPlaceChanged}
                      options={{
                        componentRestrictions: { country: 'in' },
                        fields: ['formatted_address', 'geometry', 'name', 'address_components']
                      }}
                    >
                      <div className="relative group">
                        <div className="absolute inset-0 bg-brand/5 rounded-[20px] blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative bg-slate-50 border border-slate-200 rounded-[20px] shadow-sm flex items-center focus-within:border-brand/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10 transition-all overflow-hidden group-hover:bg-white group-hover:border-slate-300">
                          <div className="pl-5">
                            <FiSearch className="text-slate-400 group-focus-within:text-brand w-5 h-5 transition-colors" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search for area, street name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-3 pr-10 py-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent text-[15px] font-bold text-slate-800 placeholder-slate-400"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </Autocomplete>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Loading Maps..."
                        disabled
                        className="w-full pl-5 py-4 bg-slate-50 rounded-[20px] text-[15px] font-bold text-slate-400 border border-slate-200"
                      />
                    </div>
                  )}
                </div>

                {/* House/Flat Number - NEW */}
                <div className="mb-8">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                    House / Flat / Office No. <span className="text-slate-300 font-medium">(Optional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-brand/5 rounded-[20px] blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-slate-50 border border-slate-200 rounded-[20px] shadow-sm flex items-center focus-within:border-brand/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10 transition-all overflow-hidden group-hover:bg-white group-hover:border-slate-300">
                      <div className="pl-5">
                        <FiHome className="text-slate-400 group-focus-within:text-brand w-5 h-5 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Flat 101, Galaxy Tower"
                        value={houseNumber}
                        onChange={(e) => onHouseNumberChange(e.target.value)}
                        className="w-full pl-3 pr-4 py-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent text-[15px] font-bold text-slate-800 placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="px-1 relative pb-safe-bottom">
                  {/* Optional Background Glow when button is active */}
                  {mapAddress && (
                    <div className="absolute inset-0 bg-brand/40 rounded-[24px] blur-xl animate-pulse"></div>
                  )}
                  <button
                    onClick={() => onSave(houseNumber, selectedLocation)}
                    disabled={!mapAddress}
                    className="w-full relative py-4.5 rounded-[24px] font-black text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(52,121,137,0.3)] mb-8 uppercase tracking-[0.1em] text-[14px] overflow-hidden group"
                    style={{
                      background: !mapAddress ? '#cbd5e1' : themeColors.button,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">Verify & Save Address</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddressSelectionModal;
