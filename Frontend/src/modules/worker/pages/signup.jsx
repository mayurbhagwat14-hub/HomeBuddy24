import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiFileText, FiUpload, FiCamera, FiX, FiArrowRight, FiChevronLeft, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { workerAuthService } from '../../../services/authService';
import Logo from '../../../components/common/Logo';
import { useBranding } from '../../../context/BrandingContext';

import { z } from "zod";

// Zod schema for Worker Signup
const workerSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name can only contain letters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  aadhar: z.string().regex(/^\d{12}$/, "Aadhar number must be exactly 12 digits"),
});

const WorkerSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { branding } = useBranding();
  const appName = branding?.appName || 'HomeBuddy24';
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    aadhar: '',
    aadharDocument: null,
    aadharBackDocument: null
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documentPreview, setDocumentPreview] = useState({});
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Refs for auto-focus
  const nameInputRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Pre-fill from navigation state (Unified Flow)
  useEffect(() => {
    if (location.state?.phone && location.state?.verificationToken) {
      setFormData(prev => ({ ...prev, phoneNumber: location.state.phone }));
      setVerificationToken(location.state.verificationToken);
    }
  }, [location.state]);

  // Clear any existing worker tokens on page load
  useEffect(() => {
    localStorage.removeItem('workerAccessToken');
    localStorage.removeItem('workerRefreshToken');
    localStorage.removeItem('workerData');
  }, []);

  // Auto-focus logic
  useEffect(() => {
    if (step === 'details' && nameInputRef.current) {
      setTimeout(() => nameInputRef.current.focus(), 100);
    } else if (step === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0].focus(), 100);
    }
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image or PDF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const fieldName = type === 'aadhar' ? 'aadharDocument' : 'aadharBackDocument';
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
      setDocumentPreview(prev => ({
        ...prev,
        [type]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (type) => {
    const fieldName = type === 'aadhar' ? 'aadharDocument' : 'aadharBackDocument';
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setDocumentPreview(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();

    // Zod Validation
    const validationResult = workerSignupSchema.safeParse({
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      aadhar: formData.aadhar
    });

    if (!validationResult.success) {
      validationResult.error.issues.forEach(err => toast.error(err.message));
      return;
    }

    // Manual Document Check
    if (!formData.aadharDocument && !documentPreview.aadhar) {
      toast.error('Please upload Aadhar Front document');
      return;
    }
    if (!formData.aadharBackDocument && !documentPreview.aadharBack) {
      toast.error('Please upload Aadhar Back document');
      return;
    }
    e.preventDefault();

    setIsLoading(true);

    if (verificationToken) {
      try {
        const aadharDoc = documentPreview.aadhar || null;
        const aadharBackDoc = documentPreview.aadharBack || null; // Add this
        const registerData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phoneNumber,
          aadhar: formData.aadhar,
          aadharDocument: aadharDoc,
          aadharBackDocument: aadharBackDoc,
          verificationToken
        };

        const response = await workerAuthService.register(registerData);
        if (response.success) {
          localStorage.setItem('workerData', JSON.stringify(response.worker));
          toast.success(
            <div className="flex flex-col">
              <span className="font-bold">Welcome Onboard!</span>
              <span className="text-xs">Your worker account has been created.</span>
            </div>,
            { icon: <FiCheckCircle className="text-green-500" /> }
          );
          navigate('/worker');
        } else {
          toast.error(response.message || 'Registration failed');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const response = await workerAuthService.sendOTP(formData.phoneNumber, formData.email);
      if (response.success) {
        setOtpToken(response.token);
        setIsLoading(false);
        setStep('otp');
        setResendTimer(120); // Start timer
        toast.success('OTP sent successfully');
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    if (cleanValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-verify as last digit enters
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === 6 && !isLoading && otpToken) {
      handleOtpSubmit();
    }
  }, [otp]);

  const handleOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    if (!otpToken) {
      toast.error('Please request OTP first');
      return;
    }
    setIsLoading(true);
    try {
      const aadharDoc = documentPreview.aadhar || null;
      const aadharBackDoc = documentPreview.aadharBack || null;
      const registerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phoneNumber,
        aadhar: formData.aadhar,
        aadharDocument: aadharDoc,
        aadharBackDocument: aadharBackDoc,
        otp: otpValue,
        token: otpToken
      };

      const response = await workerAuthService.register(registerData);
      if (response.success) {
        localStorage.setItem('workerData', JSON.stringify(response.worker));
        setIsLoading(false);
        toast.success(`Registration successful! Welcome to ${appName}.`);
        navigate('/worker');
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const brandColor = themeColors.brand?.teal || '#347989';

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col justify-start sm:justify-center py-12 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#00A6A6]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10 animate-fade-in">
        <div className="inline-block p-4 rounded-[24px] bg-white/50 backdrop-blur-xl shadow-sm border border-white/60 mb-4 transform hover:scale-105 transition-transform duration-500">
          <Logo className="h-16 w-auto mx-auto" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
          {step === 'details' ? 'Xpert Registration' : 'Confirm Phone'}
        </h2>
        <p className="mt-3 text-[13px] font-bold text-gray-500 animate-stagger-1 animate-fade-in uppercase tracking-widest">
          Join the pros. Set your schedule, earn more.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl py-10 px-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:rounded-[32px] sm:px-10 border border-white relative overflow-hidden animate-slide-in-bottom">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#008080]/5 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none" />

          {step === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-6 relative z-10">
              <div className="animate-stagger-1 animate-fade-in">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#008080] transition-colors z-10">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    ref={nameInputRef}
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] sm:text-sm transition-all duration-300 font-bold text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-gray-400"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="animate-stagger-2 animate-fade-in">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#008080] transition-colors z-10">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] sm:text-sm transition-all duration-300 font-bold text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-gray-400"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {!verificationToken && (
                <div className="animate-stagger-3 animate-fade-in">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 border-r border-gray-200 pr-3 flex items-center pointer-events-none z-10">
                      <span className="text-gray-900 font-black">+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(p => ({ ...p, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      className="block w-full pl-[4.5rem] pr-4 py-4 bg-white/50 border border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] sm:text-sm transition-all duration-300 font-bold text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-gray-400"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>
              )}

              <div className="animate-stagger-4 animate-fade-in">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Aadhar Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#008080] transition-colors z-10">
                    <FiFileText className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.aadhar}
                    onChange={(e) => setFormData(p => ({ ...p, aadhar: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                    className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] sm:text-sm transition-all duration-300 font-bold text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-gray-400"
                    placeholder="12-digit Aadhar"
                  />
                </div>
              </div>

              {/* Aadhar Upload */}
              {/* Aadhar Front Upload */}
              <div className="animate-stagger-5 animate-fade-in">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Aadhar Front</label>
                {documentPreview.aadhar ? (
                  <div className="relative group overflow-hidden rounded-[16px]">
                    <img src={documentPreview.aadhar} className="w-full h-32 object-cover border transform group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeDocument('aadhar')} className="bg-red-500 text-white rounded-full p-2 shadow-xl hover:bg-red-600 transition-colors">
                        <FiX size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[16px] hover:bg-gray-50 transition-all duration-300 hover:border-[#008080] group bg-white/50">
                    <label className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
                      <div className="p-3 bg-[#008080]/10 text-[#008080] rounded-full mb-2 hover:bg-[#008080]/20 transition-colors">
                        <FiUpload className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Upload Front</span>
                      <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleDocumentUpload(e, 'aadhar')} />
                    </label>
                  </div>
                )}
              </div>

              {/* Aadhar Back Upload */}
              <div className="animate-stagger-[5.5] animate-fade-in mt-4">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Aadhar Back</label>
                {documentPreview.aadharBack ? (
                  <div className="relative group overflow-hidden rounded-[16px]">
                    <img src={documentPreview.aadharBack} className="w-full h-32 object-cover border transform group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeDocument('aadharBack')} className="bg-red-500 text-white rounded-full p-2 shadow-xl hover:bg-red-600 transition-colors">
                        <FiX size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[16px] hover:bg-gray-50 transition-all duration-300 hover:border-[#008080] group bg-white/50">
                    <label className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
                      <div className="p-3 bg-[#008080]/10 text-[#008080] rounded-full mb-2 hover:bg-[#008080]/20 transition-colors">
                        <FiUpload className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Upload Back</span>
                      <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleDocumentUpload(e, 'aadharBack')} />
                    </label>
                  </div>
                )}
              </div>

              <div className="animate-stagger-[6] animate-fade-in pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-[#008080]/20 rounded-[16px] text-[13px] font-black uppercase tracking-widest text-white transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,128,128,0.3)] hover:shadow-[0_8px_25px_rgba(0,128,128,0.4)] hover:-translate-y-1 transform overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' }}
                >
                  <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
                  {isLoading ? 'Processing...' : (
                    <span className="flex items-center relative z-10">
                      {verificationToken ? 'Finish Registration' : 'Verify & Join'}
                      <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 relative z-10">
              <button
                onClick={() => setStep('details')}
                className="flex items-center text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#008080] transition-colors mb-4 animate-fade-in"
              >
                <FiChevronLeft className="mr-1 w-4 h-4" /> Edit details
              </button>

              <div className="text-center animate-fade-in">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Enter OTP</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-2">Waiting for 6-digit code...</p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-8">
                <div className="flex justify-between gap-2 sm:gap-3 animate-stagger-1 animate-fade-in">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 sm:h-16 text-center text-2xl sm:text-3xl font-black bg-white/50 border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:-translate-y-1 text-gray-900"
                      style={{ caretColor: brandColor, backgroundColor: digit ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)' }}
                    />
                  ))}
                </div>

                <div className="text-center animate-stagger-2 animate-fade-in">
                  <button
                    type="button"
                    onClick={async () => {
                      if (resendTimer > 0) return;
                      try {
                        const response = await workerAuthService.sendOTP(formData.phoneNumber, formData.email);
                        if (response.success) {
                          setOtpToken(response.token);
                          setResendTimer(120);
                          toast.success('OTP sent again');
                        }
                      } catch (e) { toast.error('Resend failed'); }
                    }}
                    disabled={resendTimer > 0}
                    className="text-[11px] font-bold uppercase tracking-widest hover:text-[#008080] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#006666]"
                  >
                    {resendTimer > 0
                      ? `Resend in ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, '0')}`
                      : 'Resend Code'}
                  </button>
                </div>

                <div className="animate-stagger-3 animate-fade-in pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="group relative w-full flex justify-center py-4 px-4 border border-[#008080]/20 rounded-[16px] text-[13px] font-black uppercase tracking-widest text-white transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,128,128,0.3)] hover:shadow-[0_8px_25px_rgba(0,128,128,0.4)] hover:-translate-y-1 transform overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' }}
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
                    <span className="relative z-10 flex items-center justify-center">
                      {isLoading ? 'Verifying...' : 'Complete Sign Up'}
                      <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500 animate-fade-in animate-stagger-4 relative z-10">
          Already an Xpert?{' '}
          <Link to="/worker/login" className="text-[#008080] hover:text-[#00A6A6] transition-colors duration-300 decoration-2 hover:underline underline-offset-4 ml-1">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default WorkerSignup;
