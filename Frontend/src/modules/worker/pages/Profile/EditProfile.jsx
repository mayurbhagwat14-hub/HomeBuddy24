import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSave, FiUser, FiPhone, FiMail,
  FiMapPin, FiBriefcase, FiCamera, FiCheck,
  FiChevronDown, FiX
} from 'react-icons/fi';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import workerService from '../../../../services/workerService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';
import AddressSelectionModal from '../../../user/pages/Checkout/components/AddressSelectionModal';
import { z } from "zod";

// Zod schema
import flutterBridge from '../../../../utils/flutterBridge';

const workerProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(), // Read-only but good to have in schema
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  serviceCategories: z.array(z.string()).min(1, "Select at least one category"),
  address: z.object({
    addressLine1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    fullAddress: z.string().optional()
  }).refine((data) => {
    return (data.fullAddress && data.fullAddress.length > 5) || (data.addressLine1 && data.addressLine1.length > 0);
  }, { message: "Address is required" })
});

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      addressLine1: '',
      city: '',
      state: '',
      pincode: '',
    },
    serviceCategories: [],
    profilePhoto: null,
    status: 'OFFLINE'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const handleNativeCamera = async () => {
    const file = await flutterBridge.openCamera();
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      flutterBridge.hapticFeedback('success');
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [profileRes, catalogRes] = await Promise.all([
          workerService.getProfile(),
          publicCatalogService.getCategories()
        ]);

        if (profileRes.success) {
          const w = profileRes.worker;
          setFormData({
            name: w.name || '',
            phone: w.phone || '',
            email: w.email || '',
            address: {
              addressLine1: w.address?.addressLine1 || '',
              city: w.address?.city || '',
              state: w.address?.state || '',
              pincode: w.address?.pincode || '',
            },
            serviceCategories: w.serviceCategories || (w.serviceCategory ? [w.serviceCategory] : []),
            profilePhoto: w.profilePhoto || null,
            status: w.status || 'OFFLINE'
          });
        }

        if (catalogRes.success) {
          setCategories(catalogRes.categories || []);
        }
      } catch (error) {
        console.error('Init error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

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
  };

  const handleCategoryChange = (val) => {
    setFormData(prev => {
      const current = prev.serviceCategories || [];
      const updated = current.includes(val)
        ? current.filter(c => c !== val)
        : [...current, val];

      return {
        ...prev,
        serviceCategories: updated
      };
    });
  };


  const handleAddressSave = (houseNumber, location) => {
    // Extract components from Google Maps location
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
        addressLine1: houseNumber || prev.address.addressLine1,
        addressLine2: addressLine2,
        city: city || prev.address.city,
        state: state || prev.address.state,
        pincode: pincode || prev.address.pincode,
        fullAddress: location.address // Store the full formatted address string
      }
    }));
    setIsAddressModalOpen(false);
  };

  const handleSubmit = async () => {
    // Zod Validation
    const validationResult = workerProfileSchema.safeParse({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      serviceCategories: formData.serviceCategories,
      address: formData.address
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        serviceCategories: formData.serviceCategories,
        serviceCategory: formData.serviceCategories[0], // Fallback
        address: formData.address,
        status: formData.status
      };

      if (photoFile) {
        try {
          const photoUrl = await uploadFile(photoFile);
          payload.profilePhoto = photoUrl;
        } catch (uploadErr) {
          console.error('Photo upload failed', uploadErr);
          toast.error('Failed to upload photo');
          setSaving(false);
          return;
        }
      }

      await workerService.updateProfile(payload);
      toast.success('Profile updated successfully');

      // Update local storage to keep session in sync if needed
      const currentWorker = JSON.parse(localStorage.getItem('workerData') || '{}');
      localStorage.setItem('workerData', JSON.stringify({
        ...currentWorker,
        ...payload,
        profilePhoto: payload.profilePhoto || currentWorker.profilePhoto
      }));

      navigate('/worker/profile');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-gray-50 pb-24">
      <Header title="Edit Profile" />

      <main className="max-w-md mx-auto px-4 py-8 space-y-8">

        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div 
              className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-full opacity-70 group-hover:opacity-100 blur-sm transition-opacity duration-300"
            ></div>
            <div
              className="relative w-[104px] h-[104px] rounded-full bg-white border-[3px] border-white shadow-xl overflow-hidden flex items-center justify-center cursor-pointer transform transition-transform duration-300 group-hover:scale-[1.02]"
              onClick={() => flutterBridge.isFlutter ? handleNativeCamera() : document.getElementById('photo-upload').click()}
            >
              {photoPreview || formData.profilePhoto ? (
                <img src={photoPreview || formData.profilePhoto} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-full h-full flex items-center justify-center">
                  <FiUser className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
            {/* Camera Icon */}
            <div
              className="absolute bottom-0 -right-1 p-2.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full text-white ring-4 ring-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
              onClick={() => flutterBridge.isFlutter ? handleNativeCamera() : document.getElementById('photo-upload').click()}
            >
              <FiCamera className="w-4 h-4" />
            </div>
            {!flutterBridge.isFlutter && (
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            )}
          </div>
          <p className="text-[13px] text-gray-500 mt-4 font-semibold tracking-wide">Tap to change photo</p>
        </div>

        {/* Availability Status */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-teal-400"></div>
          
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <FiCheck className="text-blue-600 w-4 h-4" />
              </div>
              <h2 className="text-[15px] font-black text-gray-800 tracking-wide">Availability</h2>
            </div>
            <div className={`w-2 h-2 rounded-full animate-pulse ${formData.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
          </div>

          <div className="relative flex p-1 bg-gray-100/80 rounded-2xl">
            {/* Sliding Indicator */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${formData.status === 'ONLINE' ? 'left-1' : 'left-[calc(50%+3px)]'}`}
            ></div>
            
            <button
              onClick={() => handleInputChange('status', 'ONLINE')}
              className={`relative z-10 flex-1 py-3 text-sm font-bold transition-colors duration-300 ${formData.status === 'ONLINE' ? 'text-green-600' : 'text-gray-500'}`}
            >
              Online
            </button>
            <button
              onClick={() => handleInputChange('status', 'OFFLINE')}
              className={`relative z-10 flex-1 py-3 text-sm font-bold transition-colors duration-300 ${formData.status === 'OFFLINE' ? 'text-red-600' : 'text-gray-500'}`}
            >
              Offline
            </button>
          </div>
          <p className="text-[11px] text-gray-400 font-medium text-center">
            Set your status to receive new job assignments.
          </p>
        </div>

        {/* Personal Details */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <FiUser className="text-blue-600 w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-black text-gray-800 tracking-wide">Personal Details</h2>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <FiUser className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full pl-11 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white border rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold text-gray-700 ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
                placeholder="Full Name"
              />
              {errors.name && <p className="text-red-500 text-[10px] mt-1.5 ml-2 font-medium">{errors.name}</p>}
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <FiMail className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-sm font-semibold text-gray-700"
                placeholder="Email Address"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <FiPhone className="text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.phone}
                readOnly
                className="w-full pl-11 pr-24 py-3.5 bg-gray-100/50 border border-gray-200 rounded-2xl text-gray-500 text-sm font-semibold cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black tracking-wider rounded-lg border border-green-100">
                VERIFIED
              </div>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-4 relative overflow-hidden group cursor-pointer" onClick={() => setIsAddressModalOpen(true)}>
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <FiMapPin className="text-blue-600 w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-black text-gray-800 tracking-wide">Address Details</h2>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all">
              <p className="text-[13px] font-semibold text-gray-700 leading-relaxed">
                {formData.address?.fullAddress ||
                  `${formData.address?.addressLine1 || ''} ${formData.address?.city || ''} ${formData.address?.state || ''} ${formData.address?.pincode || ''}`
                }
              </p>
              {!formData.address?.fullAddress && !formData.address?.addressLine1 && (
                <p className="text-xs text-gray-400 italic">Tap to set your location</p>
              )}
            </div>

            <div className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
              <FiMapPin className="w-4 h-4" />
              Update Location
            </div>
          </div>
        </div>

        {/* Work Category */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <FiBriefcase className="text-blue-600 w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-black text-gray-800 tracking-wide">Work Profile</h2>
          </div>

          <div>
            <div className="relative">
              <div
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-full px-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${isCategoryOpen ? 'border-blue-400 ring-4 ring-blue-500/10' : 'border-gray-200'}`}
              >
                <div className="flex flex-wrap gap-2">
                  {formData.serviceCategories && formData.serviceCategories.length > 0 ? (
                    formData.serviceCategories.map((cat, idx) => (
                      <span key={idx} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[11px] font-bold shadow-sm">
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm font-semibold">Select Categories</span>
                  )}
                </div>
                <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-blue-500' : ''}`} />
              </div>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 z-50 max-h-60 overflow-y-auto overflow-x-hidden hide-scrollbar">
                  {categories.map((cat, index) => {
                    const isSelected = formData.serviceCategories.includes(cat.title);
                    return (
                      <div
                        key={cat._id || index}
                        onClick={() => handleCategoryChange(cat.title)}
                        className={`px-5 py-3.5 cursor-pointer border-b border-gray-50 last:border-0 font-semibold text-sm flex justify-between items-center transition-colors ${isSelected ? 'bg-blue-50/50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        <span>{cat.title}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                            <FiCheck className="text-white w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {errors.serviceCategories && <p className="text-red-500 text-[10px] mt-1.5 ml-2 font-medium">{errors.serviceCategories}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col gap-4">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="relative w-full overflow-hidden group rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 transition-transform duration-500 group-hover:scale-105"></div>
            <div className="relative flex items-center justify-center gap-2 py-4 text-white font-black text-[15px] tracking-wide shadow-[0_10px_20px_rgba(37,99,235,0.2)]">
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  SAVING...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  SAVE PROFILE
                </>
              )}
            </div>
          </button>

          <button
            onClick={() => navigate('/worker/profile')}
            className="w-full py-3.5 bg-transparent text-gray-500 font-bold text-[13px] tracking-wider active:scale-95 transition-all hover:text-gray-800"
          >
            CANCEL
          </button>
        </div>

      </main>



      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={formData.address?.fullAddress || ''} // Passing for initial view if supported later
        houseNumber={formData.address?.addressLine1 || ''}
        onHouseNumberChange={(val) => handleInputChange('address.addressLine1', val)}
        onSave={handleAddressSave}
      />

      <BottomNav />
    </div >
  );
};

export default EditProfile;
