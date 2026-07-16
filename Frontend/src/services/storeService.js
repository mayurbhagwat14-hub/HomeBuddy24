import api from './api';

const storeService = {
  // Get all approved products with optional filters
  getProducts: async (params) => {
    const response = await api.get('/users/store/products', { params });
    return response.data;
  },

  // Get product details
  getProductDetails: async (id) => {
    const response = await api.get(`/users/store/products/${id}`);
    return response.data;
  },

  // Get available categories
  getCategories: async () => {
    const response = await api.get('/users/store/categories');
    return response.data;
  },

  // Get user's cart
  getCart: async () => {
    const response = await api.get('/users/store/cart');
    return response.data;
  },

  // Add or update item in cart
  updateCartItem: async (productId, quantity) => {
    const response = await api.post('/users/store/cart', { productId, quantity });
    return response.data;
  },

  // Remove item from cart
  removeCartItem: async (itemId) => {
    const response = await api.delete(`/users/store/cart/${itemId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/users/store/cart');
    return response.data;
  },

  // Place store order
  placeOrder: async (orderData) => {
    // orderData: { productId, quantity, deliveryAddress, paymentMethod }
    const response = await api.post('/users/store-orders', orderData);
    return response.data;
  },

  // Get my orders
  getMyOrders: async (params) => {
    const response = await api.get('/users/store-orders', { params });
    return response.data;
  },

  // Get order details
  getOrderDetail: async (id) => {
    const response = await api.get(`/users/store-orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await api.post(`/users/store-orders/${id}/cancel`);
    return response.data;
  },

  // Delete order
  deleteOrder: async (id) => {
    const response = await api.delete(`/users/store-orders/${id}`);
    return response.data;
  }
};

export default storeService;
