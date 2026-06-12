import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiEdit2, FiMapPin, FiPhone, FiMail, FiBriefcase, FiStar, FiArrowRight, FiSettings, FiChevronRight, FiCreditCard, FiLogOut, FiTrash2 } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { vendorTheme as themeColors } from '../../../../theme';
import { vendorAuthService } from '../../../../services/authService';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import LogoLoader from '../../../../components/common/LogoLoader';
import { useBranding } from '../../../../context/BrandingContext';

const Profile = () => {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const appName = branding?.appName || 'HomeBuddy24';

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const menuItems = [
    { id: 2, label: 'Wallet', icon: FaWallet, path: '/vendor/wallet' },
    { id: 5, label: 'My Ratings', icon: FiStar, path: '/vendor/my-ratings' },
    { id: 6, label: 'Manage Payment Methods', icon: FiCreditCard, path: '/vendor/manage-payment-methods' },
    { id: 7, label: 'Manage Address', icon: FiMapPin, path: '/vendor/address-management' },
    { id: 8, label: 'Settings', icon: FiSettings, path: '/vendor/settings' },
    { id: 9, label: `About ${appName}`, icon: null, customIcon: appName.charAt(0).toUpperCase(), path: '/vendor/about-HomeBuddy24' },
  ];

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchProfile = async () => {
      // Try to load from local storage first for immediate display
      const storedVendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
      if (storedVendorData && Object.keys(storedVendorData).length > 0) {
        setProfile({
          name: storedVendorData.name || 'Vendor Name',
          businessName: storedVendorData.businessName || null,
          phone: storedVendorData.phone || '',
          email: storedVendorData.email || '',
          address: storedVendorData.address ?
            (typeof storedVendorData.address === 'string' ? storedVendorData.address :
              `${storedVendorData.address.addressLine1 || ''} ${storedVendorData.address.addressLine2 || ''} ${storedVendorData.address.city || ''} ${storedVendorData.address.state || ''} ${storedVendorData.address.pincode || ''}`.trim() || 'Not set')
            : 'Not set',
          rating: storedVendorData.rating || 0,
          totalJobs: storedVendorData.totalJobs || 0,
          completionRate: storedVendorData.completionRate || 0,
          serviceCategory: storedVendorData.service || '',
          skills: [],
          photo: storedVendorData.profilePhoto || null,
          approvalStatus: storedVendorData.approvalStatus,
          isPhoneVerified: storedVendorData.isPhoneVerified || false,
          isEmailVerified: storedVendorData.isEmailVerified || false
        });
        setIsLoading(false); // Show content immediately
      }

      setError(null);
      try {
        const response = await vendorAuthService.getProfile();
        if (response.success) {
          const vendorData = response.vendor;
          // Format address
          const addressString = vendorData.address
            ? (typeof vendorData.address === 'string' ? vendorData.address :
              `${vendorData.address.addressLine1 || ''} ${vendorData.address.addressLine2 || ''} ${vendorData.address.city || ''} ${vendorData.address.state || ''} ${vendorData.address.pincode || ''}`.trim() || 'Not set')
            : 'Not set';

          setProfile({
            name: vendorData.name || 'Vendor Name',
            businessName: vendorData.businessName || null,
            phone: vendorData.phone || '',
            email: vendorData.email || '',
            address: addressString,
            rating: vendorData.rating || 0,
            totalJobs: vendorData.totalJobs || 0,
            completionRate: vendorData.completionRate || 0,
            serviceCategory: vendorData.service || '',
            skills: [],
            photo: vendorData.profilePhoto || null,
            approvalStatus: vendorData.approvalStatus,
            isPhoneVerified: vendorData.isPhoneVerified || false,
            isEmailVerified: vendorData.isEmailVerified || false
          });
          localStorage.setItem('vendorData', JSON.stringify(vendorData));
        } else {
          // If API fails but we have local data, stick with it?
          if (!storedVendorData || Object.keys(storedVendorData).length === 0) {
            setError(response.message || 'Failed to fetch profile');
            toast.error(response.message || 'Failed to fetch profile');
          }
        }
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
        if (!storedVendorData || Object.keys(storedVendorData).length === 0) {
          setError(err.response?.data?.message || 'Failed to fetch profile');
          toast.error(err.response?.data?.message || 'Failed to fetch profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    window.addEventListener('vendorDataUpdated', fetchProfile);
    window.addEventListener('vendorProfileUpdated', fetchProfile);

    return () => {
      window.removeEventListener('vendorDataUpdated', fetchProfile);
      window.removeEventListener('vendorProfileUpdated', fetchProfile);
    };
  }, []);

  if (isLoading) {
    return <LogoLoader />;
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: themeColors.backgroundGradient }}>
        <div className="text-center p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error loading profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:opacity-90"
            style={{ backgroundColor: themeColors.button }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Profile" />

      <main className="px-4 pt-4 pb-6">
        {/* Profile Header Card */}
        <div
          className="rounded-[32px] p-6 mb-6 shadow-[0_12px_40px_rgba(0,128,128,0.25)] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Decorative Glowing Orbs */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#008080] rounded-full blur-[40px] opacity-40 pointer-events-none"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500 rounded-full blur-[30px] opacity-30 pointer-events-none"></div>

          <div className="relative z-10 flex items-start gap-5">
            {/* Profile Photo - Rounded Square with Rating Below */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-[84px] h-[84px] rounded-[24px] flex items-center justify-center overflow-hidden mb-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-10 h-10 text-white/80" />
                )}
              </div>
              {/* Star Rating Below Photo */}
              {profile.rating > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-white/10 backdrop-blur-md border border-white/10">
                  <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-current" style={{ filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.5))' }} />
                  <span className="text-xs font-black text-white">{profile.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Name and Info */}
            <div className="flex-1 min-w-0 flex flex-col pt-1">
              <h2 className="text-2xl font-black text-white mb-0.5 tracking-tight break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{profile.name}</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{profile.businessName}</p>

              {/* Phone and Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/5">
                    <FiPhone className="w-3 h-3 text-teal-400" />
                  </div>
                  <span className="text-xs text-white/90 font-medium break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/5">
                    <FiMail className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-xs text-white/90 font-medium break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{profile.email}</span>
                </div>
              </div>
            </div>

            {/* Navigate Button */}
            <button
              onClick={() => navigate('/vendor/profile/details')}
              className="p-3.5 rounded-2xl flex-shrink-0 transition-transform hover:translate-x-1"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <FiArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Three Cards Section - Horizontal */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {/* Active Jobs */}
            <button
              onClick={() => navigate('/vendor/jobs')}
              className="flex flex-col items-center justify-center p-4 rounded-[24px] transition-all duration-300 relative overflow-hidden bg-white group hover:-translate-y-1"
              style={{
                boxShadow: '0 8px 25px -4px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div
                className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                  boxShadow: '0 6px 16px rgba(14, 165, 233, 0.3)',
                }}
              >
                <FiBriefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center leading-tight">
                Active Jobs
              </span>
            </button>

            {/* Wallet */}
            <button
              onClick={() => navigate('/vendor/wallet')}
              className="flex flex-col items-center justify-center p-4 rounded-[24px] transition-all duration-300 relative overflow-hidden bg-white group hover:-translate-y-1"
              style={{
                boxShadow: '0 8px 25px -4px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div
                className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)',
                }}
              >
                <FaWallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center leading-tight">
                Wallet
              </span>
            </button>

            {/* Workers */}
            <button
              onClick={() => navigate('/vendor/workers')}
              className="flex flex-col items-center justify-center p-4 rounded-[24px] transition-all duration-300 relative overflow-hidden bg-white group hover:-translate-y-1"
              style={{
                boxShadow: '0 8px 25px -4px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div
                className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  boxShadow: '0 6px 16px rgba(139, 92, 246, 0.3)',
                }}
              >
                <FiUser className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center leading-tight">
                Workers
              </span>
            </button>
          </div>
        </div>

        {/* Menu List Section */}
        <div className="px-4 mb-6 space-y-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-[24px] shadow-[0_8px_25px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08)] transition-all active:scale-[0.98] group hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  {item.customIcon ? (
                    <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 bg-gray-50 border border-gray-100 group-hover:bg-[#008080]/10 transition-colors">
                      <span className="text-sm font-black text-[#008080]">{item.customIcon}</span>
                    </div>
                  ) : (
                    IconComponent && (
                      <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 bg-gray-50 border border-gray-100 group-hover:bg-[#008080]/10 transition-colors">
                        <IconComponent className="w-5 h-5 text-gray-500 group-hover:text-[#008080] transition-colors" />
                      </div>
                    )
                  )}
                  <span className="text-[15px] font-bold text-gray-800 text-left">
                    {item.label}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#008080] transition-colors">
                  <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="px-4 mb-3">
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                await vendorAuthService.logout();
                toast.success('Logged out successfully');
                navigate('/vendor/login');
              } catch (error) {
                localStorage.removeItem('vendorAccessToken');
                localStorage.removeItem('vendorRefreshToken');
                localStorage.removeItem('vendorData');
                toast.success('Logged out successfully');
                navigate('/vendor/login');
              }
            }}
            className="w-full font-bold py-4 rounded-[24px] active:scale-[0.98] transition-all text-white flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.35)',
            }}
          >
            <FiLogOut className="w-5 h-5" />
            Logout Securely
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;

