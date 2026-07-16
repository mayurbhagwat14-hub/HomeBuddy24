import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiUser, FiShoppingCart, FiShoppingBag } from 'react-icons/fi';
import { HiHome, HiShoppingBag, HiShoppingCart, HiUser, HiCalendar } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useCart } from '../../../../context/CartContext';
import { useStoreCart } from '../../../../context/StoreCartContext';
import { themeColors } from '../../../../theme';

const BottomNav = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { getItemCount: getStoreItemCount } = useStoreCart();

  const navItems = useMemo(() => [
    { id: 'home', icon: FiHome, filledIcon: HiHome, path: '/user/home', label: 'Home' },
    { id: 'bookings', icon: FiCalendar, filledIcon: HiCalendar, path: '/user/my-bookings', label: 'Bookings' },
    { id: 'store', icon: FiShoppingBag, filledIcon: HiShoppingBag, path: '/user/store', label: 'Store' },
    { id: 'cart', icon: FiShoppingCart, filledIcon: HiShoppingCart, path: '/user/cart', isCart: true, label: 'Cart' },
    { id: 'account', icon: FiUser, filledIcon: HiUser, path: '/user/account', label: 'Account' },
  ], []);

  const getActiveTab = () => {
    if (location.pathname === '/user/home' || location.pathname === '/user/home/') return 'home';
    if (location.pathname === '/user/my-bookings') return 'bookings';
    if (location.pathname === '/user/store') return 'store';
    if (location.pathname === '/user/cart') return 'cart';
    if (location.pathname === '/user/account') return 'account';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[380px] lg:hidden">
      <div className="glass-panel rounded-full px-2 py-2 flex items-center justify-between relative overflow-hidden bg-white/80 border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.08)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = isActive ? item.filledIcon : item.icon;
          const count = item.id === 'cart' ? cartCount : (item.id === 'store' ? getStoreItemCount() : 0);

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
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bg-orange-500 text-white font-bold rounded-full flex items-center justify-center shadow-md"
                      style={{
                        top: '-6px',
                        right: isActive ? '-2px' : '-8px',
                        minWidth: '16px',
                        height: '16px',
                        padding: '0 4px',
                        fontSize: '9px',
                        border: '1.5px solid #ffffff',
                        zIndex: 50,
                      }}
                    >
                      {count > 9 ? '9+' : count}
                    </motion.span>
                  )}
                </motion.div>
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

