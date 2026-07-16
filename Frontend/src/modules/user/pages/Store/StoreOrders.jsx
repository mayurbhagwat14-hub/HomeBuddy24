import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTrash2 } from 'react-icons/fi';
import storeService from '../../../../services/storeService';
import PageTransition from '../../components/common/PageTransition';
import toast from 'react-hot-toast';

const StoreOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await storeService.getMyOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setLoading(true);
      const res = await storeService.deleteOrder(orderToDelete);
      if (res.success) {
        toast.success('Order removed from history');
        setOrders(prev => prev.filter(o => o._id !== orderToDelete));
      } else {
        toast.error(res.message || 'Failed to remove order');
      }
    } catch (error) {
      toast.error('Failed to remove order. Please try again.');
    } finally {
      setLoading(false);
      setOrderToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white px-4 pt-12 pb-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button 
            onClick={() => navigate('/user/store')}
            className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        </div>

        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white h-32 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <FiPackage size={40} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">No orders found</h2>
            <p className="text-gray-500">You haven't placed any store orders yet.</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {orders.map(order => (
              <div 
                key={order._id}
                onClick={() => navigate(`/user/store/order/${order._id}`)}
                className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Order #{order.orderNumber}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-teal-600 block">₹{order.total_amount}</span>
                      {['delivered', 'cancelled', 'unfulfilled'].includes(order.status) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToDelete(order._id);
                          }}
                          className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete from history"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={order.productSnapshot.image || 'https://via.placeholder.com/150'} 
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{order.productSnapshot.name}</h4>
                    <p className="text-xs text-gray-500">Qty: {order.quantity} • {order.payment_method === 'cash' ? 'COD' : 'Online'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-md">
            <div className="w-full max-w-[320px] bg-white rounded-[24px] p-6 shadow-xl border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <FiTrash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Clear History</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to remove this order from your history? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setOrderToDelete(null)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-bold active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteOrder}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold active:scale-95 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default StoreOrders;
