import api from './api';

const adminStoreOrderService = {
  getStoreOrders: async (params = {}) => {
    try {
      const { data } = await api.get('/admin/store-orders', { params });
      return data;
    } catch (error) {
      console.error('Error fetching store orders:', error);
      throw error;
    }
  },

  getStoreOrderStats: async () => {
    try {
      const { data } = await api.get('/admin/store-orders/stats');
      return data;
    } catch (error) {
      console.error('Error fetching store order stats:', error);
      throw error;
    }
  }
};

export default adminStoreOrderService;
