import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiSave, FiSearch, FiHome } from 'react-icons/fi';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import vendorService from '../../../../services/vendorService';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import LocationPicker from '../../../user/pages/Checkout/components/LocationPicker';

const libraries = ['places', 'geometry'];

const AddressManagement = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState(''); // Display address
  const [houseNumber, setHouseNumber] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null); // { lat, lng, address, components... }
  const [autocomplete, setAutocomplete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  // Load saved address from backend
  useEffect(() => {
    const loadAddress = async () => {
      try {
        const response = await vendorService.getProfile();
        // Check if response has vendor data
        if (response.success && response.vendor?.address) {
          const addr = response.vendor.address;

          let displayAddress = '';
          let location = null;
          let houseNum = '';

          if (typeof addr === 'string') {
            displayAddress = addr;
          } else {
            // It's an object
            houseNum = addr.addressLine1 || '';
            displayAddress = addr.fullAddress ||
              addr.address ||
              '';

            // If we have city/pincode but no fullAddress, try to construct
            if (!displayAddress && addr.city) {
              displayAddress = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
            }

            if (addr.lat && addr.lng) {
              location = {
                lat: parseFloat(addr.lat),
                lng: parseFloat(addr.lng),
                address: displayAddress
              };
            }
          }

          setAddress(displayAddress);
          setSearchQuery(displayAddress);
          setHouseNumber(houseNum);
          if (location) {
            setSelectedLocation(location);
          }
        }
      } catch (error) {
        console.error('Error loading address:', error);
      }
    };
    loadAddress();
  }, []);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    // setAddress(location.address); 
    // Usually user selects from map -> we update search query & address field
    setSearchQuery(location.address);
    setAddress(location.address);
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
        setAddress(place.formatted_address);
        setSearchQuery(place.formatted_address);
      }
    }
  };

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const handleSave = async () => {
    if (!address || !selectedLocation) {
      toast.error('Please select an address');
      return;
    }

    setLoading(true);

    // Prepare full address object similar to `AddressSelectionModal`
    let city = '';
    let state = '';
    let pincode = '';
    let addressLine2 = '';

    // If we have components from Google API (either via map click or autocomplete)
    if (selectedLocation.components) {
      selectedLocation.components.forEach(comp => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
        if (comp.types.includes('postal_code')) pincode = comp.long_name;
        if (comp.types.includes('sublocality')) addressLine2 = comp.long_name;
      });
    }

    // We can also re-use existing logic from updateProfile controller which expects an object
    // consistent with what EditProfile sends.
    const addrData = {
      fullAddress: selectedLocation.address || address,
      addressLine1: houseNumber,
      addressLine2: addressLine2,
      city: city,
      state: state,
      pincode: pincode,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng
    };

    try {
      const response = await vendorService.updateProfile({
        address: addrData
      });

      if (response.success) {
        toast.success('Address saved successfully!');
        setTimeout(() => {
          //   navigate('/vendor/profile'); // Stay here or go back settings? User preference.
          //   Let's just show success. Or maybe go back.
        }, 500);
      } else {
        toast.error(response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: themeColors.backgroundGradient || 'linear-gradient(to bottom, #f0f9ff, #f9fafb)' }}>
      <Header
        title="Manage Business Address"
        showBack={true}
        onBack={() => navigate('/vendor/settings')}
      />

      <main className="max-w-md mx-auto px-4 py-8">
        {/* Info Card - Same logic as Modal */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-5 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full" style={{ background: themeColors.button }}></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${themeColors.button}15` }}>
              <FiMapPin className="w-5 h-5" style={{ color: themeColors.button }} />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-gray-800 tracking-wide mb-1">Set Business Location</h3>
              <p className="text-[12px] font-semibold text-gray-400 leading-relaxed">
                Place the pin accurately on the map to help customers locate you easily.
              </p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8 border border-white">
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialPosition={selectedLocation}
          />
        </div>

        {/* Form Inputs Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-6">

          {/* Address Autocomplete */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 block">
              Street Address / Area
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
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-blue-500 z-10" />
                  <input
                    type="text"
                    placeholder="Search for area, street name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 text-[15px]"
                  />
                </div>
              </Autocomplete>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Loading Maps..."
                  disabled
                  className="w-full pl-4 py-4 rounded-2xl bg-gray-100 text-[15px]"
                />
              </div>
            )}
          </div>

          {/* House Number */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 block">
              Shop / Building Number
            </label>
            <div className="relative group">
              <FiHome className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="e.g. Shop 101, Complex B"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 text-[15px]"
              />
            </div>
          </div>

          {/* Coordinates Display (Optional, for transparency) */}
          {selectedLocation && (
            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
               <span className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">Coordinates</span>
               <span className="text-[12px] font-bold text-gray-600 font-mono">
                 {selectedLocation.lat?.toFixed(5)}, {selectedLocation.lng?.toFixed(5)}
               </span>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={!searchQuery || !selectedLocation || loading}
              className="relative w-full overflow-hidden group rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ backgroundColor: themeColors.button }}></div>
              <div className="relative flex items-center justify-center gap-2 py-4 text-white font-black text-[15px] tracking-wide shadow-[0_10px_20px_rgba(0,0,0,0.15)]">
                <FiSave className="w-5 h-5" />
                {loading ? 'SAVING...' : 'SAVE BUSINESS ADDRESS'}
              </div>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default AddressManagement;
