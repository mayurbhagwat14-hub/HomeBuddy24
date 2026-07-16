import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { useStoreCart } from '../../../../context/StoreCartContext';
import storeService from '../../../../services/storeService';
import { userAuthService } from '../../../../services/authService';
import toast from 'react-hot-toast';
import PageTransition from '../../components/common/PageTransition';

const StoreCheckout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, getItemCount, clearCart } = useStoreCart();
  
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'online'
  const [loading, setLoading] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(true);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await userAuthService.getProfile();
        if (res.success && res.user.addresses && res.user.addresses.length > 0) {
          const defaultAddress = res.user.addresses.find(a => a.isDefault) || res.user.addresses[0];
          setAddress(defaultAddress);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setFetchingAddress(false);
      }
    };
    fetchAddress();
  }, []);

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.error('Please add a delivery address first');
      return navigate('/user/account'); // Or a specific address management page
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return navigate('/user/store');
    }

    setLoading(true);
    try {
      // In this version, we place separate orders for each item/vendor 
      // since the backend placeOrder handles single productId.
      // Wait, the backend takes `productId` and `quantity`. If we have multiple items, we must loop.
      // Ideally, a batch checkout endpoint handles this. 
      // For now, let's submit each item as a separate order concurrently.
      
      const orderPromises = cart.items.map(item => {
        return storeService.placeOrder({
          productId: item.productId,
          quantity: item.quantity,
          deliveryAddress: {
            addressLine1: address.addressLine1,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            lat: address.lat || 0, // In a real app, geocode the address if missing
            lng: address.lng || 0
          },
          paymentMethod
        });
      });

      const results = await Promise.allSettled(orderPromises);
      
      const successes = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));

      if (successes.length > 0) {
        // Clear cart for the items that succeeded
        await clearCart();
        navigate(`/user/store/order-confirmation`);
      } else {
        toast.error('Failed to place orders. ' + (failures[0]?.value?.message || failures[0]?.reason || ''));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingAddress) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center">Loading...</div>;
  }

  const total = getCartTotal();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Header */}
        <div className="bg-white px-4 pt-12 pb-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Address Section */}
          <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                <FiMapPin size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
            </div>
            
            {address ? (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="font-bold text-gray-800 mb-1">{address.type || 'Home'}</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {address.addressLine1}<br/>
                  {address.addressLine2 && <>{address.addressLine2}<br/></>}
                  {address.city}, {address.state} {address.pincode}
                </p>
                <button 
                  onClick={() => navigate('/user/manage-addresses')}
                  className="mt-3 text-teal-600 font-bold text-sm hover:underline"
                >
                  Change Address
                </button>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                <p className="text-red-600 font-medium mb-3">No address found</p>
                <button 
                  onClick={() => navigate('/user/manage-addresses')}
                  className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl text-sm"
                >
                  Add Address
                </button>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <FiCreditCard size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
            </div>
            
            <div className="space-y-3">
              <label className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'online' ? 'border-teal-500 bg-teal-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="online" 
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
                <span className="ml-3 font-medium text-gray-800">Pay Online (Razorpay)</span>
              </label>
              
              <label className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'cash' ? 'border-teal-500 bg-teal-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cash" 
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
                <span className="ml-3 font-medium text-gray-800">Cash on Delivery</span>
              </label>
            </div>
          </section>

          {/* Order Summary */}
          <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-gray-600 text-sm">
              <div className="flex justify-between">
                <span>Items ({getItemCount()})</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="text-teal-600 font-medium">Free</span>
              </div>
              <div className="h-px bg-gray-100 my-2"></div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-gray-900">₹{total}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-30">
          <button 
            onClick={handlePlaceOrder}
            disabled={loading || !address}
            className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Processing...' : `Place Order • ₹${total}`}
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default StoreCheckout;
