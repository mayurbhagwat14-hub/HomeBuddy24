import React, { useRef, useEffect, useState, memo, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BiRupee } from 'react-icons/bi';
import { FiHome, FiBriefcase, FiUser } from 'react-icons/fi';
import { HiHome, HiBriefcase, HiUser } from 'react-icons/hi';
import { FiBell } from 'react-icons/fi';
import { gsap } from 'gsap';
import { workerTheme as themeColors } from '../../../../theme';
import api from '../../../../services/api';

const BottomNav = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const iconRefs = useRef({});
  const activeAnimations = useRef({});
  const [pendingJobsCount, setPendingJobsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Load counts
  useEffect(() => {
    const updatePendingCount = () => {
      try {
        // Count pending assigned jobs (waiting for accept/reject)
        const assignedJobs = JSON.parse(localStorage.getItem('workerAssignedJobs') || '[]');
        const pendingJobs = assignedJobs.filter(job =>
          job.workerStatus === 'PENDING'
        );
        setPendingJobsCount(pendingJobs.length);
      } catch (error) {
        console.error('Error reading pending jobs:', error);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/worker');
        if (res.data.success && typeof res.data.unreadCount === 'number') {
          setUnreadNotificationsCount(res.data.unreadCount);
        }
      } catch (error) {
        // Silent fail
      }
    };

    updatePendingCount();
    fetchUnreadCount();

    window.addEventListener('storage', updatePendingCount);
    window.addEventListener('workerJobsUpdated', updatePendingCount);

    const interval = setInterval(fetchUnreadCount, 60000);

    return () => {
      window.removeEventListener('storage', updatePendingCount);
      window.removeEventListener('workerJobsUpdated', updatePendingCount);
      clearInterval(interval);
    };
  }, []);

  const navItems = useMemo(() => {
    return [
      { path: '/worker/dashboard', icon: FiHome, activeIcon: HiHome, label: 'Home' },
      { path: '/worker/jobs', icon: FiBriefcase, activeIcon: HiBriefcase, label: 'Jobs', badge: pendingJobsCount },
      { path: '/worker/wallet', icon: BiRupee, activeIcon: BiRupee, label: 'Wallet' },
      { path: '/worker/notifications', icon: FiBell, activeIcon: FiBell, label: 'Alerts', badge: unreadNotificationsCount },
      { path: '/worker/profile', icon: FiUser, activeIcon: HiUser, label: 'Profile' },
    ];
  }, [pendingJobsCount, unreadNotificationsCount]);

  const handleNavClick = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };



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

