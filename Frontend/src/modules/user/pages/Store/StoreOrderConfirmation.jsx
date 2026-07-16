import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import PageTransition from '../../components/common/PageTransition';

const StoreOrderConfirmation = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
          <FiCheckCircle size={48} />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">Order Placed!</h1>
        <p className="text-gray-500 text-center mb-8 max-w-sm">
          Your order has been successfully placed. We will notify you once it's processed.
        </p>

        <div className="w-full max-w-sm space-y-3">
          <button 
            onClick={() => navigate('/user/store/orders', { replace: true })}
            className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30"
          >
            Track My Order
          </button>
          
          <button 
            onClick={() => navigate('/user/store', { replace: true })}
            className="w-full py-4 bg-white text-teal-600 font-bold rounded-2xl border-2 border-teal-100 hover:bg-teal-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default StoreOrderConfirmation;
