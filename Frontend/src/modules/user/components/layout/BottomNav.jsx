import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGift, FiShoppingCart, FiUser, FiTrash2, FiCalendar } from 'react-icons/fi';
import { HiHome, HiGift, HiShoppingCart, HiUser, HiTrash, HiCalendar } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useCart } from '../../../../context/CartContext';
<<<<<<< HEAD
import { themeColors } from '../../../../theme';
=======
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86

const BottomNav = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const navItems = useMemo(() => [
<<<<<<< HEAD
    { id: 'home', icon: FiHome, filledIcon: HiHome, path: '/user/home', label: 'Home' },
    { id: 'bookings', icon: FiCalendar, filledIcon: HiCalendar, path: '/user/my-bookings', label: 'Bookings' },
    { id: 'cart', icon: FiShoppingCart, filledIcon: HiShoppingCart, path: '/user/cart', isCart: true, label: 'Cart' },
    { id: 'account', icon: FiUser, filledIcon: HiUser, path: '/user/account', label: 'Account' },
=======
    { id: 'home', icon: FiHome, filledIcon: HiHome, path: '/user/home' },
    { id: 'bookings', icon: FiCalendar, filledIcon: HiCalendar, path: '/user/my-bookings' },
    { id: 'cart', icon: FiShoppingCart, filledIcon: HiShoppingCart, path: '/user/cart', isCart: true },
    { id: 'account', icon: FiUser, filledIcon: HiUser, path: '/user/account' },
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
  ], []);

  const getActiveTab = () => {
    if (location.pathname === '/user/home' || location.pathname === '/user/home/') return 'home';
    if (location.pathname === '/user/my-bookings') return 'bookings';
    if (location.pathname === '/user/cart') return 'cart';
    if (location.pathname === '/user/account') return 'account';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (path) => {
    navigate(path);
  };

<<<<<<< HEAD
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[380px] lg:hidden">
      <div className="glass-panel rounded-full px-2 py-2 flex items-center justify-between relative overflow-hidden bg-white/80 border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.08)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = isActive ? item.filledIcon : item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-12 transition-all duration-300 group"
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-brand-light rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className="relative flex flex-col items-center gap-0.5"
                >
                  <IconComponent
                    className="w-5 h-5 transition-colors duration-300"
                    style={{
                      color: isActive ? themeColors.brand.teal : '#94a3b8',
                      filter: isActive ? `drop-shadow(0 2px 4px ${themeColors.brand.teal}40)` : 'none',
                    }}
                  />
                  {isActive && (
                     <span className="text-[10px] font-bold tracking-tight" style={{ color: themeColors.brand.teal }}>
                       {item.label}
                     </span>
                  )}
                  {(item.isCart && cartCount > 0) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bg-orange-500 text-white font-bold rounded-full flex items-center justify-center shadow-md"
                      style={{
                        top: '-6px',
                        right: isActive ? '-2px' : '-8px',
=======
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
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                        minWidth: '16px',
                        height: '16px',
                        padding: '0 4px',
                        fontSize: '9px',
<<<<<<< HEAD
                        border: '1.5px solid #ffffff',
                        zIndex: 50,
                      }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </motion.div>
=======
                        border: '1.5px solid #1A202C',
                        zIndex: 50,
                      }}
                    >
                      {(item.badge || cartCount) > 9 ? '9+' : (item.badge || cartCount)}
                    </span>
                  )}
                </div>
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
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

