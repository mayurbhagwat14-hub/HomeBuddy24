import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FiX, FiLayers, FiArrowLeft, FiPlus, FiCheck } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { themeColors } from '../../../../../theme';
import { publicCatalogService } from '../../../../../services/catalogService';
import { useCart } from '../../../../../context/CartContext';
import { toast } from 'react-hot-toast';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const CategoryModal = React.memo(({ isOpen, onClose, category, location, cartCount, currentCity }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [view, setView] = useState('brands'); // 'brands' | 'services'
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [services, setServices] = useState([]); // Sub-services
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cityId = currentCity?._id || currentCity?.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
      // Reset state on close
      setTimeout(() => {
        setView('brands');
        setSelectedBrand(null);
        setBrands([]);
        setServices([]);
        setIsRedirecting(false);
      }, 300);
    } else if (category?.id) {
      if (category.initialBrand) {
        // Direct to brand services if initialBrand is provided (from search)
        const brand = category.initialBrand;
        setSelectedBrand(brand);
        setView('services');
        fetchServices(brand.id || brand._id);
      }
      // Always fetch brands for this category to populate the background/back-navigation
      fetchBrands();
    }
  }, [isOpen, category?.id, cityId]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await publicCatalogService.getBrands({
        categoryId: category.id,
        cityId: cityId
      });
      if (response.success) {
        setBrands(response.brands || []);
      }
    } catch (error) {
      console.error("Failed to load brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (brandId) => {
    try {
      setLoading(true);
      const response = await publicCatalogService.getServices({
        brandId: brandId,
        cityId: cityId,
        categoryId: category?.id
      });
      if (response.success) {
        setServices(response.services || []);
      }
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
    setView('services');
    fetchServices(brand.id || brand._id);
  };

  const handleBackToBrands = () => {
    setView('brands');
    setSelectedBrand(null);
    setServices([]);
  };

  const handleServiceClick = async (service) => {
    // Add to cart logic
    try {
      const cartItemData = {
        serviceId: service.id || service._id,
        categoryId: category?.id,
        title: service.title,
        description: service.description || '',
        icon: toAssetUrl(service.icon || ''),
        category: category?.title,
        categoryTitle: category?.title || '', // Explicit field
        categoryIcon: toAssetUrl(category?.homeIconUrl || category?.iconUrl || ''), // Explicit field
        // Brand info — stored as sectionTitle/sectionIcon for booking flow
        sectionId: selectedBrand?.id || selectedBrand?._id || null, // VITAL: Added for plan benefits
        sectionTitle: selectedBrand?.title || '',
        sectionIcon: toAssetUrl(selectedBrand?.iconUrl || selectedBrand?.icon || ''),
        price: service.discountPrice || service.basePrice,
        originalPrice: service.discountPrice ? service.basePrice : null,
        unitPrice: service.discountPrice || service.basePrice,
        serviceCount: 1,
        rating: "4.8",
        reviews: "1k+",
        vendorId: service.vendorId || selectedBrand?.vendorId || null,
        card: {
          title: service.title,
          subtitle: service.description || '',
          price: service.discountPrice || service.basePrice,
          originalPrice: service.discountPrice ? service.basePrice : null,
          duration: service.duration || '',
          description: service.description || '',
          imageUrl: toAssetUrl(service.icon || ''),
          features: service.features || []
        }
      };

      const response = await addToCart(cartItemData);
      if (response.success) {
        setIsRedirecting(true);
        setTimeout(() => {
          navigate('/user/cart');
        }, 1200);
      } else {
        toast.error(response.message || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (!isOpen && !isClosing) return null;
  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
<<<<<<< HEAD
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-slate-900/40 z-[9998]"
            onClick={onClose}
            style={{
              position: 'fixed',
              willChange: 'opacity, backdrop-filter',
=======
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
            style={{
              position: 'fixed',
              willChange: 'opacity',
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          />

          {/* Modal Container */}
          <motion.div
<<<<<<< HEAD
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] px-2 sm:px-0"
=======
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999]"
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
            style={{
              position: 'fixed',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Close Button */}
<<<<<<< HEAD
            <div className="absolute -top-14 right-4 sm:right-6 z-[60]">
              <button
                onClick={onClose}
                className="w-12 h-12 bg-white/90 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-white hover:scale-105 active:scale-95 transition-all"
              >
                <FiX className="w-6 h-6 text-slate-800" />
              </button>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-t-[32px] sm:rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/50 max-h-[90vh] overflow-y-auto min-h-[50vh] pb-safe-bottom">
              {/* Drag Handle indicator */}
              <div className="w-full flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>

=======
            <div className="absolute -top-12 right-4 z-[60]">
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-800" />
              </button>
            </div>

            <div className="bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto min-h-[50vh]">
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
              {isRedirecting ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] py-12">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
<<<<<<< HEAD
                    className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-200/50"
                  >
                    <FiCheck className="w-12 h-12 text-green-500 drop-shadow-sm" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Service Added!</h3>
                  <p className="text-slate-500 text-sm font-medium">Proceeding to checkout...</p>
                </div>
              ) : (
                <div className="px-5 pb-8 pt-2">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-8">
                    {view === 'services' && (
                      <button
                        onClick={handleBackToBrands}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors -ml-2"
                      >
                        <FiArrowLeft className="w-6 h-6 text-slate-800" />
                      </button>
                    )}
                    <div>
                      <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        {view === 'brands' ? (category?.title || 'Brands') : (selectedBrand?.title || 'Services')}
                      </h1>
                      {view === 'services' && <p className="text-sm text-slate-500 font-medium mt-0.5">Select a service to add</p>}
                    </div>
                    {loading && <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin ml-auto"></div>}
=======
                    className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6"
                  >
                    <FiCheck className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Service Added!</h3>
                  <p className="text-gray-500 text-sm">Proceeding to checkout...</p>
                </div>
              ) : (
                <div className="px-4 py-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    {view === 'services' && (
                      <button
                        onClick={handleBackToBrands}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <FiArrowLeft className="w-6 h-6 text-gray-800" />
                      </button>
                    )}
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">
                        {view === 'brands' ? (category?.title || 'Brands') : (selectedBrand?.title || 'Services')}
                      </h1>
                      {view === 'services' && <p className="text-xs text-gray-500">Select a service to add</p>}
                    </div>
                    {loading && <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin ml-auto"></div>}
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                  </div>

                  {/* Content */}
                  {loading && (view === 'brands' ? brands.length === 0 : services.length === 0) ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 animate-pulse">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
<<<<<<< HEAD
                         <div key={i} className="flex flex-col items-center gap-3">
                           <div className="w-20 h-20 bg-slate-100 rounded-[24px]"></div>
                           <div className="h-3 w-16 bg-slate-100 rounded-full"></div>
                         </div>
=======
                        <div key={i} className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-gray-200 rounded-2xl mb-2"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        </div>
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                      ))}
                    </div>
                  ) : (
                    <>
                      {view === 'brands' ? (
                        // Brands Grid
                        brands.length > 0 ? (
<<<<<<< HEAD
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-6">
                            {brands.map((brand, idx) => (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
=======
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {brands.map((brand) => (
                              <div
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                                key={brand.id || brand._id}
                                onClick={() => handleBrandClick(brand)}
                                className="flex flex-col items-center cursor-pointer group active:scale-95 transition-all"
                              >
<<<<<<< HEAD
                                <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-3 group-hover:bg-white transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:shadow-[0_8px_20px_rgba(52,121,137,0.12)] border border-slate-100 group-hover:border-brand/20 relative">
=======
                                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-gray-100 transition-colors shadow-sm overflow-hidden border border-gray-100 relative">
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                                  {brand.icon ? (
                                    <img
                                      src={toAssetUrl(brand.icon)}
                                      alt={brand.title}
<<<<<<< HEAD
                                      className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <FiLayers className="w-8 h-8 text-slate-300" />
                                  )}
                                  {brand.badge && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">
=======
                                      className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <FiLayers className="w-8 h-8 text-gray-300" />
                                  )}
                                  {brand.badge && (
                                    <span className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg">
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                                      {brand.badge}
                                    </span>
                                  )}
                                </div>
<<<<<<< HEAD
                                <p className="text-[12px] font-bold text-slate-700 text-center leading-tight line-clamp-2 px-1 group-hover:text-brand transition-colors">
                                  {brand.title}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-400">
=======
                                <p className="text-[11px] font-bold text-gray-800 text-center leading-tight line-clamp-2 px-1">
                                  {brand.title}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                            <p>No brands found in this category.</p>
                          </div>
                        )
                      ) : (
                        // Services List
                        services.length > 0 ? (
                          <div className="space-y-4">
<<<<<<< HEAD
                            {services.map((svc, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={svc.id || svc._id} 
                                className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-[24px] hover:shadow-[0_8px_24px_rgba(52,121,137,0.08)] hover:border-brand/20 transition-all group"
                              >
                                <div className="flex-1 pr-4">
                                  <h3 className="font-bold text-slate-800 text-[16px] leading-snug mb-1 tracking-tight">{svc.title}</h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[17px] font-black text-slate-800 tracking-tight">₹{svc.discountPrice || svc.basePrice}</span>
                                    {svc.discountPrice && svc.discountPrice < svc.basePrice && (
                                      <span className="text-[13px] text-slate-400 line-through font-bold">₹{svc.basePrice}</span>
=======
                            {services.map((svc) => (
                              <div key={svc.id || svc._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                                <div className="flex-1 pr-4">
                                  <h3 className="font-black text-gray-900 text-[15px] leading-snug mb-0.5">{svc.title}</h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-black text-emerald-600">₹{svc.discountPrice || svc.basePrice}</span>
                                    {svc.discountPrice && svc.discountPrice < svc.basePrice && (
                                      <span className="text-xs text-gray-400 line-through font-bold opacity-60">₹{svc.basePrice}</span>
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleServiceClick(svc)}
<<<<<<< HEAD
                                  className="px-5 py-2.5 bg-brand/10 text-brand rounded-full text-sm font-bold flex items-center gap-1.5 hover:bg-brand hover:text-white transition-colors active:scale-95 border border-transparent hover:border-brand/20"
                                >
                                  <FiPlus className="w-4 h-4" /> Add
                                </button>
                              </motion.div>
                            ))}
                            
                            {/* Bottom Disclaimer */}
                            <div className="mt-8 pt-4 flex items-start gap-3 bg-red-50/50 p-4 rounded-2xl border border-red-100/50">
                              <div className="mt-0.5 text-red-400">
=======
                                  className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-green-100"
                                >
                                  <FiPlus /> Add
                                </button>
                              </div>
                            ))}
                            
                            {/* Bottom Disclaimer */}
                            <div className="mt-8 pt-4 border-t border-gray-50 flex items-start gap-3 bg-gray-50/50 p-4 rounded-2xl">
                              <div className="mt-0.5 text-gray-400">
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
<<<<<<< HEAD
                              <p className="text-[11px] text-red-500 font-medium italic leading-snug">
                                * This is a base price only, additional charges may be applicable after service assessment.
=======
                              <p className="text-[11px] text-rose-500 font-normal italic leading-snug">
                                * It is a base price only, additional charges may be applicable after service
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                              </p>
                            </div>
                          </div>
                        ) : (
<<<<<<< HEAD
                          <div className="text-center py-12 text-slate-400">
=======
                          <div className="text-center py-12 text-gray-500">
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
                            <p>No services available for this brand yet.</p>
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
});

CategoryModal.displayName = 'CategoryModal';
export default CategoryModal;
