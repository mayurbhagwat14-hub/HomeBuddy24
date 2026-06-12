import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiPhone, FiArrowRight, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { userAuthService } from '../../../services/authService';
import Logo from '../../../components/common/Logo';
import LogoLoader from '../../../components/common/LogoLoader';
import DebugConsole from '../components/common/DebugConsole';
import { useBranding } from '../../../context/BrandingContext';

import { z } from "zod";

// Zod schema
const phoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
});

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
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

  // Refs for focus management
  const phoneInputRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Auto-focus logic
  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem('accessToken')) {
      navigate('/user/home', { replace: true });
      return;
    }

    if (step === 'phone' && phoneInputRef.current) {
      setTimeout(() => phoneInputRef.current.focus(), 100);
    } else if (step === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0].focus(), 100);
    }
  }, [step, navigate]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    // Zod Validation
    const validationResult = phoneSchema.safeParse({ phone: phoneNumber });
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      // Clean phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const response = await userAuthService.sendOTP(cleanPhone);

      if (response.success) {
        setOtpToken(response.token);
        setIsLoading(false);
        setStep('otp');
        setResendTimer(120); // Start 2 min timer
        toast.success(
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-green-500" />
            <span>OTP sent successfully!</span>
          </div>
        );
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
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    if (value.length > 1) {
      // Handle paste of full OTP
      if (index === 0 && value.length === 6) {
        const chars = value.split('');
        setOtp(chars);
        // Focus the last input or verify button
        otpInputRefs.current[5]?.focus();
        return;
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
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
      const response = await userAuthService.verifyLogin({
        phone: phoneNumber.replace(/\D/g, ''),
        otp: otpValue
      });

      if (response.success) {
        if (response.isNewUser) {
          toast.success('Phone verified! Please complete your registration.');
          navigate('/user/signup', {
            state: {
              phone: phoneNumber,
              verificationToken: response.verificationToken
            }
          });
        } else {
          toast.success('Welcome back!');
          navigate('/user/home', { replace: true });
        }
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Verification failed');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  // Brand Colors from theme
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
        <div className="flex justify-center mb-6">
          <Logo className="h-16 w-auto transform hover:scale-110 transition-transform duration-500 drop-shadow-xl" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          {step === 'phone' ? 'Sign in to account' : 'Verify your phone'}
        </h2>
        <p className="mt-2 text-[13px] font-bold text-gray-500 animate-stagger-1 animate-fade-in uppercase tracking-widest">
          {step === 'phone'
            ? 'Enter your mobile number to get started'
            : `We've sent a code to +91 ${phoneNumber}`
          }
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:rounded-[32px] sm:px-10 border border-white relative overflow-hidden animate-slide-in-bottom">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#008080]/5 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none" />

          {step === 'phone' ? (
            <form className="space-y-6 relative z-10" onSubmit={handlePhoneSubmit}>
              <div className="animate-stagger-1 animate-fade-in">
                <label htmlFor="phone" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Mobile Number
                </label>
                <div className="relative rounded-[16px] group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#008080] transition-colors">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                    <span className="text-gray-900 font-black border-r border-gray-200 pr-3 sm:text-sm">+91</span>
                  </div>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    id="phone"
                    className="block w-full pl-28 pr-4 py-4 bg-white/50 border border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] sm:text-sm transition-all duration-300 font-bold text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-gray-400"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhoneNumber(val);
                    }}
                  />
                </div>
              </div>

              <div className="animate-stagger-2 animate-fade-in">
                <button
                  type="submit"
                  disabled={isLoading || phoneNumber.length < 10}
                  className="group relative w-full flex justify-center py-4 px-4 border border-[#008080]/20 rounded-[16px] text-[13px] font-black uppercase tracking-widest text-white transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 transform shadow-[0_4px_20px_rgba(0,128,128,0.3)] hover:shadow-[0_8px_25px_rgba(0,128,128,0.4)] overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' }}
                >
                  <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
                  {isLoading ? (
                    <LogoLoader fullScreen={false} inline={true} size="w-6 h-6" />
                  ) : (
                    <span className="flex items-center gap-2 relative z-10">
                      Get OTP <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-8 animate-stagger-3 animate-fade-in">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/60" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="px-3 bg-transparent text-gray-400 backdrop-blur-xl">New to {appName}?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to="/user/signup"
                    className="w-full inline-flex justify-center py-4 px-4 rounded-[16px] bg-white/50 text-[13px] font-black uppercase tracking-widest text-[#008080] hover:bg-white hover:text-[#006666] border border-white transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            <form className="space-y-6 relative z-10" onSubmit={handleOtpSubmit}>
              <div className="flex justify-center gap-2 sm:gap-3 py-4 animate-stagger-1 animate-fade-in">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl sm:text-3xl font-black bg-white/50 border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:-translate-y-1 text-gray-900"
                    style={{ caretColor: brandColor }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest animate-stagger-2 animate-fade-in">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setOtp(['', '', '', '', '', '']);
                    setOtpToken('');
                    setStep('phone');
                    setResendTimer(0);
                  }}
                  className="flex items-center text-gray-500 hover:text-[#008080] transition-colors"
                >
                  <FiChevronLeft className="mr-1 w-4 h-4" /> Change Number
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (isLoading || resendTimer > 0) return;
                    try {
                      setIsLoading(true);
                      const response = await userAuthService.sendOTP(phoneNumber.replace(/\D/g, ''));
                      if (response.success) {
                        setOtpToken(response.token);
                        setResendTimer(120);
                        toast.success('OTP resent!');
                      }
                    } catch (err) {
                      toast.error('Error sending OTP');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading || resendTimer > 0}
                  className="text-[#008080] hover:text-[#006666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0
                    ? `Resend in ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, '0')}`
                    : 'Resend OTP'}
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
                    <span className="flex items-center gap-2 relative z-10">
                      Verify & Continue <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 animate-fade-in animate-stagger-4 relative z-10">
        &copy; {new Date().getFullYear()} {appName}. All rights reserved.
      </div>
      <DebugConsole />
    </div>
  );
};

export default Login;
