import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiArrowRight, FiChevronLeft, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { userAuthService } from '../../../services/authService';
import Logo from '../../../components/common/Logo';
import LogoLoader from '../../../components/common/LogoLoader';
import { useBranding } from '../../../context/BrandingContext';

import { z } from "zod";

// Zod schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name can only contain letters"),
  email: z.string().optional().refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Invalid email address"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
});

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { branding } = useBranding();
  const appName = branding?.appName || 'HomeBuddy24';

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

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();

    // Zod Validation
    const validationResult = signupSchema.safeParse(formData);

    if (!validationResult.success) {
      validationResult.error.issues.forEach(err => toast.error(err.message));
      return;
    }

    setIsLoading(true);

    if (verificationToken) {
      try {
        const response = await userAuthService.register({
          name: formData.name,
          email: formData.email || null,
          verificationToken
        });
        if (response.success) {
          try {
            const { registerFCMToken } = await import('../../../services/pushNotificationService');
            await registerFCMToken('user', true);
          } catch (e) { console.error(e); }

          toast.success(
            <div className="flex flex-col">
              <span className="font-bold">Welcome to {appName}!</span>
              <span className="text-xs">Your account has been created successfully.</span>
            </div>,
            { icon: <FiCheckCircle className="text-green-500" /> }
          );
          navigate('/user/home');
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
      const response = await userAuthService.sendOTP(formData.phoneNumber, formData.email || null);
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
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
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
      const response = await userAuthService.register({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phoneNumber,
        otp: otpValue,
        token: otpToken
      });
      if (response.success) {
        setIsLoading(false);
        try {
          const { registerFCMToken } = await import('../../../services/pushNotificationService');
          await registerFCMToken('user', true);
        } catch (fcmError) {
          console.error('FCM Registration failed on signup:', fcmError);
        }

        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">Welcome to {appName}!</span>
            <span className="text-xs">Account created successfully.</span>
          </div>,
          { icon: <FiCheckCircle className="text-green-500" /> }
        );
        navigate('/user/home');
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const brandColor = themeColors.brand?.teal || '#347989';

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col justify-start sm:justify-center py-12 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Premium Modern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10 animate-fade-in">
        <Logo className="h-16 w-auto transform hover:scale-110 transition-transform duration-500 mx-auto drop-shadow-xl" />
        <h2 className="mt-4 text-3xl font-black text-gray-900 tracking-tight">
          {step === 'details' ? 'Create Account' : 'Verify Phone'}
        </h2>
        <p className="mt-2 text-[13px] font-bold text-gray-500 animate-stagger-1 animate-fade-in uppercase tracking-widest">
          {step === 'details' ? `Join ${appName} to start booking services` : `We've sent a 6-digit code to ${formData.phoneNumber}`}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:rounded-[32px] sm:px-10 border border-white relative overflow-hidden animate-slide-in-bottom">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#008080]/5 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none" />

          {step === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-6 relative z-10">
              {verificationToken && (
                <button
                  type="button"
                  onClick={() => navigate('/user/login')}
                  className="flex items-center text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#008080] transition-colors mb-4 animate-fade-in"
                >
                  <FiChevronLeft className="mr-1 w-4 h-4" /> Back to Login
                </button>
              )}

              <div className="animate-stagger-1 animate-fade-in">
                <label htmlFor="name" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <div className="relative rounded-[16px] group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#008080] transition-colors">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={nameInputRef}
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] sm:text-sm transition-all duration-300 font-bold text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-gray-400"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="animate-stagger-2 animate-fade-in">
                <label htmlFor="email" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                  Email <span className="text-gray-400/70 text-[9px] ml-2 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
                </label>
                <div className="relative rounded-[16px] group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#008080] transition-colors">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] sm:text-sm transition-all duration-300 font-bold text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-gray-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {!verificationToken && (
                <div className="animate-stagger-3 animate-fade-in">
                  <label htmlFor="phoneNumber" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Phone Number
                  </label>
                  <div className="relative rounded-[16px] group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#008080] transition-colors">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                      <span className="text-gray-900 font-black border-r border-gray-200 pr-3 sm:text-sm">+91</span>
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      className="block w-full pl-28 pr-4 py-4 bg-white/50 border border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] sm:text-sm transition-all duration-300 font-bold text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-gray-400"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>
              )}

              <div className="animate-stagger-4 animate-fade-in pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-[#008080]/20 rounded-[16px] text-[13px] font-black uppercase tracking-widest text-white transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,128,128,0.3)] hover:shadow-[0_8px_25px_rgba(0,128,128,0.4)] hover:-translate-y-1 transform overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' }}
                >
                  <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
                  {isLoading ? (
                    <LogoLoader fullScreen={false} inline={true} size="w-6 h-6" />
                  ) : (
                    <span className="flex items-center relative z-10">
                      {verificationToken ? 'Complete Registration' : 'Send OTP'}
                      <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 relative z-10">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex items-center text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#008080] transition-colors mb-4 animate-fade-in"
              >
                <FiChevronLeft className="mr-1 w-4 h-4" /> Edit details
              </button>

              <form onSubmit={handleOtpSubmit} className="space-y-8">
                <div className="flex justify-between gap-2 sm:gap-4 animate-stagger-1 animate-fade-in">
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
                        const response = await userAuthService.sendOTP(formData.phoneNumber, formData.email || null);
                        if (response.success) {
                          setOtpToken(response.token);
                          setResendTimer(120);
                          toast.success('New code sent!');
                        }
                      } catch (error) {
                        toast.error('Failed to resend code');
                      }
                    }}
                    disabled={resendTimer > 0}
                    className="text-[11px] font-bold uppercase tracking-widest hover:text-[#008080] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#006666]"
                  >
                    {resendTimer > 0
                      ? `Resend in ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, '0')}`
                      : 'Resend code'}
                  </button>
                </div>

                <div className="animate-stagger-3 animate-fade-in">
                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="group relative w-full flex justify-center py-4 px-4 border border-[#008080]/20 rounded-[16px] text-[13px] font-black uppercase tracking-widest text-white transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,128,128,0.3)] hover:shadow-[0_8px_25px_rgba(0,128,128,0.4)] hover:-translate-y-1 transform overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' }}
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
                    {isLoading ? (
                      <LogoLoader fullScreen={false} inline={true} size="w-6 h-6" />
                    ) : (
                      <span className="flex items-center relative z-10">
                        Create Account
                        <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500 animate-fade-in animate-stagger-5 relative z-10">
          Already have an account?{' '}
          <Link to="/user/login" className="text-[#008080] hover:text-[#006666] transition-colors duration-300 ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
