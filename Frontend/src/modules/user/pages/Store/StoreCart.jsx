import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiChevronRight } from 'react-icons/fi';
import { useStoreCart } from '../../../../context/StoreCartContext';
import PageTransition from '../../components/common/PageTransition';

const StoreCart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateCartItem, removeCartItem, getCartTotal, getItemCount } = useStoreCart();

  const handleUpdateQuantity = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    await updateCartItem(productId, newQty);
  };

  const handleCheckout = () => {
    navigate('/user/store/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

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
          <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
          <div className="ml-auto bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-bold text-sm">
            {getItemCount()} items
          </div>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 pt-32 text-center">
            <div className="w-32 h-32 bg-teal-50 rounded-full flex items-center justify-center mb-6">
              <FiShoppingBag className="text-teal-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <button 
              onClick={() => navigate('/user/store')}
              className="w-full max-w-xs py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="px-4 py-6 space-y-4">
              {items.map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image || 'https://via.placeholder.com/150'} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight">{item.name}</h3>
                        <button 
                          onClick={() => removeCartItem(item._id)}
                          className="p-2 -mt-1 -mr-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors flex-shrink-0"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">₹{item.price} x {item.quantity}</div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-black text-lg text-teal-600">₹{item.price * item.quantity}</span>
                      
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 border border-gray-100">
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-teal-600"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-teal-600"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Checkout Sticky Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-2xl font-black text-gray-900">₹{getCartTotal()}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30 flex justify-between items-center px-6"
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center gap-1">
                  <span>{getItemCount()} items</span>
                  <FiChevronRight size={20} />
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default StoreCart;
