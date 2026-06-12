import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const BrandingContext = createContext();

export const useBranding = () => useContext(BrandingContext);

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    appName: 'HomeBuddy24',
    appLogo: '',
    favicon: '',
    loginLogo: '',
    splashLogo: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const response = await api.get('/branding/public');
      if (response.data.success && response.data.data) {
        setBranding(response.data.data);
        applyBrandingToDOM(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyBrandingToDOM = (data) => {
    if (data.appName) {
      document.title = data.appName;
    }
    if (data.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = data.favicon;
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const value = {
    branding,
    loading,
    refreshBranding: fetchBranding
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};
