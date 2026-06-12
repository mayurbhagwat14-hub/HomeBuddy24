import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiLoader, FiBell } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import BottomNav from '../../components/layout/BottomNav';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useCart } from '../../../../context/CartContext';
import electricianIcon from '../../../../assets/images/icons/services/electrician.png';
import womensSalonIcon from '../../../../assets/images/icons/services/womens-salon-spa-icon.png';
import massageMenIcon from '../../../../assets/images/icons/services/massage-men-icon.png';
import cleaningIcon from '../../../../assets/images/icons/services/cleaning-icon.png';
import acApplianceRepairIcon from '../../../../assets/images/icons/services/ac-appliance-repair-icon.png';
import NotificationBell from '../../components/common/NotificationBell';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, isLoading: loading, removeItem, removeCategoryItems, updateItem } = useCart();

  // Category icon mapping
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Electrician': electricianIcon,
      'Electricity': electricianIcon,
      "Women's Salon & Spa": womensSalonIcon,
      'Salon for Women': womensSalonIcon,
      'Salon Prime': womensSalonIcon,
      'Massage for Men': massageMenIcon,
      'Cleaning': cleaningIcon,
      'Bathroom & Kitchen Cleaning': cleaningIcon,
      'Sofa & Carpet Cleaning': cleaningIcon,
      'AC Service and Repair': acApplianceRepairIcon,
      'AC & Appliance Repair': acApplianceRepairIcon,
    };
    return iconMap[category] || electricianIcon; // Default icon
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = {};
    cartItems.forEach(item => {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  }, [cartItems]);

  const cartCount = cartItems.length;

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteCategory = async (category) => {
    try {
      const response = await removeCategoryItems(category);
      if (response.success) {
        toast.success('Category items removed');
      } else {
        toast.error(response.message || 'Failed to remove category items');
      }
    } catch (error) {
      toast.error('Failed to remove category items');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await removeItem(itemId);
      if (response.success) {
        toast.success('Item removed from cart');
      } else {
        toast.error(response.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    try {
      const item = cartItems.find(i => (i._id || i.id) === itemId);
      if (!item) return;

      const newCount = Math.max(1, (item.serviceCount || 1) + change);
      const response = await updateItem(itemId, newCount);

      if (!response.success) {
        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleAddServices = (category) => {
    // Navigate back to home with instructions to open the category modal
    const itemsInCategory = groupedItems[category];
    const categoryId = itemsInCategory?.[0]?.categoryId;

    navigate('/user', {
      state: {
        openCategoryId: categoryId,
        openCategoryName: category
      }
    });
  };

  const handleCategoryCheckout = (category) => {
    navigate('/user/checkout', { state: { category: category } });
  };

  const handleCartClick = () => {
    // Already on cart page
  };

  // Calculate totals for all items
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalOriginalPrice = cartItems.reduce((sum, item) => {
    const unitOriginalPrice = item.originalPrice || (item.unitPrice || (item.price / (item.serviceCount || 1)));
    return sum + (unitOriginalPrice * (item.serviceCount || 1));
  }, 0);
  return (
    <div className="min-h-[100dvh] pb-32 relative bg-[#F8FAFC] overflow-x-hidden">
      {/* Premium Modern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Modern Glassmorphism Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white shadow-sm px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-gray-100 active:scale-95 transition-all"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#008080]/10 flex items-center justify-center">
                <FiShoppingCart className="w-4 h-4 text-[#008080]" />
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Your Cart</h1>
              {cartCount > 0 && (
                <span className="bg-[#008080] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
          <NotificationBell />
        </header>

        {/* Cart Items - Grouped by Category */}
        <main className="px-4 py-6" style={{ paddingBottom: cartItems.length > 0 ? '70px' : '100px' }}>
          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
                  {/* Category Header Skeleton */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  {/* Items Skeleton */}
                  <div className="space-y-3">
                    <div className="h-10 w-full bg-gray-100 rounded"></div>
                    <div className="h-10 w-full bg-gray-100 rounded"></div>
                  </div>
                  {/* Buttons Skeleton */}
                  <div className="flex gap-2 mt-4">
                    <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 h-10 bg-gray-300 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-md rounded-[32px] border border-white border-dashed shadow-[0_8px_30px_rgba(0,0,0,0.04)] mt-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
                <FiShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-xl font-black text-gray-900 mb-2 tracking-tight">Your cart is empty</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto text-center leading-relaxed">
                Add services to get started
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => {
                const categoryTotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
                const categoryIcon = getCategoryIcon(category);
                const serviceCount = items.reduce((sum, item) => sum + (item.serviceCount || 1), 0);

                return (
                  <div
                    key={category}
                    className="bg-white/70 backdrop-blur-xl rounded-[32px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white relative overflow-hidden"
                  >
                    {/* Glowing Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#008080]/5 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none"></div>

                    {/* Category Header */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Category Icon */}
                        <div
                          className="w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0 overflow-hidden bg-white shadow-inner border border-gray-100"
                        >
                          <img
                            src={categoryIcon}
                            alt={category}
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div
                            className="hidden items-center justify-center"
                            style={{
                              width: '48px',
                              height: '48px',
                              display: 'none'
                            }}
                          >
                            <FiShoppingCart className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>

                        {/* Category Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[18px] font-black text-gray-900 mb-1 tracking-tight truncate">{category}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#008080] bg-[#008080]/10 px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#008080]/20">
                              {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[14px] font-black text-gray-900">₹{categoryTotal.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Category Button */}
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors shrink-0 border border-rose-100 active:scale-95"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Services List */}
                    <div className="mb-6 space-y-3 relative z-10">
                      {items.map((item) => (
                        <div key={item._id || item.id} className="flex items-start justify-between p-4 bg-white/40 rounded-[20px] border border-white/60">
                          <div className="flex-1 pr-4">
                            <p className="text-[14px] text-gray-900 font-bold leading-snug">
                              {item.title} <span className="text-gray-400 font-medium ml-1">x{item.serviceCount || 1}</span>
                            </p>
                            {item.description && (
                              <p className="text-[11px] text-gray-500 mt-1 font-medium leading-relaxed line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="text-[15px] font-black text-[#008080]">
                              ₹{(item.price || 0).toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => handleDelete(item._id || item.id)}
                              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-rose-500 transition-colors flex items-center gap-1"
                            >
                              <FiTrash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 relative z-10">
                      <button
                        onClick={() => handleAddServices(category)}
                        className="flex-1 px-4 py-4 bg-white/50 backdrop-blur-md border border-white rounded-[16px] text-[11px] font-black text-gray-600 uppercase tracking-widest hover:bg-white hover:text-gray-900 transition-all active:scale-95 shadow-sm"
                      >
                        Add Services
                      </button>
                      <button
                        onClick={() => handleCategoryCheckout(category)}
                        className="flex-1 px-4 py-4 rounded-[16px] text-[11px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,128,128,0.3)] hover:shadow-[0_6px_20px_rgba(0,128,128,0.4)]"
                        style={{
                          background: 'linear-gradient(135deg, #008080 0%, #006666 100%)',
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Cart;
