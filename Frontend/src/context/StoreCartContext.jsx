import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import storeService from '../services/storeService';

const StoreCartContext = createContext();

export const StoreCartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    // Don't fetch if not on a user route or no token
    const path = window.location.pathname;
    if (path.startsWith('/vendor') || path.startsWith('/admin') || path.startsWith('/worker')) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      const response = await storeService.getCart();
      if (response.success) {
        setCart(response.cart);
      }
    } catch (err) {
      console.error('Error fetching store cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await storeService.updateCartItem(productId, quantity);
      if (response.success) {
        setCart(response.cart);
        return true;
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      return false;
    }
  };

  const removeCartItem = async (itemId) => {
    try {
      const response = await storeService.removeCartItem(itemId);
      if (response.success) {
        setCart(response.cart);
        return true;
      }
    } catch (err) {
      console.error('Error removing item:', err);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const response = await storeService.clearCart();
      if (response.success) {
        setCart({ ...cart, items: [] });
        return true;
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      return false;
    }
  };

  const getCartTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <StoreCartContext.Provider value={{
      cart,
      loading,
      error,
      updateCartItem,
      removeCartItem,
      clearCart,
      getCartTotal,
      getItemCount,
      refreshCart: fetchCart
    }}>
      {children}
    </StoreCartContext.Provider>
  );
};

export const useStoreCart = () => {
  const context = useContext(StoreCartContext);
  if (!context) {
    console.warn('useStoreCart was called outside of StoreCartProvider');
    return {
      cart: null,
      loading: false,
      error: null,
      updateCartItem: async () => false,
      removeCartItem: async () => false,
      clearCart: async () => false,
      getCartTotal: () => 0,
      getItemCount: () => 0,
      refreshCart: async () => {}
    };
  }
  return context;
};
