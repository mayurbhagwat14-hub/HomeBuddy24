import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiImage, FiType, FiMonitor, FiSmartphone, FiLayout } from 'react-icons/fi';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { useBranding } from '../../../../context/BrandingContext';

const ImageUploadCard = ({ title, icon: Icon, type, currentUrl, onUpload }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentUrl);
  const [localLoading, setLocalLoading] = useState(false);

  // Sync preview when currentUrl changes from server
  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (file) {
      setLocalLoading(true);
      await onUpload(file, type, () => setFile(null));
      setLocalLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Icon className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>

      <div className="space-y-5">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50 flex flex-col items-center justify-center">
          {preview ? (
            <img src={preview.startsWith('http') ? preview : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/${preview}`} alt={`${title} Preview`} className="max-h-32 object-contain mb-4" />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <FiImage className="text-gray-400 w-8 h-8" />
            </div>
          )}
          
          <input type="file" id={`upload-${type}`} className="hidden" accept="image/jpeg,image/png,image/svg+xml,image/webp,image/x-icon" onChange={handleFileChange} />
          <label htmlFor={`upload-${type}`} className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Choose New {title}
          </label>
          <p className="text-xs text-gray-400 mt-3">Max 5MB (JPG, PNG, SVG, WEBP)</p>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleUpload} disabled={localLoading || !file}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-purple-200">
            {localLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
            Upload {title}
          </button>
        </div>
      </div>
    </div>
  );
};

const BrandingSettings = () => {
  const { refreshBranding } = useBranding();
  
  const [branding, setBranding] = useState({
    appName: '',
    appLogo: '',
    favicon: '',
    loginLogo: '',
    splashLogo: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await api.get('/branding');
      if (response.data.success && response.data.data) {
        setBranding(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
      toast.error('Failed to load branding settings');
    }
  };

  const handleTextChange = (e) => {
    setBranding({ ...branding, [e.target.name]: e.target.value });
  };

  const handleSaveText = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/branding', { appName: branding.appName });
      if (res.data.success) {
        toast.success('App name updated successfully');
        refreshBranding();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update App Name');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file, type, onSuccess) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await api.post('/branding/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(`${type} uploaded successfully`);
        setBranding(res.data.data);
        if (onSuccess) onSuccess();
        refreshBranding();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to upload ${type}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Text Branding Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiType className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">App Name / Text Branding</h2>
        </div>

        <form onSubmit={handleSaveText} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Application Name</label>
            <input type="text" name="appName" value={branding.appName} onChange={handleTextChange} placeholder="e.g. HomeBuddy24"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all" required />
            <p className="text-[10px] text-gray-400 mt-1">This name will be used across the application, emails, and PDFs.</p>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-200">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
              Save Name
            </button>
          </div>
        </form>
      </div>

      <ImageUploadCard 
        title="Main App Logo" 
        icon={FiLayout} 
        type="appLogo" 
        currentUrl={branding.appLogo} 
        onUpload={handleUploadImage} 
      />

      <ImageUploadCard 
        title="Favicon" 
        icon={FiImage} 
        type="favicon" 
        currentUrl={branding.favicon} 
        onUpload={handleUploadImage} 
      />

      <ImageUploadCard 
        title="Login Logo" 
        icon={FiMonitor} 
        type="loginLogo" 
        currentUrl={branding.loginLogo} 
        onUpload={handleUploadImage} 
      />

      <ImageUploadCard 
        title="Splash Screen Logo" 
        icon={FiSmartphone} 
        type="splashLogo" 
        currentUrl={branding.splashLogo} 
        onUpload={handleUploadImage} 
      />

    </motion.div>
  );
};

export default BrandingSettings;
