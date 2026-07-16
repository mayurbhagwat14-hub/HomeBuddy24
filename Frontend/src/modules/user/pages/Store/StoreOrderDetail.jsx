import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import storeService from '../../../../services/storeService';
import PageTransition from '../../components/common/PageTransition';
import toast from 'react-hot-toast';

const StoreOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();

    const handleUpdate = () => fetchOrder();
    window.addEventListener('storeOrderUpdated', handleUpdate);
    return () => window.removeEventListener('storeOrderUpdated', handleUpdate);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await storeService.getOrderDetail(id);
      if (res.success) {
        setOrder(res.order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await storeService.cancelOrder(id);
      if (res.success) {
        toast.success('Order cancelled');
        setOrder(res.order);
      } else {
        toast.error(res.message || 'Failed to cancel order');
      }
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center">Loading...</div>;
  }

  if (!order) {
    return <div className="min-h-screen flex justify-center items-center">Order not found</div>;
  }

  const canCancel = ['pending', 'processing'].includes(order.status);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white px-4 pt-12 pb-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/user/store/orders')}
              className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Status Banner */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0
              ${order.status === 'delivered' ? 'bg-green-100 text-green-500' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-500' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-500' :
                order.status === 'processing' ? 'bg-yellow-100 text-yellow-500' :
                'bg-gray-100 text-gray-500'}`}
            >
              {order.status === 'delivered' ? <FiCheckCircle size={28} /> :
               order.status === 'cancelled' ? <FiArrowLeft size={28} /> :
               order.status === 'shipped' ? <FiTruck size={28} /> :
               <FiPackage size={28} />}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 capitalize">
                {order.status}
              </h2>
              <p className="text-sm text-gray-500">
                {order.status === 'pending' ? 'Your order is placed and pending processing.' :
                 order.status === 'processing' ? 'Your order is being processed.' :
                 order.status === 'shipped' ? 'Your order has been shipped.' :
                 order.status === 'delivered' ? 'Order delivered successfully.' :
                 'Order was cancelled.'}
              </p>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">Item Details</h3>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden">
                <img 
                  src={order.productSnapshot?.image || 'https://via.placeholder.com/150'} 
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 leading-tight">{order.productSnapshot?.name}</h4>
                <div className="text-sm text-gray-500 mt-1">Qty: {order.quantity}</div>
                <div className="font-black text-teal-600 mt-2">₹{order.total_amount}</div>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">Delivery Address</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {order.delivery_address?.addressLine1}<br />
              {order.delivery_address?.city}, {order.delivery_address?.state} {order.delivery_address?.pincode}
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">Payment Info</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Method</span>
              <span className="font-medium text-gray-800 uppercase">{order.payment_method === 'cash' ? 'Cash on Delivery' : 'Online'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-gray-900">₹{order.total_amount}</span>
            </div>
          </div>

          {/* Cancel Button */}
          {canCancel && (
            <button 
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full py-4 mt-4 bg-white text-red-500 font-bold rounded-2xl border-2 border-red-100 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default StoreOrderDetail;
