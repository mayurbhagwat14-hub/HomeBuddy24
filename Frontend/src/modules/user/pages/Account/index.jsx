import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import { userAuthService } from '../../../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useBranding } from '../../../../context/BrandingContext';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiUser,
  FiEdit3,
  FiClipboard,
  FiHeadphones,
  FiFileText,
  FiStar,
  FiMapPin,
  FiCreditCard,
  FiSettings,
  FiChevronRight,
  FiBell,
  FiShoppingBag,
  FiLogOut,
  FiGift,
  FiShield,
  FiZap,
  FiCheckCircle,
  FiPackage
} from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import NotificationBell from '../../components/common/NotificationBell';

const Account = () => {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const appName = branding?.appName || 'HomeBuddy24';
  const [userProfile, setUserProfile] = useState({
    name: 'Verified Customer',
    phone: '',
    email: '',
    isPhoneVerified: false,
    isEmailVerified: false,
    walletBalance: 0,
    plans: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First check localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserProfile({
            name: userData.name || 'Verified Customer',
            phone: userData.phone || '',
            email: userData.email || '',
            isPhoneVerified: userData.isPhoneVerified || false,
            isEmailVerified: userData.isEmailVerified || false,
            profilePhoto: userData.profilePhoto || '',
            walletBalance: userData.wallet?.balance ?? 0
          });
        }

        // Fetch fresh data from API
        const response = await userAuthService.getProfile();
        if (response.success && response.user) {
          setUserProfile({
            name: response.user.name || 'Verified Customer',
            phone: response.user.phone || '',
            email: response.user.email || '',
            isPhoneVerified: response.user.isPhoneVerified || false,
            isEmailVerified: response.user.isEmailVerified || false,
            profilePhoto: response.user.profilePhoto || '',
            walletBalance: response.user.wallet?.balance ?? 0,
            plans: response.user.plans
          });
        }
      } catch (error) {
        // Use localStorage data if API fails
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserProfile({
            name: userData.name || 'Verified Customer',
            phone: userData.phone || '',
            email: userData.email || '',
            isPhoneVerified: userData.isPhoneVerified || false,
            isEmailVerified: userData.isEmailVerified || false
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('+91')) return phone;
    if (phone.length === 10) return `+91 ${phone}`;
    return phone;
  };

  // Get initials for avatar
  const getInitials = () => {
    if (userProfile.name && userProfile.name !== 'Verified Customer') {
      const names = userProfile.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (userProfile.phone) {
      return userProfile.phone.slice(-2);
    }
    return 'VC';
  };

  const handleLogout = async () => {
    try {
      await userAuthService.logout();
      toast.success('Logged out successfully');
      navigate('/user/login');
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      toast.success('Logged out successfully');
      navigate('/user/login');
    }
  };

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-gray-900", badge }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white/70 backdrop-blur-xl rounded-[20px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,128,128,0.1)] transition-all group mb-3 hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${color === 'text-red-500' ? 'bg-red-50' : 'bg-gray-50 group-hover:bg-[#008080]/10'}`}
          style={{ color: color === 'text-red-500' ? '#EF4444' : '#008080' }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className={`font-bold text-[15px] ${color === 'text-red-500' ? 'text-red-500' : 'text-gray-800'}`}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {badge && (
          <span className="px-3 py-1 bg-red-500/10 text-red-600 text-[10px] font-black tracking-widest rounded-full uppercase">
            {badge}
          </span>
        )}
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#008080] transition-colors duration-300 shadow-sm border border-gray-100/50 group-hover:border-transparent">
          <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" />
        </div>
      </div>
    </motion.button>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-32 relative bg-[#F8FAFC] overflow-x-hidden">
      {/* Premium Modern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Premium Transparent Header */}
        <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/60 border-b border-white px-5 py-5 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-white"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-800" />
            </motion.button>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account</h1>
          </div>
          <NotificationBell />
        </header>

        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-4 pt-6 max-w-lg mx-auto"
        >
          {/* Elevated Profile Card */}
          <motion.div
            variants={itemVariants}
            className="bg-[#0F172A] rounded-[32px] p-6 shadow-[0_20px_40px_-15px_rgba(0,128,128,0.3)] mb-8 relative overflow-hidden border border-white/10"
          >
            {/* Vivid Brand Accents inside dark card */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 blur-[80px] opacity-[0.4]"
              style={{ backgroundColor: '#008080' }}
            ></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full -ml-24 -mb-24 blur-[60px] opacity-[0.3]"
              style={{ backgroundColor: '#D68F35' }}
            ></div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-full p-1 bg-white/10 backdrop-blur-md shadow-2xl">
                  {userProfile.profilePhoto ? (
                    <img
                      src={userProfile.profilePhoto}
                      alt={userProfile.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center text-white font-black text-2xl bg-gradient-to-br from-[#008080] to-[#00A6A6] shadow-inner">
                      {getInitials()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/user/update-profile')}
                  className="absolute bottom-0 right-0 p-2 bg-white text-[#008080] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.2)] active:scale-95 transition-transform hover:scale-110 border-2 border-[#0F172A]"
                >
                  <FiEdit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-white truncate mb-1">
                  {userProfile.name}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs text-gray-400 font-bold tracking-widest">
                    {userProfile.phone ? formatPhoneNumber(userProfile.phone) : 'No phone linked'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/user/update-profile')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors backdrop-blur-sm border border-white/10"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </motion.div>

          {/* Designer Active Plan Card */}
          {userProfile.plans && userProfile.plans.isActive && (
            <motion.div
              variants={itemVariants}
              onClick={() => navigate('/user/my-plan')}
              className="relative overflow-hidden mb-6 rounded-[28px] p-6 text-white cursor-pointer group transition-all"
              style={{
                background: `linear-gradient(135deg, ${themeColors.brand.teal} -10%, ${themeColors.brand.orange} 120%)`,
                boxShadow: `0 20px 40px -12px ${themeColors.brand.teal}40`
              }}
            >
              {/* Decorative elements */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FiShield className="w-4 h-4 text-white/80" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Membership Status</span>
                  </div>
                  <h3 className="text-2xl font-black mb-1">{userProfile.plans.name}</h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full w-fit mt-3 border border-white/10">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Expires: {new Date(userProfile.plans.expiry).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                  <FiZap className="w-8 h-8 fill-white text-white drop-shadow-lg" />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                <span className="text-xs font-bold text-white/80">Manage Benefits</span>
                <FiChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          )}

          {/* Quick Actions Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => navigate('/user/wallet')}
              className="bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,128,128,0.1)] transition-all text-left group hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-[18px] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-[#008080]/10 text-[#008080]">
                <MdAccountBalanceWallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Balance</span>
                <p className={`text-2xl font-black mt-1 ${userProfile.walletBalance < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                  ₹{Math.abs(userProfile.walletBalance || 0).toLocaleString('en-IN')}
                  {userProfile.walletBalance < 0 && <span className="text-xs font-normal ml-1">(Penalty)</span>}
                </p>
              </div>
            </button>
            <button
              onClick={() => navigate('/user/rewards')}
              className="bg-gradient-to-br from-gray-900 via-[#1e293b] to-black p-5 rounded-[24px] shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all text-left relative overflow-hidden group hover:-translate-y-1 border border-white/10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D68F35]/20 blur-3xl rounded-full"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-white/10 text-[#D68F35] rounded-[18px] flex items-center justify-center mb-4 backdrop-blur-md group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                  <FiGift className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">Rewards</span>
                  <p className="text-xl font-black text-white mt-1">Refer & Earn</p>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Menu Groups */}

          {/* Shopping */}
          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Shopping</h3>
            <MenuItem
              icon={FiShoppingBag}
              label="Scrap Deals"
              onClick={() => navigate('/user/scrap')}
            />
            <MenuItem
              icon={FiFileText}
              label="My Plans"
              onClick={() => navigate('/user/my-plan')}
            />
          </motion.div>

          {/* Activity */}
          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Activity</h3>
            <MenuItem
              icon={FiClipboard}
              label="My Bookings"
              onClick={() => navigate('/user/my-bookings')}
            />
            <MenuItem
              icon={FiPackage}
              label="My Store Orders"
              onClick={() => navigate('/user/store/orders')}
            />
            <MenuItem
              icon={FiStar}
              label="My Ratings"
              onClick={() => navigate('/user/my-rating')}
            />
          </motion.div>

          {/* Preferences */}
          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Preferences</h3>
            <MenuItem
              icon={FiMapPin}
              label="Manage Addresses"
              onClick={() => navigate('/user/manage-addresses')}
            />

            <MenuItem
              icon={FiSettings}
              label="Settings"
              onClick={() => navigate('/user/settings')}
            />
          </motion.div>

          {/* Support & Legal */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-2">Support & More</h3>
            <MenuItem
              icon={FiHeadphones}
              label="Help & Support"
              onClick={() => navigate('/user/help-support')}
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/user/about-HomeBuddy24')}
              className="w-full flex items-center justify-between p-4 bg-white/70 backdrop-blur-xl rounded-[20px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,128,128,0.1)] transition-all group mb-3 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 transition-colors group-hover:bg-[#008080]/10 text-[#008080]">
                  <span className="font-black text-lg">{appName.charAt(0).toUpperCase()}</span>
                </div>
                <span className="font-bold text-[15px] text-gray-800">About {appName}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#008080] transition-colors duration-300 shadow-sm border border-gray-100/50 group-hover:border-transparent">
                <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" />
              </div>
            </motion.button>
            <div className="h-6"></div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="relative w-full flex items-center justify-center gap-3 p-5 rounded-[20px] text-white font-black uppercase tracking-widest shadow-[0_12px_30px_rgba(239,68,68,0.3)] hover:shadow-[0_16px_40px_rgba(239,68,68,0.4)] transition-all mb-3 overflow-hidden group hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <FiLogOut className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Log out securely</span>
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center pb-8 opacity-60">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Version 7.6.27 R547</p>
          </motion.div>

        </motion.main>
      </div>
    </div>
  );
};

export default Account;
