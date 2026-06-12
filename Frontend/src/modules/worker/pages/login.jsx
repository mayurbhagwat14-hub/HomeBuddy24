import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiPhone, FiArrowRight, FiChevronLeft, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { workerAuthService } from '../../../services/authService';
import Logo from '../../../components/common/Logo';
import LogoLoader from '../../../components/common/LogoLoader';

import { z } from "zod";

// Zod schema
const phoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
});

const WorkerLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  const phoneInputRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Auto-focus logic
  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem('workerAccessToken')) {
      navigate('/worker', { replace: true });
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

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    setIsLoading(true);
    try {
      const response = await workerAuthService.sendOTP(cleanPhone);
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
      const response = await workerAuthService.verifyLogin({
        phone: phoneNumber.replace(/\D/g, ''),
        otp: otpValue
      });

      if (response.success) {
        setIsLoading(false);

        if (response.isNewUser) {
          toast.success('Phone verified! Please complete registration.');
          navigate('/worker/signup', {
            state: { phone: phoneNumber.replace(/\D/g, ''), verificationToken: response.verificationToken }
          });
        } else {
          toast.success(
            <div className="flex flex-col">
              <span className="font-bold">Welcome Back!</span>
              <span className="text-xs">Successfully logged into your worker account.</span>
            </div>,
            { icon: <FiCheckCircle className="text-green-500" /> }
          );
          navigate('/worker', { replace: true });
        }
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Verification failed');
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
          {step === 'phone' ? 'Xpert Sign In' : 'Verify Xpert'}
        </h2>
        <p className="mt-3 text-[13px] font-bold text-gray-500 animate-stagger-1 animate-fade-in uppercase tracking-widest">
          {step === 'phone' ? 'Access your tasks and earnings' : `We've sent a 6-digit code to ${phoneNumber}`}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl py-10 px-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:rounded-[32px] sm:px-10 border border-white relative overflow-hidden animate-slide-in-bottom">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#008080]/5 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none" />

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6 relative z-10">
              <div className="animate-stagger-1 animate-fade-in">
                <label htmlFor="phone" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#008080] transition-colors z-10">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none z-10">
                    <span className="text-gray-900 font-black border-r border-gray-200 pr-3">+91</span>
                  </div>
                  <input
                    ref={phoneInputRef}
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="block w-full pl-28 pr-4 py-4 bg-white/50 border border-white rounded-[16px] focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] sm:text-sm transition-all duration-300 font-bold text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-gray-400"
                    placeholder="98765 43210"
                  />
                </div>
              </div>

              <div className="animate-stagger-2 animate-fade-in pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !phoneNumber || phoneNumber.length < 10}
                  className="group relative w-full flex justify-center py-4 px-4 border border-[#008080]/20 rounded-[16px] text-[13px] font-black uppercase tracking-widest text-white transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,128,128,0.3)] hover:shadow-[0_8px_25px_rgba(0,128,128,0.4)] hover:-translate-y-1 transform overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' }}
                >
                  <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
                  {isLoading ? 'Sending OTP...' : (
                    <span className="flex items-center relative z-10">
                      Continue to Jobs
                      <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 relative z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOtp(['', '', '', '', '', '']);
                  setOtpToken('');
                  setStep('phone');
                  setResendTimer(0);
                }}
                className="flex items-center text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#008080] transition-colors mb-4 animate-stagger-1 animate-fade-in"
              >
                <FiChevronLeft className="mr-1 w-4 h-4" /> Edit number
              </button>

              <form onSubmit={handleOtpSubmit} className="space-y-8">
                <div className="flex justify-between gap-2 sm:gap-3 animate-stagger-2 animate-fade-in">
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

                <div className="text-center animate-stagger-3 animate-fade-in">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await workerAuthService.sendOTP(phoneNumber.replace(/\D/g, ''));
                        if (response.success) {
                          setOtpToken(response.token);
                          setResendTimer(120);
                          toast.success('New code sent!');
                        }
                      } catch (e) { toast.error('Resend failed'); }
                    }}
                    disabled={resendTimer > 0}
                    className="text-[11px] font-bold uppercase tracking-widest hover:text-[#008080] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#006666]"
                  >
                    {resendTimer > 0
                      ? `Resend in ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, '0')}`
                      : 'Resend code'}
                  </button>
                </div>

                <div className="animate-stagger-4 animate-fade-in pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="group relative w-full flex justify-center py-4 px-4 border border-[#008080]/20 rounded-[16px] text-[13px] font-black uppercase tracking-widest text-white transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,128,128,0.3)] hover:shadow-[0_8px_25px_rgba(0,128,128,0.4)] hover:-translate-y-1 transform overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' }}
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
                    {isLoading ? 'Verifying...' : (
                      <span className="flex items-center relative z-10">
                        Login & View Tasks
                        <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500 animate-fade-in animate-stagger-5 relative z-10">
          Want to join the fleet?{' '}
          <Link to="/worker/signup" className="text-[#008080] hover:text-[#00A6A6] transition-colors duration-300 decoration-2 hover:underline underline-offset-4 ml-1">
            Register as Xpert
          </Link>
        </p>
      </div>
    </div>
  );
};

export default WorkerLogin;
