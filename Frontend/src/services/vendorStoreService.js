import api from './api';

const vendorStoreService = {
  // Products
  addProduct: async (productData) => {
    const response = await api.post('/vendors/store/products', productData);
    return response.data;
  },

  getMyProducts: async (params) => {
    const response = await api.get('/vendors/store/products', { params });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/vendors/store/products/${id}`, productData);
    return response.data;
  },

  toggleProductStatus: async (id, deactivate) => {
    const response = await api.patch(`/vendors/store/products/${id}/toggle`, { deactivate });
    return response.data;
  },

  updateStock: async (id, stock_qty) => {
    const response = await api.patch(`/vendors/store/products/${id}/stock`, { stock_qty });
    return response.data;
  },

  // Orders
  getIncomingOrders: async (params) => {
    const response = await api.get('/vendors/store-orders', { params });
    return response.data;
  },

  getOrderDetail: async (id) => {
    const response = await api.get(`/vendors/store-orders/${id}`);
    return response.data;
  },

  acceptOrder: async (id, etaMinutes) => {
    const response = await api.post(`/vendors/store-orders/${id}/accept`, { etaMinutes });
    return response.data;
  },

  setOnTheWay: async (id) => {
    const response = await api.post(`/vendors/store-orders/${id}/out-for-delivery`);
    return response.data;
  },

  markReached: async (id) => {
    const response = await api.post(`/vendors/store-orders/${id}/reached`);
    return response.data;
  },

  markDelivered: async (id, otp) => {
    const response = await api.post(`/vendors/store-orders/${id}/delivered`, { otp });
    return response.data;
  }
};

export default vendorStoreService;
