import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiCheckCircle, FiSearch, FiFilter } from 'react-icons/fi';
import adminStoreOrderService from '../../../../services/adminStoreOrderService';
import { BiRupee } from 'react-icons/bi';
import moment from 'moment';
import toast from 'react-hot-toast';

const StoreOrders = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    deliveredCount: 0
  });
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination and filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Load stats
      const statsRes = await adminStoreOrderService.getStoreOrderStats();
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      
      // Load orders
      const ordersRes = await adminStoreOrderService.getStoreOrders({
        page,
        limit: 10,
        status: statusFilter,
        search
      });
      
      if (ordersRes.success) {
        setOrders(ordersRes.orders);
        setTotalPages(ordersRes.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch store orders data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change order status to ${newStatus}?`)) return;
    
    try {
      // Needs an endpoint for patching the status:
      const res = await adminStoreOrderService.updateOrderStatus(id, newStatus);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, isMoney }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          {isMoney && <BiRupee className="w-5 h-5 mr-1" />}
          {typeof value === 'number' && !isMoney ? value.toLocaleString() : value}
        </h3>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Store Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track store product orders</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={FiShoppingBag} 
          color="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Delivered Orders" 
          value={stats.deliveredCount} 
          icon={FiCheckCircle} 
          color="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Total Revenue" 
          value={stats.totalRevenue.toFixed(2)} 
          icon={FiShoppingBag} 
          color="bg-indigo-100 text-indigo-600" 
          isMoney
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <FiFilter className="text-gray-400" />
          <select
            className="border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID & Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Snapshot</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">{moment(order.createdAt).format('MMM DD, YYYY hh:mm A')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{order.user_id?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.user_id?.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={order.productSnapshot?.image || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{order.productSnapshot?.name}</p>
                          <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 flex items-center">
                        <BiRupee />{order.total_amount?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <select
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border focus:outline-none uppercase tracking-wider
                          ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                            order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            order.status === 'processing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={['delivered', 'cancelled'].includes(order.status)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StoreOrders;
