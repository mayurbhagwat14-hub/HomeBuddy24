import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FiArrowLeft, FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiPhone, FiHome, FiClock, FiEdit2, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { MdStar } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import AddressSelectionModal from './components/AddressSelectionModal';
import TimeSlotModal from './components/TimeSlotModal';
import VendorSearchModal from './components/VendorSearchModal';
import { bookingService } from '../../../../services/bookingService';
import { paymentService } from '../../../../services/paymentService';
import { cartService } from '../../../../services/cartService';
import { configService } from '../../../../services/configService';
import { getPlans } from '../../services/planService';
import { userAuthService } from '../../../../services/authService';
import { useCart } from '../../../../context/CartContext';
import { useBranding } from '../../../../context/BrandingContext';
import LiveBookingCard from '../../components/booking/LiveBookingCard';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || null;
  const plan = location.state?.plan || null;
  const { fetchCart: fetchCartGlobal, clearCart: clearCartGlobal, removeCategoryItems: removeCategoryGlobal } = useCart();
  const { branding } = useBranding();
  const appName = branding?.appName || 'HomeBuddy24';

  const [cartItems, setCartItems] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [address, setAddress] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [userPhone, setUserPhone] = useState('');

  // Custom Contact State (for this booking only)
  const [contactDetails, setContactDetails] = useState({ name: '', phone: '' });
  const [showContactModal, setShowContactModal] = useState(false);

  // New state for vendor search flow
  const [currentStep, setCurrentStep] = useState('details'); // 'details' | 'searching' | 'waiting' | 'accepted' | 'payment'
  const [acceptedVendor, setAcceptedVendor] = useState(null);
  const [bookingRequest, setBookingRequest] = useState(null);
  const [searchingVendors, setSearchingVendors] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'pay_at_home'

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const [selectedTime, setSelectedTime] = useState(null);
  const [visitedFee, setVisitedFee] = useState(29);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [bookingType, setBookingType] = useState('instant'); // 'instant' | 'scheduled'

  // Check if Razorpay is loaded (defer to avoid blocking initial render)
  useEffect(() => {
    // Defer Razorpay check until after page load
    const checkRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
      } else {
        // Retry after a short delay (non-blocking)
        setTimeout(checkRazorpay, 100);
      }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (window.requestIdleCallback) {
      window.requestIdleCallback(checkRazorpay, { timeout: 200 });
    } else {
      setTimeout(checkRazorpay, 100);
    }
  }, []);

  // Load user data and cart
  useEffect(() => {
    const loadUserData = () => {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData.phone) {
          setUserPhone(userData.phone);
        }
        // Initialize contact details for editing
        setContactDetails({
          name: userData.name || '',
          phone: userData.phone || ''
        });
      }
    };
    loadUserData();

    // Refresh on focus to catch updates from profile page
    window.addEventListener('focus', loadUserData);
    return () => window.removeEventListener('focus', loadUserData);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (plan) {
          setCartItems([{
            id: plan.id,
            name: plan.name,
            price: plan.price,
            description: plan.description,
            isPlan: true,
            serviceCount: 1
          }]);

          // Still need config and address for plan checkout
          const response = await userAuthService.getCheckoutData();
          if (response.success) {
            setVisitedFee(0); // Plans usually have 0 visitor fee
            setGstPercentage(response.settings?.serviceGstPercentage || 18);

            if (response.user?.addresses?.length > 0) {
              const defaultAddr = response.user.addresses.find(a => a.isDefault) || response.user.addresses[0];
              setAddress(defaultAddr.addressLine1);
              setHouseNumber(defaultAddr.addressLine2 || '');
              setAddressDetails({
                address: defaultAddr.addressLine1,
                lat: defaultAddr.lat,
                lng: defaultAddr.lng,
                type: defaultAddr.type,
                city: defaultAddr.city,
                state: defaultAddr.state,
                pincode: defaultAddr.pincode
              });
            }
          }
        } else {
          const response = await userAuthService.getCheckoutData();
          if (response.success) {
            // Set Config
            setVisitedFee(response.settings?.visitedCharges || 29);
            setGstPercentage(response.settings?.serviceGstPercentage || 18);

            // Set Addresses
            if (response.user?.addresses?.length > 0) {
              const defaultAddr = response.user.addresses.find(a => a.isDefault) || response.user.addresses[0];
              setAddress(defaultAddr.addressLine1);
              setHouseNumber(defaultAddr.addressLine2 || '');
              setAddressDetails({
                address: defaultAddr.addressLine1,
                lat: defaultAddr.lat,
                lng: defaultAddr.lng,
                type: defaultAddr.type,
                city: defaultAddr.city,
                state: defaultAddr.state,
                pincode: defaultAddr.pincode
              });
            }

            // Set Cart Items
            let items = response.cartItems || [];
            if (category) {
              const normalizedCategory = category.toLowerCase().trim();
              items = items.filter(item => {
                const itemCat = (item.category || 'Other').toLowerCase().trim();
                return itemCat === normalizedCategory;
              });
            }
            setCartItems(items);
          }
        }
      } catch (error) {
        console.error('Failed to load checkout data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, plan]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      if (response.success) {
        let items = response.data || [];
        if (category) {
          const normalizedCategory = category.toLowerCase().trim();
          items = items.filter(item => {
            const itemCat = (item.category || 'Other').toLowerCase().trim();
            return itemCat === normalizedCategory;
          });
        }
        setCartItems(items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const cartCount = cartItems.length;

  const handleBack = () => {
    navigate(-1);
  };

  const handleQuantityChange = async (itemId, change) => {
    try {
      const item = cartItems.find(i => (i._id || i.id) === itemId);
      if (!item) return;

      const newCount = Math.max(1, (item.serviceCount || 1) + change);
      const response = await cartService.updateItem(itemId, newCount);

      if (response.success) {
        // Refresh global cart badge
        fetchCartGlobal();

        // Reload cart and filter by category
        const cartResponse = await cartService.getCart();
        if (cartResponse.success) {
          let items = cartResponse.data || [];
          if (category) {
            const normalizedCategory = category.toLowerCase().trim();
            items = items.filter(item => {
              const itemCat = (item.category || 'Other').toLowerCase().trim();
              return itemCat === normalizedCategory;
            });
          }
          setCartItems(items);
        }
      } else {
        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await cartService.removeItem(itemId);
      if (response.success) {
        toast.success('Item removed');
        // Refresh global cart badge
        fetchCartGlobal();
        loadCart();
      } else {
        toast.error(response.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };



  const getAddressComponent = (type) => {
    return addressDetails?.components?.find(c => c.types.includes(type))?.long_name || '';
  };

  const handleProceed = async () => {
    // Validation
    if (bookingType === 'instant') {
      if (!addressDetails) {
        setShowAddressModal(true);
        return;
      }
    } else {
      if (!addressDetails || !selectedDate || !selectedTime) {
        if (!addressDetails) setShowAddressModal(true);
        else if (!selectedDate || !selectedTime) setShowTimeSlotModal(true);
        return;
      }
    }

    try {
      setShowVendorModal(true);
      setCurrentStep('searching');

      const firstItem = cartItems[0];
      if (!firstItem) {
        toast.error('Your cart is empty');
        return;
      }
      const serviceId = typeof firstItem.serviceId === 'object'
        ? firstItem.serviceId._id || firstItem.serviceId.id
        : firstItem.serviceId;

      const bookedItemsData = cartItems.map(item => ({
        brandName: item.sectionTitle || item.brand || '',
        brandIcon: item.sectionIcon || null,
        card: {
          title: item.card?.title || item.title,
          subtitle: item.card?.subtitle || item.description || '',
          price: item.card?.price || item.price || 0,
          originalPrice: item.card?.originalPrice || item.originalPrice || null,
          duration: item.card?.duration || item.duration || '',
          description: item.card?.description || item.description || '',
          imageUrl: item.card?.imageUrl || item.icon || '',
          features: item.card?.features || []
        },
        quantity: item.serviceCount || 1
      }));

      // Calculate Scheduled Data for Instant
      let finalDate = selectedDate;
      let finalTime = selectedTime;
      let finalTimeSlot = {
        start: selectedTime,
        end: getTimeSlots().find(slot => slot.value === selectedTime)?.end || selectedTime
      };

      if (bookingType === 'instant') {
        const now = new Date();
        finalDate = now;
        finalTime = "ASAP";
        finalTimeSlot = { start: "Now", end: "45 mins" };
      }

      const response = await bookingService.create({
        bookingType, // 'instant' or 'scheduled'
        serviceId,
        address: {
          type: addressDetails?.type || 'home',
          addressLine1: addressDetails?.addressLine1 || address,
          addressLine2: houseNumber,
          city: addressDetails?.city || getAddressComponent('locality') || getAddressComponent('administrative_area_level_2') || 'City',
          state: addressDetails?.state || getAddressComponent('administrative_area_level_1') || 'State',
          pincode: addressDetails?.pincode || getAddressComponent('postal_code') || '000000',
          lat: addressDetails?.lat,
          lng: addressDetails?.lng
        },
        scheduledDate: finalDate, // Date object
        scheduledTime: bookingType === 'instant' ? "ASAP" : (getTimeSlots().find(slot => slot.value === finalTime)?.display || finalTime),
        timeSlot: finalTimeSlot,
        amount: amountToPay,

        // Pass Full Breakdown to Backend
        basePrice: totalOriginalPrice,
        discount: savings,
        tax: taxesAndFee,
        visitationFee: finalVisitedFee,

        // Metadata for better data capture
        serviceCategory: firstItem.categoryTitle || firstItem.category || 'General',
        categoryIcon: firstItem.categoryIcon || firstItem.icon || null,
        brandName: firstItem.sectionTitle || firstItem.brand || '',
        brandIcon: firstItem.sectionIcon || null,

        contactDetails: {
          name: contactDetails.name,
          phone: contactDetails.phone.length === 10 && !contactDetails.phone.includes('+') ? `+91${contactDetails.phone}` : contactDetails.phone
        },

        paymentMethod: 'online',
        bookedItems: bookedItemsData
      });

      if (response.success) {
        setBookingRequest(response.data);

        // If the backend returns an assigned vendor immediately (rare but possible)
        if (response.data.vendorId && (response.data.status === 'ACCEPTED' || response.data.status === 'ASSIGNED')) {
          setCurrentStep('accepted');
          setAcceptedVendor({
            ...(response.data.vendorId || {}),
            price: response.data.finalAmount || amountToPay,
            distance: 'within 5km', // default
            estimatedTime: '15-30 min'
          });
          setSearchingVendors(false); // Finished search
        } else {
          // Normal flow: Entered pooling/searching
          setCurrentStep('waiting'); // Waiting for vendor acceptance
          // Keep searchingVendors = true to disable buttons and show progress
        }
      }
    } catch (error) {
      toast.error('Failed to initiate booking request. Please try again.');
      setShowVendorModal(false);
      setSearchingVendors(false);
    }
  };


  // Listen for real-time vendor acceptance
  useEffect(() => {
    if (currentStep !== 'waiting' || !bookingRequest) return;

    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token: localStorage.getItem('accessToken') },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
    });

    socket.on('connect_error', (err) => {
    });

    socket.on('booking_accepted', (data) => {
      if (data.bookingId === bookingRequest._id) {

        // Construct vendor object from event data
        // Note: Real backend should send full details, falling back to defaults for display
        const vendorData = {
          id: data.vendor.id,
          name: data.vendor.name || 'Vendor',
          businessName: data.vendor.businessName || 'Service Provider',
          rating: 4.8, // Default if not sent
          distance: 'Nearby', // Default if not sent
          estimatedTime: '15-20 mins',
          price: bookingRequest.amount
        };

        setAcceptedVendor(vendorData);
        setCurrentStep('accepted');
        setSearchingVendors(false);
        toast.success(`${vendorData.businessName} accepted your booking!`);

        // Close modal after 2 seconds and navigate to confirmation
        setTimeout(() => {
          setShowVendorModal(false);
          navigate(`/user/booking-confirmation/${bookingRequest._id}`, {
            replace: true
          });
        }, 2000);
      }
    });

    socket.on('booking_search_failed', (data) => {
      if (data.bookingId === bookingRequest._id) {
        setSearchingVendors(false);
        setCurrentStep('failed');
        toast.error(data.message || 'No vendors available at the moment.');

        // Auto-cancel and refresh on failure
        const handleAutoCancel = async () => {
          try {
            await bookingService.cancel(bookingRequest._id, 'No vendors found after search timeout');
            setTimeout(() => {
              window.location.reload();
            }, 3000); // 3 second delay to let the user see the error
          } catch (err) {
            console.error('Auto-cancel failed:', err);
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        };
        handleAutoCancel();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentStep, bookingRequest]);

  // Search for nearby vendors
  const handleSearchVendors = async () => {
    try {
      // Validate required fields
      if (bookingType === 'scheduled') {
        if (!selectedDate || !selectedTime) {
          toast.error('Please select time slot');
          return;
        }
        if (!addressDetails) {
          toast.error('Please select address');
          return;
        }
      } else {
        // Instant
        if (!addressDetails) {
          toast.error('Please select address');
          return;
        }
      }

      if (cartItems.length === 0 && !bookingRequest) {
        toast.error('Cart is empty');
        return;
      }

      // Open modal and start searching
      setShowVendorModal(true);
      setCurrentStep('searching');
      setSearchingVendors(true);

      // Get first service
      const firstItem = cartItems[0];
      if (!firstItem.serviceId) {
        toast.error('Service information missing. Please try again.');
        setCurrentStep('details');
        setSearchingVendors(false);
        setShowVendorModal(false);
        return;
      }

      // Prepare address object
      const addressObj = {
        type: 'home',
        addressLine1: address,
        addressLine2: houseNumber,
        city: addressDetails?.city || getAddressComponent('locality') || getAddressComponent('administrative_area_level_2') || 'City',
        state: addressDetails?.state || getAddressComponent('administrative_area_level_1') || 'State',
        pincode: addressDetails?.pincode || getAddressComponent('postal_code') || '123456',

        landmark: addressDetails?.landmark || '',
        lat: addressDetails?.lat || null,
        lng: addressDetails?.lng || null
      };

      // Prepare time slot
      let finalDate = selectedDate;
      let finalTimeDisplay = selectedTime;
      let timeSlotObj = {
        start: selectedTime,
        end: getTimeSlots().find(slot => slot.value === selectedTime)?.end || selectedTime
      };

      if (bookingType === 'instant') {
        finalDate = new Date();
        finalTimeDisplay = "ASAP";
        timeSlotObj = { start: "Now", end: "45 mins" };
      } else {
        finalTimeDisplay = getTimeSlots().find(slot => slot.value === selectedTime)?.display || selectedTime;
      }

      // Create booking request
      toast.loading('Searching for nearby vendors...');

      // Ensure serviceId is a string (handle populated cart data)
      const serviceId = typeof firstItem.serviceId === 'object'
        ? firstItem.serviceId._id || firstItem.serviceId.id
        : firstItem.serviceId;

      // Prepare bookedItems array matching Service catalog structure
      // Prepare bookedItems array matching Service catalog structure
      const bookedItemsData = cartItems.map(item => ({
        brandName: item.sectionTitle || item.brand || '',
        brandIcon: item.sectionIcon || null,
        card: {
          title: item.card?.title || item.title || 'Unknown Service',
          subtitle: item.card?.subtitle || item.description || '',
          price: item.card?.price || item.price || 0,
          originalPrice: item.card?.originalPrice || item.originalPrice || null,
          duration: item.card?.duration || item.duration || '',
          description: item.card?.description || item.description || '',
          imageUrl: item.card?.imageUrl || item.icon || '',
          features: item.card?.features || []
        },
        quantity: item.serviceCount || 1
      }));



      const bookingResponse = await bookingService.create({
        bookingType, // 'instant' or 'scheduled'
        serviceId: serviceId,
        address: addressObj,
        scheduledDate: finalDate.toISOString(),
        scheduledTime: finalTimeDisplay,
        timeSlot: timeSlotObj,
        // userNotes: null, // Removed per request
        paymentMethod: amountToPay === 0 ? 'plan_benefit' : 'pay_at_home',
        amount: amountToPay,

        // Pass Full Breakdown to Backend
        basePrice: totalOriginalPrice,
        discount: savings,
        tax: taxesAndFee,
        visitationFee: finalVisitedFee,

        // Metadata for better data capture
        serviceCategory: firstItem.categoryTitle || firstItem.category || 'General',
        categoryIcon: firstItem.categoryIcon || firstItem.icon || null,
        brandName: firstItem.sectionTitle || firstItem.brand || '',
        brandIcon: firstItem.sectionIcon || null,

        bookedItems: bookedItemsData
      });

      if (!bookingResponse.success) {
        toast.dismiss();
        toast.error(bookingResponse.message || 'Failed to search for vendors');
        setCurrentStep('details');
        setSearchingVendors(false);
        setShowVendorModal(false);
        return;
      }

      const booking = bookingResponse.data;
      setBookingRequest(booking);
      toast.dismiss();

      // Clear cart immediately as search starts (consumes items) - ONLY if vendors found
      if (!bookingResponse.noVendorsFound) {
        try {
          if (category) {
            await removeCategoryGlobal(category);
          } else {
            await clearCartGlobal();
          }
          setCartItems([]);
        } catch (err) {
          console.error('Failed to clear cart after search start', err);
        }
      }

      // If no vendors found, redirect or refresh immediately
      if (bookingResponse.noVendorsFound) {
        toast.dismiss();
        const bookingId = booking?._id || booking?.id;

        // Ensure we stop searching and close the modal
        setSearchingVendors(false);
        setShowVendorModal(false);

        if (bookingId) {
          toast.error('No vendors currently available for this service.');

          // Auto-cancel and refresh
          const cancelAndRefresh = async () => {
            try {
              await bookingService.cancel(bookingId, 'Initial search found no available vendors');
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } catch (err) {
              console.error('Auto-cancel failed:', err);
              window.location.reload();
            }
          };
          cancelAndRefresh();
        } else {
          // Fallback if ID is missing for some reason
          setCurrentStep('details');
          toast.error('Search failed. Please try again.');
          setTimeout(() => window.location.reload(), 2000);
        }
      } else {
        // Move to waiting state - alerts sent to nearby vendors
        setCurrentStep('waiting');
        toast.success('Finding nearby vendors... Alerts sent to vendors within 10km!');
      }

      // REMOVED local setCartItems([]) - The summary should remain visible while searching
      // The cart is already cleared in server database by the backend and previous API call.

    } catch (error) {
      toast.dismiss();
      console.error('Search vendors error:', error);
      toast.error('Failed to search for vendors. Please try again.');
      setCurrentStep('details');
      setSearchingVendors(false);
      setShowVendorModal(false);
    }
  };

  // Proceed to payment after vendor acceptance
  const handleOnlinePayment = async () => {
    try {
      if (!acceptedVendor || !bookingRequest) {
        toast.error('No vendor selected or booking not created');
        return;
      }

      // Create Razorpay order
      toast.loading('Creating payment order...');
      const orderResponse = await paymentService.createOrder(bookingRequest._id);

      if (!orderResponse.success) {
        toast.dismiss();
        toast.error(orderResponse.message || 'Failed to create payment order');
        return;
      }

      toast.dismiss();

      // Get Razorpay key
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error('Razorpay key not configured');
        return;
      }

      if (!window.Razorpay) {
        toast.error('Razorpay SDK not loaded');
        return;
      }

      const options = {
        key: razorpayKey,
        amount: orderResponse.data.amount * 100,
        currency: orderResponse.data.currency || 'INR',
        order_id: orderResponse.data.orderId,
        name: appName,
        description: `Payment for ${bookingRequest.serviceName || 'service'}`,
        handler: async function (response) {
          try {
            toast.loading('Verifying payment...');
            const verifyResponse = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.dismiss();

            if (verifyResponse.success) {
              toast.success('Payment successful!');

              // Clear cart (or just category items)
              try {
                if (category) {
                  await removeCategoryGlobal(category);
                } else {
                  await clearCartGlobal();
                }
                setCartItems([]);
              } catch (error) {
              }

              // Navigate to booking confirmation
              navigate(`/user/booking-confirmation/${bookingRequest._id}`, {
                replace: true
              });
            } else {
              toast.error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error) {
            toast.dismiss();
            toast.error('Failed to verify payment');
          }
        },
        prefill: {
          name: contactDetails.name || JSON.parse(localStorage.getItem('userData'))?.name || 'User',
          email: JSON.parse(localStorage.getItem('userData'))?.email || '',
          contact: contactDetails.phone || userPhone
        },
        theme: {
          color: themeColors.button
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        toast.dismiss();
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });
      razorpay.open();

    } catch (error) {
      toast.dismiss();
      toast.error('Failed to process payment');
    }
  };

  const handlePayAtHome = async () => {
    try {
      if (!bookingRequest) return;
      toast.loading('Confirming booking...');
      const response = await paymentService.confirmPayAtHome(bookingRequest._id);
      toast.dismiss();

      if (response.success) {
        toast.success('Booking confirmed!');
        // Clear cart (or just category items)
        try {
          if (category) {
            await removeCategoryGlobal(category);
          } else {
            await clearCartGlobal();
          }
          setCartItems([]);
        } catch (error) {
        }
        // Navigate to booking confirmation
        navigate(`/user/booking-confirmation/${bookingRequest._id}`, {
          replace: true
        });
      } else {
        toast.error(response.message || 'Failed to confirm booking');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to process request');
    }
  };

  const handlePayment = async () => {
    if (totalAmount === 0) {
      // Free booking covered by plan
      toast.success('Booking confirmed!');
      // Clear cart
      try {
        await clearCartGlobal();
        setCartItems([]);
      } catch (error) { }

      // Navigate
      if (bookingRequest) {
        navigate(`/user/booking-confirmation/${bookingRequest._id}`, { replace: true });
      }
    } else if (paymentMethod === 'online') {
      await handleOnlinePayment();
    } else {
      await handlePayAtHome();
    }
  };

  const handleAddressSave = async (savedHouseNumber, locationObj) => {
    setHouseNumber(savedHouseNumber);
    if (locationObj) {
      setAddress(locationObj.address);
      setAddressDetails(locationObj);
    }
    setShowAddressModal(false);

    // Save to profile
    if (locationObj) {
      try {
        const getComp = (type) => locationObj.components?.find(c => c.types.includes(type))?.long_name || '';

        const newAddress = {
          type: 'home',
          addressLine1: locationObj.address,
          addressLine2: savedHouseNumber,
          city: getComp('locality') || getComp('administrative_area_level_2') || 'City',
          state: getComp('administrative_area_level_1') || 'State',
          pincode: getComp('postal_code') || '000000',
          lat: locationObj.lat,
          lng: locationObj.lng,
          isDefault: true
        };

        const response = await userAuthService.getProfile();
        if (response.success && response.user) {
          const updatedAddresses = [newAddress]; // Always replace with single address
          await userAuthService.updateProfile({ addresses: updatedAddresses });
          toast.success('Address updated in profile!');
        }
      } catch (e) {
        console.error('Failed to save address to profile', e);
      }
    }

    if (bookingType === 'scheduled') {
      setShowTimeSlotModal(true);
    }
  };

  const handleTimeSlotSave = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowTimeSlotModal(false);
  };

  const handleCartClick = () => {
    if (plan) return; // Disable cart click for plan
    navigate('/user/cart');
  };

  // Fetch plan upgrade details if applicable
  const [upgradePreview, setUpgradePreview] = useState(null);
  const isUpgrade = location.state?.isUpgrade;

  useEffect(() => {
    if (plan && isUpgrade) {
      const fetchUpgradeDetails = async () => {
        try {
          const res = await paymentService.getUpgradeDetails(plan.id);
          if (res.success) {
            setUpgradePreview(res.data);
          }
        } catch (error) {
          console.error(error);
          toast.error('Failed to calculate upgrade price');
        }
      };
      fetchUpgradeDetails();
    }
  }, [plan, isUpgrade]);

  const handlePlanPayment = async () => {
    try {
      if (!razorpayLoaded) {
        toast.error('Payment gateway not ready');
        return;
      }

      const response = await paymentService.createPlanOrder(plan.id);
      if (response.success) {
        const { orderId, amount, key } = response.data;

        const options = {
          key,
          amount: amount * 100,
          currency: 'INR',
          name: appName,
          description: `Payment for ${plan.name} ${isUpgrade ? '(Upgrade)' : ''}`,
          order_id: orderId,
          handler: async (response) => {
            try {
              await paymentService.verifyPlanPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id
              });
              toast.success('Subscription activated successfully!');
              navigate('/user/home');
            } catch (e) {
              toast.error('Verification failed');
            }
          },
          prefill: {
            contact: userPhone
          },
          theme: {
            color: themeColors.primary
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error(error);
      toast.error('Payment initiation failed');
    }
  };

  // Fetch plan and user profile to determine discounts
  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const [plansRes, userRes] = await Promise.all([
          getPlans(),
          userAuthService.getProfile(), // Ensure we have latest status
        ]);

        if (plansRes.success && userRes.success && userRes.user?.plans?.isActive) {
          const userPlanName = userRes.user.plans.name;
          const activePlan = plansRes.data.find(p => p.name === userPlanName);

          if (activePlan) {
            setPlanBenefits({
              name: activePlan.name,
              freeCategories: activePlan.freeCategories || [],
              freeBrands: activePlan.freeBrands || [],
              freeServices: activePlan.freeServices || []
            });

          }
        }
      } catch (e) {
        console.error('Failed to load plan benefits', e);
      }
    };

    // Only fetch if not a plan purchase (standard checkout)
    if (!plan) {
      fetchBenefits();
    }
  }, [plan]);

  const [planBenefits, setPlanBenefits] = useState({ name: '', freeCategories: [], freeBrands: [], freeServices: [] });

  // Helper to normalize MongoDB IDs (handles strings, objects with _id, and $oid)
  const normalizeId = (id) => {
    if (!id) return null;
    if (typeof id === 'string') return id;
    if (id.$oid) return id.$oid;
    if (id._id) return normalizeId(id._id);
    return String(id);
  };

  // Calculate totals with Plan Benefits
  const calculateItemPrice = (item) => {
    if (plan) return item.card?.price || item.price || 0; // Plan purchase

    const itemCatId = normalizeId(item.categoryId);
    const itemBrandId = normalizeId(item.brandId || item.sectionId);
    const itemServiceId = normalizeId(item.serviceId);

    // Check if free
    const isFreeCategory = itemCatId && planBenefits.freeCategories.some(cat => {
      return normalizeId(cat) === itemCatId;
    });

    const isFreeBrand = itemBrandId && planBenefits.freeBrands.some(brand => {
      return normalizeId(brand) === itemBrandId;
    });

    const isFreeService = itemServiceId && planBenefits.freeServices.some(svc => {
      return normalizeId(svc) === itemServiceId;
    });

    if (isFreeCategory || isFreeBrand || isFreeService) {
      return 0;
    }
    return item.card?.price || item.price || 0;
  };

  const itemTotal = cartItems.reduce((sum, item) => sum + calculateItemPrice(item) * (item.serviceCount || 1), 0);
  // Calculate savings including Plan Savings
  const totalOriginalPrice = cartItems.reduce((sum, item) => {
    const original = (item.card?.originalPrice || item.originalPrice || item.card?.price || item.price || 0) * (item.serviceCount || 1);
    // If priced 0, original is huge saving
    return sum + original;
  }, 0);

  const savings = totalOriginalPrice - itemTotal;
  const taxesAndFee = Math.round((itemTotal * gstPercentage) / 100);
  // Visited fee logic: if Total is 0 (All free), user might still pay visited fee?
  // User says "no payemtn". So maybe visited fee also waived? Or user pays visited fee?
  // "ask direct servicebooking" -> implies fully free.
  // I'll set visitedFee to 0 if itemTotal is 0?
  // Configurable?
  // Assuming "Free under plan" means NO Payment.
  const finalVisitedFee = itemTotal === 0 ? 0 : visitedFee;

  const totalAmount = itemTotal + taxesAndFee + finalVisitedFee;
  const amountToPay = totalAmount;

  // Helper for Free Plan Full Breakdown Display
  // If the booking is free, we still want to show what the Tax/Fee WOULD have been
  const displayTax = totalAmount === 0 ? Math.round((totalOriginalPrice * gstPercentage) / 100) : taxesAndFee;
  const displayFee = totalAmount === 0 ? visitedFee : finalVisitedFee;
  const displaySavings = totalAmount === 0 ? (totalOriginalPrice + displayTax + displayFee) : savings;

  // Date and time slot helper functions
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getTimeSlots = () => {
    const allSlots = [
      { value: '09:00', end: '10:00', display: '9:00 AM' },
      { value: '10:00', end: '11:00', display: '10:00 AM' },
      { value: '11:00', end: '12:00', display: '11:00 AM' },
      { value: '12:00', end: '13:00', display: '12:00 PM' },
      { value: '13:00', end: '14:00', display: '1:00 PM' },
      { value: '14:00', end: '15:00', display: '2:00 PM' },
      { value: '15:00', end: '16:00', display: '3:00 PM' },
      { value: '16:00', end: '17:00', display: '4:00 PM' },
      { value: '17:00', end: '18:00', display: '5:00 PM' },
      { value: '18:00', end: '19:00', display: '6:00 PM' },
      { value: '19:00', end: '20:00', display: '7:00 PM' },
      { value: '20:00', end: '21:00', display: '8:00 PM' },
    ];

    // If today is selected, filter out past time slots
    const now = new Date();
    const isToday = selectedDate && selectedDate.toDateString() === now.toDateString();

    if (!isToday) {
      return allSlots;
    }

    // Get current hour + 1 (minimum 1 hour buffer for vendors to accept)
    const currentHour = now.getHours();
    const minHour = currentHour + 1;

    return allSlots.filter(slot => {
      const slotHour = parseInt(slot.value.split(':')[0], 10);
      return slotHour >= minHour;
    });
  };

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
    };
  };



  const isDateSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isTimeSelected = (time) => {
    return selectedTime === time;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-32 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" style={{ borderColor: themeColors.button }}></div>
          <p className="text-gray-500">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[100dvh] pb-32 relative bg-[#F8FAFC] overflow-x-hidden">
        {/* Premium Modern Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
          <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10">
          <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white shadow-sm px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-gray-100 active:scale-95 transition-all"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Your Cart</h1>
            </div>
          </header>
          <main className="px-4 py-6">
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-md rounded-[32px] border border-white border-dashed shadow-[0_8px_30px_rgba(0,0,0,0.04)] mt-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
                <FiShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-xl font-black text-gray-900 mb-2 tracking-tight">Your cart is empty</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto text-center leading-relaxed">
                Add services to get started
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-80 relative bg-[#F8FAFC] overflow-x-hidden">
      {/* Premium Modern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white shadow-sm px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-gray-100 active:scale-95 transition-all"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              {category ? `${category} Checkout` : 'Your cart'}
            </h1>
          </div>
        </header>

        <main className="px-4 py-6">
          {/* Savings Banner */}
          {savings > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-[20px] p-4 mb-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                  <MdStar className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Smart Choice!</p>
                  <p className="text-[14px] font-black text-slate-900">
                    You're saving <span className="text-emerald-600">₹{savings.toLocaleString('en-IN')}</span>
                  </p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-emerald-100">
                <span className="text-[9px] font-black text-emerald-600 tracking-widest uppercase">Best Price</span>
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => {
              const brandName = item.brand || item.sectionTitle;
              const categoryName = item.categoryTitle || item.category;

              return (
                <div key={item._id} className="bg-white/70 backdrop-blur-xl border border-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group">
                  {/* Brand Header */}
                  {(brandName || categoryName) && (
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/60">
                      {item.sectionIcon ? (
                        <img src={toAssetUrl(item.sectionIcon)} className="w-8 h-8 rounded-[10px] object-cover border border-white shadow-sm" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-[10px] bg-white border border-gray-100 flex items-center justify-center text-xs font-black text-gray-400 shadow-sm">
                          {(brandName || "B").charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        {brandName && <span className="text-[13px] font-black text-gray-900 tracking-tight">{brandName}</span>}
                        {categoryName && <span className="text-[9px] font-bold text-[#008080] uppercase tracking-widest mt-0.5">{categoryName}</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-[16px] font-black text-gray-900 mb-1.5 leading-snug tracking-tight">{item.title}</h3>
                      {item.description && (
                        <p className="text-[11px] font-medium text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}
                      {item.duration && (
                        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <FiClock className="w-3.5 h-3.5" />
                          {item.duration}
                        </div>
                      )}
                    </div>
                    {!item.isPlan && (
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2 bg-white/50 border border-white rounded-[12px] p-1 shadow-sm">
                          <button
                            onClick={() => handleQuantityChange(item._id, -1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-[8px] transition-all"
                          >
                            <FiMinus className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                          <span className="w-4 text-center text-[13px] font-black text-gray-900">{item.serviceCount || 1}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-[8px] transition-all"
                          >
                            <FiPlus className="w-3.5 h-3.5 text-gray-900" />
                          </button>
                        </div>
                      </div>
                    )}
                    {!item.isPlan && (
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[16px] font-black text-[#008080]">
                      {calculateItemPrice(item) === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        `₹${(item.price || 0).toLocaleString('en-IN')}`
                      )}
                    </span>
                    {calculateItemPrice(item) === 0 && (
                      <span className="text-[9px] font-black bg-emerald-100/50 text-emerald-600 px-2 py-1 rounded-[6px] border border-emerald-200 uppercase tracking-widest">
                        With Plan
                      </span>
                    )}
                    {calculateItemPrice(item) > 0 && (() => {
                      const unitPrice = item.unitPrice || (item.price / (item.serviceCount || 1));
                      const unitOriginalPrice = item.originalPrice || unitPrice;
                      const currentTotal = item.price;
                      const originalTotal = unitOriginalPrice * (item.serviceCount || 1);
                      if (originalTotal > currentTotal) {
                        return (
                          <span className="text-[12px] font-bold text-gray-400 line-through">
                            ₹{originalTotal.toLocaleString('en-IN')}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  {/* Animated Glowing Border for Cart Items */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[24px]"></div>
                  
                </div>
              )
            })}
          </div>

        {/* ... */}


          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[24px] p-5 mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                  <FiPhone className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-gray-900 tracking-tight">{contactDetails.name || JSON.parse(localStorage.getItem('userData'))?.name || 'Verified Customer'}</p>
                  <p className="text-[11px] font-bold text-gray-500 mt-0.5 font-mono tracking-wider">{contactDetails.phone || userPhone || 'Loading...'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="text-[10px] font-black uppercase tracking-widest text-[#008080] bg-[#008080]/10 px-3 py-1.5 rounded-[8px] hover:bg-[#008080]/20 transition-colors"
              >
                Change
              </button>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[32px] p-6 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#008080]/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D68F35]/5 rounded-full blur-[30px] -ml-10 -mb-10 pointer-events-none"></div>

            <h3 className="text-[16px] font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tight relative z-10">
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#008080]/10 to-[#008080]/5 border border-[#008080]/20 flex items-center justify-center shadow-sm">
                <FiShoppingCart className="w-5 h-5 text-[#008080]" />
              </div>
              Payment Summary
            </h3>

            <div className="space-y-4 relative z-10">
              {/* Original Price */}
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-gray-500">Item Total</span>
                <span className="text-[13px] font-black text-gray-900">
                  ₹{totalOriginalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Discount Line */}
              {displaySavings > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-black text-emerald-500">Discount</span>
                  <span className="text-[13px] font-black text-emerald-500">-₹{displaySavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Upgrade Credit */}
              {upgradePreview && upgradePreview.credit > 0 && (
                <div className="flex justify-between items-center text-emerald-500">
                  <span className="text-[13px] font-black">Plan Credit</span>
                  <span className="text-[13px] font-black">-₹{upgradePreview.credit.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Taxes */}
              {displayTax > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-gray-500">GST ({gstPercentage}%)</span>
                  <span className="text-[13px] font-black text-gray-700">₹{displayTax.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Visited Fee */}
              {displayFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-gray-500">Convenience Fee</span>
                  <span className="text-[13px] font-black text-gray-700">₹{displayFee.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200 pt-5 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[17px] font-black text-gray-900">Total Payable</span>
                  <div className="flex flex-col items-end">
                    {totalAmount === 0 ? (
                      <>
                        <span className="text-[12px] font-bold text-gray-400 line-through mb-1">
                          ₹{Math.round(totalOriginalPrice + displayTax + displayFee).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[22px] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 uppercase tracking-tight">Free</span>
                      </>
                    ) : (
                      <span className="text-[24px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#008080] to-teal-500 tracking-tight drop-shadow-sm">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-[20px] p-5 mb-6 flex items-start gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-[20px] -mr-5 -mt-5"></div>
            <div className="bg-amber-100 p-2.5 rounded-full shrink-0 relative z-10">
              <FiInfo className="w-5 h-5 text-amber-600" />
            </div>
            <div className="relative z-10">
              <h4 className="text-[13px] font-black text-amber-900 mb-1.5 tracking-tight">Important Note</h4>
              <p className="text-[11px] text-amber-800/80 leading-relaxed font-bold">
                This is a base booking cost. Additional service cost may be added by the vendor after inspection.
              </p>
            </div>
          </div>

          {/* Free Plan Benefit Card */}
          {totalAmount === 0 && (
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[24px] p-6 mb-6 relative overflow-hidden shadow-[0_8px_30px_rgb(16,185,129,0.2)] border border-emerald-300">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-teal-300/30 rounded-full blur-xl"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-2.5 shadow-lg border border-white/30 shrink-0">
                  <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-white mb-1.5 tracking-tight drop-shadow-sm">Covered by {planBenefits.name}</h3>
                  <p className="text-[12px] text-emerald-50 leading-relaxed font-medium">
                    You save <span className="font-black text-white bg-white/20 px-1.5 py-0.5 rounded">₹{Math.round(totalOriginalPrice + displayTax + displayFee).toLocaleString('en-IN')}</span>!
                    Your plan covers all costs for this service.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Policy */}
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[24px] p-5 mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-[13px] font-black text-gray-900 mb-2 tracking-tight">Cancellation Policy</h3>
            <p className="text-[11px] font-bold text-gray-500 mb-3 leading-relaxed">
              Free cancellations if done more than 12 hrs before the service or if a professional isn't assigned. A fee will be charged otherwise.
            </p>
            <button
              onClick={() => navigate('/user/cancellation-policy')}
              className="text-[10px] font-black text-[#008080] uppercase tracking-widest hover:underline"
            >
              Read Full Policy
            </button>
          </div>
        </main>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-2xl border border-white/50 z-40 rounded-[32px] shadow-[0_20px_40px_rgb(0,0,0,0.08),0_0_20px_rgb(0,128,128,0.05)] overflow-hidden">
        {/* Booking Type Toggle */}
        <div className="px-4 pt-4 pb-0">
          <div className="relative flex bg-gray-100/50 p-1.5 rounded-[20px] mb-4 border border-gray-200/50 backdrop-blur-md">
            {/* Animated Background Pill */}
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out z-0 border border-gray-100 ${bookingType === 'instant' ? 'left-1.5' : 'translate-x-full left-[calc(1.5px)]'
                }`}
            ></div>
            
            <button
              onClick={() => setBookingType('instant')}
              className={`flex-1 py-3 text-[12px] font-black uppercase tracking-widest rounded-[16px] transition-all flex items-center justify-center gap-2 relative z-10 ${bookingType === 'instant' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <span className={`text-sm ${bookingType === 'instant' ? 'animate-pulse' : ''}`}>⚡</span> Instant
            </button>
            <button
              onClick={() => setBookingType('scheduled')}
              className={`flex-1 py-3 text-[12px] font-black uppercase tracking-widest rounded-[16px] transition-all flex items-center justify-center gap-2 relative z-10 ${bookingType === 'scheduled' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <span className="text-sm">📅</span> Schedule
            </button>
          </div>
          {bookingType === 'instant' && (
            <div className="flex items-center justify-center gap-2 bg-emerald-50/50 py-2 rounded-xl border border-emerald-100/50 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                Vendor arrives in ~45 mins
              </p>
            </div>
          )}
        </div>

        {/* Address and Slot Display */}
        <div className="px-5 pt-3 pb-3 border-b border-gray-50">
          {(houseNumber || addressDetails) ? (
            <div className="space-y-3">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-[#008080]/10 flex items-center justify-center shrink-0 border border-[#008080]/20">
                  <FiHome className="w-4 h-4 text-[#008080]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-[12px] font-bold text-gray-900 truncate">
                    {houseNumber ? `${houseNumber}, ` : ''}{address || 'Select Address'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-colors shrink-0"
                >
                  <FiEdit2 className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>

              {/* Time Slot (Only for Scheduled) */}
              {bookingType === 'scheduled' && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-50">
                  <div className="w-8 h-8 rounded-[10px] bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <FiClock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Slot</p>
                    <p className="text-[12px] font-bold text-gray-900">
                      {selectedDate ? (() => {
                        const { day, date: dateNum } = formatDate(selectedDate);
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const month = monthNames[selectedDate.getMonth()];
                        const timeStr = selectedTime && getTimeSlots().find(slot => slot.value === selectedTime)?.display ? ` • ${getTimeSlots().find(slot => slot.value === selectedTime).display}` : '';
                        return `${day}, ${dateNum} ${month}${timeStr}`;
                      })() : (
                        <span className="text-gray-400 font-medium italic">Select Date & Time</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTimeSlotModal(true)}
                    className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-colors shrink-0"
                  >
                    <FiEdit2 className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => setShowAddressModal(true)}
              className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-[16px] cursor-pointer active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-rose-100 flex items-center justify-center shrink-0">
                  <FiHome className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-[12px] font-black text-rose-900 tracking-tight">Delivery Address Missing</p>
                  <p className="text-[10px] font-bold text-rose-600 mt-0.5">Please add address to proceed</p>
                </div>
              </div>
              <FiEdit2 className="w-4 h-4 text-rose-400" />
            </div>
          )}
        </div>

        <div className="p-4 bg-white/90">
          <button
            onClick={plan ? handlePlanPayment :
              (houseNumber || addressDetails) ?
                (currentStep === 'payment' ? handlePayment : handleSearchVendors) :
                handleProceed}
            disabled={searchingVendors}
            className="w-full text-white py-4 rounded-[16px] text-[13px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_4px_20px_rgba(0,128,128,0.3)] hover:shadow-[0_8px_25px_rgba(0,128,128,0.4)] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' }}
          >
            {searchingVendors ? 'Searching for vendors...' :
              currentStep === 'payment' ? (totalAmount === 0 ? 'Confirm Booking (Free)' : (paymentMethod === 'online' ? 'Proceed to Pay' : 'Confirm Booking')) :
                plan ? 'Proceed to Payment' :
                  bookingType === 'instant' ? 'Find Nearby Vendors Now' :
                    (selectedDate && selectedTime && houseNumber ?
                      'Find Nearby Vendors' :
                      (houseNumber || addressDetails) ? 'Select Time Slot' : 'Add Address to Proceed')}
          </button>
        </div>
      </div>

      {/* Live Booking Status Card (Visible when minimized) */}
      <LiveBookingCard key={bookingRequest?._id || 'default'} />

      {/* Vendor Search Modal */}
      <VendorSearchModal
        isOpen={showVendorModal}
        onClose={() => {
          setShowVendorModal(false);
          setSearchingVendors(false); // Fix: Reset search state when modal closes
          if (currentStep === 'accepted') {
            setCurrentStep('payment');
          } else if (currentStep === 'failed') {
            setCurrentStep('details');
          }
        }}
        currentStep={currentStep}
        acceptedVendor={acceptedVendor}
        onRetry={() => {
          handleSearchVendors();
        }}
      />

      {/* Contact Details Edit Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Contact Details</h3>
            <p className="text-sm text-gray-500 mb-4">These details will be used for this booking only.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                <input
                  type="text"
                  value={contactDetails.name}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                <div className="flex gap-2">
                  <span className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium select-none">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={contactDetails.phone?.replace('+91', '')?.replace(/^\+91/, '') || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setContactDetails(prev => ({ ...prev, phone: val }));
                    }}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="9999999999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (contactDetails.name.length < 2) {
                      toast.error('Please enter a valid name');
                      return;
                    }
                    if (!contactDetails.phone || contactDetails.phone.length < 10) {
                      toast.error('Please enter a valid 10-digit phone number');
                      return;
                    }
                    setShowContactModal(false);
                  }}
                  className="py-3 rounded-xl font-bold text-white shadow-lg shadow-teal-500/30 active:scale-95 transition-all"
                  style={{ backgroundColor: themeColors.button }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        address={address}
        houseNumber={houseNumber}
        onHouseNumberChange={setHouseNumber}
        onSave={handleAddressSave}
      />

      {/* Time Slot Modal */}
      <TimeSlotModal
        isOpen={showTimeSlotModal}
        onClose={() => setShowTimeSlotModal(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateSelect={setSelectedDate}
        onTimeSelect={setSelectedTime}
        onSave={handleTimeSlotSave}
        getDates={getDates}
        getTimeSlots={getTimeSlots}
        formatDate={formatDate}
        isDateSelected={isDateSelected}
        isTimeSelected={isTimeSelected}
      />
    </div>
  );
};

export default Checkout;
