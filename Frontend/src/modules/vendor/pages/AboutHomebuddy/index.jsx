import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiUsers, FiShield, FiClock, FiAward, FiHeart, FiGlobe, FiSmile, FiSmartphone } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Logo from '../../../../components/common/Logo';
import StyledAppName from '../../../../components/common/StyledAppName';
import { useBranding } from '../../../../context/BrandingContext';

const AboutHomeBuddy24 = () => {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const appName = branding?.appName || 'HomeBuddy24';

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  // Gradient Definition for re-use in inline styles
  const HomeBuddy24Gradient = 'linear-gradient(135deg, #347989 0%, #BB5F36 100%)';
  const HomeBuddy24TextGradient = {
    background: HomeBuddy24Gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const features = [
    {
      icon: FiUsers,
      title: 'Expert Providers',
      description: 'Verified professionals for all your needs'
    },
    {
      icon: FiShield,
      title: 'Safe & Secure',
      description: 'Your safety is our top priority'
    },
    {
      icon: FiClock,
      title: 'On-Time Service',
      description: 'Punctual delivery at your convenience'
    },
    {
      icon: FiAward,
      title: 'Quality Assured',
      description: 'Service with 100% satisfaction guarantee'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '500+', label: 'Service Partners' },
    { number: '4.8', label: 'App Rating' },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen pb-10 relative bg-[#F8FAFC] overflow-x-hidden"
    >
      {/* Premium Modern Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>

      {/* SVG Gradient Definition */}
      <svg width="0" height="0" className="absolute">
        <linearGradient id="HomeBuddy24-about-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#347989" />
          <stop offset="50%" stopColor="#D68F35" />
          <stop offset="100%" stopColor="#BB5F36" />
        </linearGradient>
      </svg>

      {/* Floating Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-gray-100 active:scale-95 transition-all"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <span className="text-[17px] font-black text-gray-900 tracking-wide">About <StyledAppName /></span>
      </header>

      <main className="px-5 py-6 space-y-8">
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center pt-4 relative z-10">
          <div className="relative inline-flex mx-auto mb-8">
            {/* Dynamic Glass Orb Behind Logo */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#347989]/30 to-[#D68F35]/30 rounded-[32px] blur-xl animate-pulse"></div>
            
            {/* White Background Logo Container (Auto-width to prevent cropping) */}
            <div className="relative bg-white/90 backdrop-blur-xl rounded-[28px] px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.1)] border-[3px] border-white/80 z-20 overflow-hidden group flex items-center justify-center min-w-[120px]">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Logo className="h-14 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-500 relative z-10" />
            </div>
          </div>

          <h1 className="text-[28px] font-black text-gray-900 mb-3 tracking-tight">
            Welcome to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#347989] to-teal-500 drop-shadow-sm"><StyledAppName /></span>
          </h1>
          <p className="text-[13px] font-medium text-gray-500 max-w-[280px] mx-auto leading-relaxed">
            Your trusted partner for premium home and personal care services.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex justify-between divide-x divide-gray-100/50">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex-1 text-center px-1">
                <div className="text-[22px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#347989] to-teal-500 tracking-tight drop-shadow-sm">
                  {stat.number}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1.5 px-2 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div variants={itemVariants} className="relative z-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <FiGlobe className="w-48 h-48 -mr-10 -mt-10" />
            </div>
            {/* Decorative Orbs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl"></div>
            
            <h3 className="text-[18px] font-black text-gray-900 mb-4 tracking-tight">Our Mission</h3>
            <p className="text-[13px] font-medium text-gray-600 leading-loose relative z-10">
              <span className="font-bold text-gray-900">{appName}</span> is dedicated to revolutionizing how you experience home services. We connect you with top-tier professionals to deliver safe, reliable, and high-quality services right at your doorstep. We believe in making life simpler, one service at a time.
            </p>
          </div>
        </motion.div>

        {/* Why Choose Us Grid */}
        <motion.div variants={itemVariants} className="relative z-10">
          <h3 className="text-[16px] font-black text-gray-900 mb-5 px-1 tracking-tight">Why Choose {appName}?</h3>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,128,128,0.1)] transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/0 group-hover:from-teal-500/5 group-hover:to-orange-500/5 transition-all duration-500 pointer-events-none"></div>
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-gray-100"
                  style={{ background: 'linear-gradient(135deg, rgba(52, 121, 137, 0.1), rgba(187, 95, 54, 0.1))' }}>
                  <feature.icon className="w-5 h-5 text-[#347989]" />
                </div>
                <h4 className="text-[14px] font-black text-gray-900 mb-1.5 leading-tight">{feature.title}</h4>
                <p className="text-[11px] font-medium text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div variants={itemVariants} className="relative z-10">
          <h3 className="text-[16px] font-black text-gray-900 mb-5 px-1 tracking-tight">How We Work</h3>
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative">
            {/* Vertical Line */}
            <div className="absolute left-[44px] top-[40px] bottom-[40px] w-0.5 bg-gradient-to-b from-[#347989] to-gray-100"></div>

            <div className="space-y-6">
              {[
                { title: 'Book Details', desc: 'Select service & schedule time', icon: FiSmartphone },
                { title: 'Get Matched', desc: 'We assign a top-rated pro', icon: FiUsers },
                { title: 'Relax', desc: 'Enjoy high-quality service', icon: FiSmile },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-5 relative z-10 group">
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm border-2 border-white relative overflow-hidden group-hover:scale-110 transition-transform duration-300 bg-white">
                    <div className={`absolute inset-0 ${i === 0 ? 'bg-gradient-to-br from-[#347989] to-[#00A6A6] opacity-10' : 'bg-gray-50'}`} />
                    <step.icon className={`w-5 h-5 relative z-10 ${i === 0 ? 'text-[#347989]' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-black text-gray-900 mb-1 leading-tight group-hover:text-[#347989] transition-colors">{step.title}</h4>
                    <p className="text-[11px] font-medium text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div variants={itemVariants} className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-1">Designed & Developed by</p>
          <span className="text-sm font-bold tracking-wide"><StyledAppName /> Team</span>
          <p className="text-[10px] text-gray-300 mt-4">v7.6.27 • Made with ❤️ in India</p>
        </motion.div>
      </main>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default AboutHomeBuddy24;
