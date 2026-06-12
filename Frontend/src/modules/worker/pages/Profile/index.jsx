import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiEdit2, FiMapPin, FiPhone, FiMail, FiBriefcase, FiStar, FiChevronRight, FiTag, FiLogOut, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { workerTheme as themeColors, vendorTheme } from '../../../../theme';
import { workerAuthService } from '../../../../services/authService';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import LogoLoader from '../../../../components/common/LogoLoader';

const Profile = () => {
  const navigate = useNavigate();
  // Initialize with empty/default values - will be loaded from localStorage
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
      setIsLoading(true);
      setError(null);
      try {
        const response = await workerAuthService.getProfile();
        if (response.success) {
          const workerData = response.worker;
          // Format address
          const addressString = workerData.address
            ? `${workerData.address.addressLine1 || ''} ${workerData.address.addressLine2 || ''} ${workerData.address.city || ''} ${workerData.address.state || ''} ${workerData.address.pincode || ''}`.trim() || 'Not set'
            : 'Not set';

          setProfile({
            name: workerData.name || 'Worker Name',
            phone: workerData.phone || '',
            email: workerData.email || '',
            address: addressString,
            rating: workerData.rating || 0,
            totalJobs: workerData.totalJobs || 0,
            completedJobs: workerData.completedJobs || 0,
            serviceCategories: workerData.serviceCategories || (workerData.serviceCategory ? [workerData.serviceCategory] : []),
            photo: workerData.profilePhoto || null,
            isPhoneVerified: workerData.isPhoneVerified || false,
            isEmailVerified: workerData.isEmailVerified || false
          });
          localStorage.setItem('workerData', JSON.stringify(workerData));
        } else {
          setError(response.message || 'Failed to fetch profile');
          toast.error(response.message || 'Failed to fetch profile');
          // Fallback to local storage if API fails
          const localWorkerData = JSON.parse(localStorage.getItem('workerData') || '{}');
          if (localWorkerData && Object.keys(localWorkerData).length > 0) {
            setProfile({
              name: localWorkerData.name || 'Worker Name',
              phone: localWorkerData.phone || '',
              email: localWorkerData.email || '',
              address: 'Not set',
              rating: localWorkerData.rating || 0,
              totalJobs: localWorkerData.totalJobs || 0,
              completedJobs: localWorkerData.completedJobs || 0,
              serviceCategories: localWorkerData.serviceCategories || (localWorkerData.serviceCategory ? [localWorkerData.serviceCategory] : []),
              photo: localWorkerData.profilePhoto || null
            });
            toast('Loaded profile from local storage (API failed)');
          }
        }
      } catch (err) {
        console.error('Error fetching worker profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch profile');
        toast.error(err.response?.data?.message || 'Failed to fetch profile');
        // Fallback to local storage if API fails
        const localWorkerData = JSON.parse(localStorage.getItem('workerData') || '{}');
        if (localWorkerData && Object.keys(localWorkerData).length > 0) {
          setProfile({
            name: localWorkerData.name || 'Worker Name',
            phone: localWorkerData.phone || '',
            email: localWorkerData.email || '',
            address: 'Not set',
            rating: localWorkerData.rating || 0,
            totalJobs: localWorkerData.totalJobs || 0,
            completedJobs: localWorkerData.completedJobs || 0,
            serviceCategories: localWorkerData.serviceCategories || (localWorkerData.serviceCategory ? [localWorkerData.serviceCategory] : []),
            photo: localWorkerData.profilePhoto || null
          });
          toast('Loaded profile from local storage (API failed)');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await workerAuthService.logout();
      toast.success('Logged out successfully');
      navigate('/worker/login');
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('workerAccessToken');
      localStorage.removeItem('workerRefreshToken');
      localStorage.removeItem('workerData');
      toast.success('Logged out successfully');
      navigate('/worker/login');
    }
  };

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
    <div className="min-h-screen pb-20 relative bg-gray-50 font-sans" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Profile" />

      {/* Background Decorative Blur */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-teal-500/10 to-transparent -z-10 pointer-events-none" />

      <main className="px-4 pt-6 pb-8 space-y-6">
        
        {/* Profile Card (Glassmorphic & Modern) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[2rem] p-6 overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.4)',
          }}
        >
          {/* Decorative shapes */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          
          <button
            onClick={() => navigate('/worker/profile/edit')}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 active:scale-95 z-20 shadow-lg"
          >
            <FiEdit2 className="w-5 h-5 text-white" />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-teal-400 to-blue-500 mb-4 shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-900">
                {profile.photo ? (
                  <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-10 h-10 text-slate-400" />
                )}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{profile.name}</h2>
            <div className="flex items-center justify-center gap-2 mb-5">
               <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm">
                 Professional Worker
               </span>
            </div>

            <div className="flex items-center justify-center gap-4 w-full pt-5 border-t border-white/10">
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xl font-bold text-white">{profile.rating}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Rating</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-xl font-bold text-white mb-1">{profile.completedJobs}</span>
                <span className="text-xs text-slate-400 font-medium">Completed Jobs</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Personal Info */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
               Personal Information
            </h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-inner">
                  <FiPhone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Phone Number</p>
                  <p className="text-[15px] font-bold text-slate-800">{profile.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600 shadow-inner">
                  <FiMail className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="text-[15px] font-bold text-slate-800 truncate">{profile.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 shadow-inner">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Address</p>
                  <p className="text-[15px] font-bold text-slate-800 leading-snug">{profile.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Service Expertise</h3>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600 shadow-inner">
                  <FiBriefcase className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">Categories</p>
                  {profile.serviceCategories && profile.serviceCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.serviceCategories.map((cat, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-xl text-[13px] font-bold border border-slate-200 shadow-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[15px] font-bold text-slate-800">Not set</p>
                  )}
                </div>
              </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 pt-2"
        >
          <button
            onClick={() => navigate('/worker/settings')}
            className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 transition-all active:scale-[0.98] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                <FiSettings className="w-5 h-5 text-slate-700" />
              </div>
              <span className="font-bold text-slate-800">App Settings</span>
            </div>
            <FiChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 transition-all active:scale-[0.98] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <FiLogOut className="w-5 h-5 text-red-500" />
              </div>
              <span className="font-bold text-red-500">Log Out</span>
            </div>
            <FiChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </motion.div>

      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;

