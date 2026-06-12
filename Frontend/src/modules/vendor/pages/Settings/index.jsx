import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiVolume2, FiGlobe, FiInfo, FiLogOut, FiTrash2, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import { vendorAuthService } from '../../../../services/authService';
import { registerFCMToken, removeFCMToken } from '../../../../services/pushNotificationService';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    language: 'en',
  });

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = JSON.parse(localStorage.getItem('vendorSettings') || '{}');
        if (Object.keys(savedSettings).length > 0) {
          setSettings(prev => ({ ...prev, ...savedSettings }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleToggle = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem('vendorSettings', JSON.stringify(updated));

    // Handle FCM Token registration/removal if notifications toggled
    if (key === 'notifications') {
      if (updated.notifications) {
        // Turning ON
        try {
          await registerFCMToken('vendor', true);
          toast.success('Notifications enabled');
        } catch (error) {
          console.error('Error enabling notifications:', error);
          toast.error('Failed to enable notifications');
          // Revert toggle if failed? For now, we keep UI in sync with intent.
        }
      } else {
        // Turning OFF
        try {
          await removeFCMToken('vendor');
          toast.success('Notifications disabled');
        } catch (error) {
          console.error('Error disabling notifications:', error);
        }
      }
    }
  };

  const handleLanguageChange = (lang) => {
    const updated = { ...settings, language: lang };
    setSettings(updated);
    localStorage.setItem('vendorSettings', JSON.stringify(updated));
  };

  const handleLogout = async () => {
    try {
      await vendorAuthService.logout();
      toast.success('Logged out successfully');
      navigate('/vendor/login');
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('vendorAccessToken');
      localStorage.removeItem('vendorRefreshToken');
      localStorage.removeItem('vendorData');
      toast.success('Logged out successfully');
      navigate('/vendor/login');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Clear all vendor data
      localStorage.removeItem('vendorProfile');
      localStorage.removeItem('vendorSettings');
      localStorage.removeItem('vendorWorkers');
      localStorage.removeItem('vendorAcceptedBookings');
      localStorage.removeItem('vendorWallet');
      localStorage.removeItem('vendorTransactions');
      // Navigate to home
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: themeColors.backgroundGradient || 'linear-gradient(to bottom, #f0f9ff, #f9fafb)' }}>
      <Header title="Settings" />

      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Notification Settings */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full" style={{ background: themeColors.button }}></div>
          <h3 className="text-[15px] font-black text-gray-800 tracking-wide mb-6">Notifications</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.button}15` }}>
                  <FiBell className="w-5 h-5" style={{ color: themeColors.button }} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-800">Push Notifications</p>
                  <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Receive booking alerts</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative w-[50px] h-7 rounded-full transition-all duration-300 shadow-inner ${settings.notifications ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span
                  className={`absolute top-[2px] left-[2px] w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${settings.notifications ? 'translate-x-[22px]' : 'translate-x-0'}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.button}15` }}>
                  <FiVolume2 className="w-5 h-5" style={{ color: themeColors.button }} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-800">Sound Alerts</p>
                  <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Play sound for new bookings</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('soundAlerts')}
                className={`relative w-[50px] h-7 rounded-full transition-all duration-300 shadow-inner ${settings.soundAlerts ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span
                  className={`absolute top-[2px] left-[2px] w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${settings.soundAlerts ? 'translate-x-[22px]' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Address Management */}
        <div
          className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white cursor-pointer group transition-all duration-300 hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 relative overflow-hidden"
          onClick={() => navigate('/vendor/address-management')}
        >
          <div className="absolute right-0 top-0 w-24 h-24 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500 opacity-50" style={{ backgroundColor: themeColors.button }}></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-white shadow-sm" style={{ backgroundColor: `${themeColors.button}15` }}>
                <FiMapPin className="w-5 h-5" style={{ color: themeColors.button }} />
              </div>
              <div>
                <p className="text-[15px] font-black text-gray-800 tracking-wide">Manage Address</p>
                <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Set your business location</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.button}15` }}>
              <FiGlobe className="w-4 h-4" style={{ color: themeColors.button }} />
            </div>
            <h3 className="text-[15px] font-black text-gray-800 tracking-wide">Language</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { code: 'en', name: 'English' },
              { code: 'hi', name: 'हिंदी' },
            ].map((lang) => {
              const isSelected = settings.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`relative py-3.5 px-4 rounded-2xl text-center transition-all duration-300 border-2 overflow-hidden ${
                    isSelected 
                    ? 'border-transparent text-white shadow-md' 
                    : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200'
                  }`}
                  style={isSelected ? { backgroundColor: themeColors.button } : {}}
                >
                  <span className={`relative z-10 font-bold text-[13px] tracking-wide ${isSelected ? 'text-white' : ''}`}>
                    {lang.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* About */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.button}15` }}>
              <FiInfo className="w-4 h-4" style={{ color: themeColors.button }} />
            </div>
            <h3 className="text-[15px] font-black text-gray-800 tracking-wide">About</h3>
          </div>

          <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-gray-800">Vendor App</p>
              <p className="text-[11px] font-semibold text-gray-400 mt-0.5">App Version: 1.0.0</p>
            </div>
            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black tracking-wider border border-green-100">
              UP TO DATE
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLogout();
            }}
            className="relative w-full overflow-hidden group rounded-2xl"
          >
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ backgroundColor: themeColors.button }}></div>
            <div className="relative flex items-center justify-center gap-2 py-4 text-white font-black text-[15px] tracking-wide shadow-[0_10px_20px_rgba(0,0,0,0.15)]">
              <FiLogOut className="w-5 h-5" />
              LOGOUT
            </div>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full py-4 rounded-2xl font-black text-[13px] tracking-wide text-red-500 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100/50"
          >
            <FiTrash2 className="w-4 h-4" />
            DELETE ACCOUNT
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;

