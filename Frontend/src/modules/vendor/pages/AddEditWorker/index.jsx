import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiLink, FiUserPlus, FiSearch, FiChevronDown, FiCamera, FiUpload, FiMapPin } from 'react-icons/fi';
import AddressSelectionModal from '../../../user/pages/Checkout/components/AddressSelectionModal';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { createWorker, updateWorker, getWorkerById, linkWorker } from '../../services/workerService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';
import { z } from "zod";

// Zod schemas
const addWorkerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter valid 10-digit phone number"),
  serviceCategories: z.array(z.string()).min(1, "Select at least one category"),
  aadhar: z.object({
    number: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits"),
    // document: z.any() 
  }),
  // address: z.any().optional() // Make address optional or strict as needed
});

const editWorkerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter valid 10-digit phone number"),
  serviceCategories: z.array(z.string()).min(1, "Select at least one category"),
});

const AddEditWorker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'link'
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    aadhar: {
      number: '',
      document: '' // Base64 string ideally
    },
    serviceCategories: [],
    address: {
      addressLine1: '',
      city: '',
      state: '',
      pincode: ''
    },
    status: 'active',
    profilePhoto: '', // URL
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [linkPhone, setLinkPhone] = useState('');

  const [errors, setErrors] = useState({});

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        const catRes = await publicCatalogService.getCategories();
        if (catRes.success) {
          console.log('Loaded Categories:', catRes.categories || []);
          setCategories(catRes.categories || []);
        }

        if (isEdit) {
          setLoading(true);
          const res = await getWorkerById(id);
          if (res.success) {
            const w = res.data;
            setFormData({
              name: w.name || '',
              phone: w.phone || '',
              email: w.email || '',
              aadhar: {
                number: w.aadhar?.number || '',
                document: w.aadhar?.document || ''
              },
              serviceCategories: w.serviceCategories || (w.serviceCategory ? [w.serviceCategory] : []),
              address: {
                addressLine1: w.address?.addressLine1 || '',
                city: w.address?.city || '',
                state: w.address?.state || '',
                pincode: w.address?.pincode || ''
              },
              status: w.status || 'active',
              profilePhoto: w.profilePhoto || ''
            });

            if (w.profilePhoto) {
              setPhotoPreview(w.profilePhoto);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Init error:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };
    initData();
  }, [id, isEdit]);

  // Upload file helper
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    let baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    if (!baseUrl) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        baseUrl = 'http://localhost:5000';
      } else {
        baseUrl = window.location.origin;
      }
    }
    baseUrl = baseUrl.replace(/\/api$/, '');
    const response = await fetch(`${baseUrl}/api/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Upload failed');
    return data.imageUrl;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAadharChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setAadharFile(file);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const toggleCategory = (val) => {
    setFormData(prev => {
      const serviceCategories = prev.serviceCategories.includes(val)
        ? prev.serviceCategories.filter(c => c !== val)
        : [...prev.serviceCategories, val];

      return {
        ...prev,
        serviceCategories
      };
    });
  };

  const handleAddressSave = (houseNumber, location) => {
    let city = '';
    let state = '';
    let pincode = '';
    let addressLine2 = '';

    if (location.components) {
      location.components.forEach(comp => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
        if (comp.types.includes('postal_code')) pincode = comp.long_name;
        if (comp.types.includes('sublocality')) addressLine2 = comp.long_name;
      });
    }

    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        addressLine1: houseNumber,
        addressLine2: addressLine2,
        city: city,
        state: state,
        pincode: pincode,
        fullAddress: location.address
      }
    }));
    setIsAddressModalOpen(false);
  };

  // toggleSkill removed


  const handleSubmit = async () => {
    // Zod Validation depending on mode
    const schema = isEdit ? editWorkerSchema : addWorkerSchema;

    // Construct validation object
    const validationData = {
      name: formData.name,
      phone: formData.phone,
      serviceCategories: formData.serviceCategories,
      ...(isEdit ? {} : { aadhar: { number: formData.aadhar.number } })
    };

    const validationResult = schema.safeParse(validationData);

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    // Additional manual check for Aadhar doc on 'new'
    if (!isEdit && !formData.aadhar.document && !aadharFile) {
      toast.error("Aadhar document is required");
      return;
    }

    try {
      setLoading(true);
      setUploading(true);

      let photoUrl = formData.profilePhoto;
      let aadharUrl = formData.aadhar.document;

      // Upload photo if selected
      if (photoFile) {
        try {
          photoUrl = await uploadFile(photoFile);
        } catch (err) {
          console.error('Photo upload failed:', err);
          toast.error('Failed to upload profile photo');
          setLoading(false);
          setUploading(false);
          return;
        }
      }

      // Upload Aadhar if selected
      if (aadharFile) {
        try {
          aadharUrl = await uploadFile(aadharFile);
        } catch (err) {
          console.error('Aadhar upload failed:', err);
          toast.error('Failed to upload Aadhar document');
          setLoading(false);
          setUploading(false);
          return;
        }
      }

      // Clean payload
      const payload = {
        ...formData,
        profilePhoto: photoUrl,
        aadhar: {
          ...formData.aadhar,
          document: aadharUrl || 'pending_upload' // Ensure strictly that we have something
        }
      };

      if (!payload.aadhar.document && !isEdit) {
        // Should have been caught by validation, but double check
        // If still empty and no file, maybe error?
        // For now let backend handle it or user re-try
      }

      if (isEdit) {
        await updateWorker(id, payload);
        toast.success('Worker updated');
      } else {
        await createWorker(payload);
        toast.success('Worker added');
      }
      window.dispatchEvent(new Event('vendorWorkersUpdated'));
      navigate('/vendor/workers');
    } catch (error) {
      console.error('Save error:', error);
      
      const apiMessage = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;
      let errorText = apiMessage || 'Failed to save';
      
      if (validationErrors && validationErrors.length > 0) {
        errorText = `${validationErrors[0].path || 'Field'}: ${validationErrors[0].msg}`;
      }
      
      toast.error(errorText);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleLinkWorker = async () => {
    if (!linkPhone.trim() || linkPhone.length < 10) {
      toast.error('Enter valid phone number');
      return;
    }
    try {
      setLoading(true);
      await linkWorker(linkPhone);
      toast.success('Worker linked successfully!');
      window.dispatchEvent(new Event('vendorWorkersUpdated'));
      navigate('/vendor/workers');
    } catch (error) {
      console.error('Link error:', error);
      toast.error(error.response?.data?.message || 'Failed to link worker');
    } finally {
      setLoading(false);
    }
  };

  // selectedCategoriesData and allAvailableSkills removed as they are no longer needed

  return (
    <div className="min-h-screen pb-24" style={{ background: themeColors.backgroundGradient || 'linear-gradient(to bottom, #f0f9ff, #f9fafb)' }}>
      <Header title={isEdit ? 'Edit Worker' : 'Add Worker'} />

      <main className="max-w-md mx-auto px-4 py-8">

        {/* Tabs for Add New vs Link */}
        {!isEdit && (
          <div className="flex bg-white/50 backdrop-blur-xl rounded-2xl p-1.5 mb-8 shadow-sm border border-white">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-3 rounded-xl text-[13px] font-black uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'new'
                ? 'text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)]'
                : 'text-gray-500 hover:text-gray-800'
                }`}
              style={{
                background: activeTab === 'new' ? themeColors.button : 'transparent'
              }}
            >
              <FiUserPlus className="w-4 h-4" />
              Create New
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-3 rounded-xl text-[13px] font-black uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'link'
                ? 'text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)]'
                : 'text-gray-500 hover:text-gray-800'
                }`}
              style={{
                background: activeTab === 'link' ? themeColors.button : 'transparent'
              }}
            >
              <FiLink className="w-4 h-4" />
              Link Existing
            </button>
          </div>
        )}

        {/* Link Existing Mode */}
        {activeTab === 'link' && !isEdit && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white text-center space-y-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner"
              style={{ background: `${themeColors.button}15` }}
            >
              <FiSearch className="w-8 h-8" style={{ color: themeColors.button }} />
            </div>
            <div>
              <h3 className="text-[18px] font-black text-gray-800 tracking-tight">Add Existing Worker</h3>
              <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                Enter the phone number of a registered worker to add them to your team.
              </p>
            </div>

            <div className="relative group">
              <input
                type="tel"
                value={linkPhone}
                onChange={(e) => setLinkPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-4 py-4 bg-gray-50/50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-center text-[16px] font-black tracking-widest text-gray-800"
                maxLength={10}
              />
            </div>

            <button
              onClick={handleLinkWorker}
              disabled={loading}
              className="relative w-full overflow-hidden group rounded-2xl disabled:opacity-50"
            >
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ backgroundColor: themeColors.button }}></div>
              <div className="relative flex items-center justify-center gap-2 py-4 text-white font-black text-[15px] tracking-wide shadow-[0_10px_20px_rgba(0,0,0,0.15)]">
                {loading ? 'PROCESSING...' : 'FIND & ADD WORKER'}
              </div>
            </button>
          </div>
        )}

        {/* Create / Edit Mode */}
        {(activeTab === 'new' || isEdit) && (
          <div className="space-y-6">

            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative w-[110px] h-[110px] rounded-full overflow-hidden border-[4px] border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white z-10">
                  {photoPreview || formData.profilePhoto ? (
                    <img
                      src={photoPreview || formData.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <FiUserPlus className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                </div>

                <label
                  htmlFor="worker-photo-upload"
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-transform duration-300 active:scale-95 group-hover:scale-110 z-20 border-[3px] border-white"
                  style={{ background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' }}
                >
                  <FiCamera className="w-4 h-4 text-white" />
                  <input
                    id="worker-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-4">Add Profile Photo</p>
            </div>

            {/* Basic Info */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColors.button }}></div>
                Personal Details
              </h4>

              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Full Name *"
                    className={`w-full px-5 py-4 bg-gray-50/50 rounded-2xl border-2 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 text-[15px] ${errors.name ? 'border-red-500 bg-red-50/30' : 'border-transparent'}`}
                  />
                </div>

                <div className="relative group">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Mobile Number *"
                    className={`w-full px-5 py-4 bg-gray-50/50 rounded-2xl border-2 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 text-[15px] ${errors.phone ? 'border-red-500 bg-red-50/30' : 'border-transparent'}`}
                    maxLength={10}
                  />
                </div>

                <div className="relative group">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email Address (Optional)"
                    className={`w-full px-5 py-4 bg-gray-50/50 rounded-2xl border-2 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 text-[15px] ${errors.email ? 'border-red-500 bg-red-50/30' : 'border-transparent'}`}
                  />
                </div>
              </div>
            </div>
            {/* Address Info */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColors.button }}></div>
                Location
              </h4>

              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-[14px] font-medium text-gray-700 leading-relaxed">
                  {formData.address?.fullAddress ||
                    (formData.address?.addressLine1 ? `${formData.address.addressLine1}, ${formData.address.city}` : 'No location set yet')
                  }
                </p>
              </div>

              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="w-full py-3.5 bg-blue-50/80 text-blue-600 hover:bg-blue-100/80 rounded-xl font-bold text-[13px] uppercase tracking-wide transition-colors flex items-center justify-center gap-2 border border-blue-100"
              >
                <FiMapPin className="w-4 h-4" />
                Select on Map
              </button>
            </div>

            {/* Work Profile */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColors.button }}></div>
                Work Category
              </h4>

              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full px-5 py-4 bg-gray-50/50 rounded-2xl border-2 border-transparent hover:bg-white hover:border-blue-500/20 focus:outline-none flex items-center justify-between transition-all group"
                >
                  <span className={`font-medium text-[15px] truncate ${formData.serviceCategories.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                    {formData.serviceCategories.length > 0
                      ? `${formData.serviceCategories.length} Categories Selected`
                      : 'Select Work Categories'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                    <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isCategoryOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10 bg-transparent"
                      onClick={() => setIsCategoryOpen(false)}
                    />
                    <div className="absolute z-20 w-full mt-2 bg-white/90 backdrop-blur-xl rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white max-h-64 overflow-y-auto overflow-hidden">
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <button
                            key={cat._id}
                            onClick={() => {
                              toggleCategory(cat.title);
                            }}
                            className="w-full text-left px-5 py-3.5 hover:bg-gray-50/80 font-medium text-gray-700 flex items-center justify-between transition-colors border-b border-gray-50 last:border-0"
                          >
                            <span className="text-[14px]">{cat.title}</span>
                            {formData.serviceCategories.includes(cat.title) && (
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-5 py-4 text-gray-400 text-sm font-medium">No categories found</div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Selected Categories Tags */}
              {formData.serviceCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.serviceCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-4 py-2 bg-white rounded-full text-[12px] font-bold text-gray-700 shadow-sm border border-gray-100"
                    >
                      {cat}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleCategory(cat); }}
                        className="ml-3 w-5 h-5 rounded-full bg-gray-100 text-gray-400 hover:text-white hover:bg-rose-500 flex items-center justify-center transition-colors focus:outline-none"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errors.serviceCategories && <p className="text-red-500 text-[11px] mt-1 font-semibold">Required</p>}
            </div>

            {/* Documents (Simplified) */}
            {
              !isEdit && (
                <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-5">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColors.button }}></div>
                    Identity Proof (Aadhar)
                  </h4>
                  
                  <input
                    type="text"
                    value={formData.aadhar.number}
                    onChange={(e) => handleInputChange('aadhar.number', e.target.value)}
                    placeholder="12-Digit Aadhar Number *"
                    className={`w-full px-5 py-4 bg-gray-50/50 rounded-2xl border-2 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 text-[15px] font-mono tracking-widest ${errors['aadhar.number'] ? 'border-red-500 bg-red-50/30' : 'border-transparent'}`}
                    maxLength={12}
                  />

                  {/* File Upload */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200 transition-all duration-300 group-hover:bg-blue-50"></div>
                    <input
                      id="worker-aadhar-upload"
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleAadharChange}
                    />
                    <label htmlFor="worker-aadhar-upload" className="cursor-pointer relative z-10 flex flex-col items-center justify-center py-8">
                      {aadharFile ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm border border-green-200">
                            <FiUpload className="w-5 h-5" />
                          </div>
                          <span className="text-[13px] font-bold text-green-700 truncate max-w-[200px] px-3 py-1 bg-white rounded-full shadow-sm">{aadharFile.name}</span>
                        </div>
                      ) : formData.aadhar.document && formData.aadhar.document !== 'data:image/png;base64,placeholder' ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm border border-green-200">
                            <FiUpload className="w-5 h-5" />
                          </div>
                          <p className="text-[14px] font-black text-gray-700">Document Uploaded</p>
                          <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">Update File</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <FiUpload className="w-6 h-6 text-gray-400" />
                          </div>
                          <span className="text-[14px] font-black text-gray-700">Upload Aadhar Card</span>
                          <span className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">JPG, PNG, PDF (Max 5MB)</span>
                        </>
                      )}
                    </label>
                  </div>
                  {errors['aadhar.document'] && <p className="text-red-500 text-[11px] font-bold">Document is required</p>}
                </div>
              )
            }

            {/* Submit */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="relative w-full overflow-hidden group rounded-2xl disabled:opacity-50"
              >
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ backgroundColor: themeColors.button }}></div>
                <div className="relative flex items-center justify-center gap-2 py-4.5 text-white font-black text-[15px] uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.15)]">
                  {loading ? 'SAVING...' : (isEdit ? 'UPDATE DETAILS' : 'CREATE WORKER')}
                </div>
              </button>
            </div>
          </div >
        )}
      </main >

      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={formData.address?.fullAddress || ''}
        houseNumber={formData.address?.addressLine1 || ''}
        onHouseNumberChange={(val) => handleInputChange('address.addressLine1', val)}
        onSave={handleAddressSave}
      />

      <BottomNav />
    </div >
  );
};

export default AddEditWorker;
