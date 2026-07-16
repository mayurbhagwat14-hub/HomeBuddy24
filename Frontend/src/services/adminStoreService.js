import api from './api';

const adminStoreService = {
  getAllProducts: async (params) => {
    const response = await api.get('/admin/store/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/admin/store/products/${id}`);
    return response.data;
  },

  createProduct: async (data) => {
    const response = await api.post('/admin/store/products', data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await api.put(`/admin/store/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/store/products/${id}`);
    return response.data;
  }
};

export default adminStoreService;
