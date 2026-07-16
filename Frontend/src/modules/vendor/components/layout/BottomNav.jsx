import React, { useState, useEffect, memo, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BiRupee } from 'react-icons/bi';
import { FiHome, FiBriefcase, FiUsers, FiUser, FiShoppingBag } from 'react-icons/fi';
import { HiHome, HiBriefcase, HiUsers, HiUser, HiShoppingBag } from 'react-icons/hi';
import { FaWallet } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { vendorTheme as themeColors } from '../../../../theme';

const BottomNav = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingJobsCount, setPendingJobsCount] = useState(0);

  useEffect(() => {
    const updatePendingCount = () => {
      try {
        const acceptedBookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
        const activeJobs = acceptedBookings.filter(job => job.status === 'PENDING');
        setPendingJobsCount(activeJobs.length);
      } catch (error) {
        console.error('Error reading pending jobs:', error);
      }
    };

    updatePendingCount();
    window.addEventListener('storage', updatePendingCount);
    window.addEventListener('vendorJobsUpdated', updatePendingCount);

    return () => {
      window.removeEventListener('storage', updatePendingCount);
      window.removeEventListener('vendorJobsUpdated', updatePendingCount);
    };
  }, []);

  const navItems = useMemo(() => {
    const badgeCount = pendingJobsCount;
    return [
      { path: '/vendor/dashboard', icon: FiHome, activeIcon: HiHome },
      { path: '/vendor/jobs', icon: FiBriefcase, activeIcon: HiBriefcase, badge: badgeCount },
      { path: '/vendor/wallet', icon: FaWallet, activeIcon: FaWallet },
      { path: '/vendor/profile', icon: FiUser, activeIcon: HiUser },
    ];
  }, [pendingJobsCount]);

  const handleNavClick = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const hideNavRoutes = [
    '/vendor/booking-alert/',
    '/vendor/booking/',
  ];

  const shouldHideNav = hideNavRoutes.some(route =>
    location.pathname.includes(route) &&
    (location.pathname.includes('/map') || location.pathname.includes('/alert/'))
  );

  if (shouldHideNav) {
    return null;
  }

    return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[380px] lg:hidden">
      <div className="bg-[#1A202C] rounded-full shadow-2xl px-5 py-2.5 flex items-center justify-between border border-white/10 relative overflow-hidden">
        {navItems.map((item) => {
          // Identify if active based on structure
          let isActive = false;
          if (item.id) {
            isActive = (typeof activeTab !== 'undefined') ? (activeTab === item.id) : false;
          } else {
            isActive = location.pathname === item.path || (item.path.includes('dashboard') && location.pathname.endsWith(item.path.split('/')[1]));
          }
          
          const IconComponent = isActive ? (item.activeIcon || item.filledIcon || item.icon) : item.icon;

          return (
            <button
              key={item.id || item.path}
              onClick={() => (typeof handleTabClick !== 'undefined') ? handleTabClick(item.path) : handleNavClick(item.path)}
              className="relative flex flex-col items-center justify-center w-12 h-10 transition-all duration-300 group"
            >
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative transition-transform duration-300">
                  <IconComponent
                    className="w-6 h-6 transition-colors duration-300"
                    style={{
                      color: isActive ? '#008080' : '#6B7280',
                      filter: isActive ? 'drop-shadow(0 0 8px rgba(0, 128, 128, 0.5))' : 'none',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                  {(item.badge !== undefined && item.badge > 0 || (item.isCart && cartCount > 0)) && (
                    <span
                      className="absolute bg-gradient-to-br from-red-500 to-red-600 text-white font-bold rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        top: '-4px',
                        right: '-8px',
                        minWidth: '16px',
                        height: '16px',
                        padding: '0 4px',
                        fontSize: '9px',
                        border: '1.5px solid #1A202C',
                        zIndex: 50,
                      }}
                    >
                      {(item.badge || cartCount) > 9 ? '9+' : (item.badge || cartCount)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
export default BottomNav;


