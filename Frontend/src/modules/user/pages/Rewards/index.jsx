import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { FiCopy, FiArrowLeft, FiGift, FiBell } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookMessenger } from 'react-icons/fa';
import { themeColors } from '../../../../theme';
import { useBranding } from '../../../../context/BrandingContext';

const Rewards = () => {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const appDomain = (branding?.appName || 'HomeBuddy24').toLowerCase().replace(/\s+/g, '') + '.com';
  const handleCopyLink = () => {
    // Copy referral link to clipboard
    const referralLink = `https://${appDomain}/refer/your-link`;
    navigator.clipboard.writeText(referralLink).then(() => {
      toast.success('Link copied to clipboard!');
    });
  };

  const handleShareWhatsApp = () => {
    const text = 'Check out this amazing electrical services app!';
    const url = `https://${appDomain}/refer/your-link`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const handleShareMessenger = () => {
    const url = `https://${appDomain}/refer/your-link`;
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=your-app-id`, '_blank');
  };
  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: themeColors.backgroundGradient || 'linear-gradient(to bottom, #f0fdfa, #ffffff)' }}
    >
      {/* Floating Glass Header */}
      <div className="sticky top-0 z-50 px-4 py-3 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center border border-teal-100">
              <FiGift className="w-4 h-4" style={{ color: '#00A6A6' }} />
            </div>
            <h1 className="text-[17px] font-black text-gray-900 tracking-wide">Refer & Earn</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/user/notifications')}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors relative"
        >
          <FiBell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Main Referral Card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white overflow-hidden">
          {/* Decorative Glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"></div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="flex-1">
              <h2 className="text-[20px] font-black text-gray-900 mb-2 leading-tight">
                Refer and get <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A6A6] to-teal-400">FREE services</span>
              </h2>
              <p className="text-[12px] font-medium text-gray-500 leading-relaxed">
                Invite your friends to try our services. They get instant <span className="font-bold text-gray-800">₹100 off</span>. You win <span className="font-bold text-gray-800">₹100</span> once they take a service.
              </p>
            </div>
            {/* Animated Gift Box */}
            <div className="relative shrink-0 mt-2">
              <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
              <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-yellow-300 rounded-2xl flex items-center justify-center transform rotate-12 shadow-[0_8px_20px_rgb(250,204,21,0.4)] animate-[bounce_3s_infinite] relative z-10 border-2 border-white/50">
                <span className="text-3xl filter drop-shadow-md">🎁</span>
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-400 rounded-full border-2 border-white animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full border-2 border-white animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>

          {/* Share Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100/50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Refer via</p>
            <div className="flex gap-4">
              <button
                onClick={handleShareWhatsApp}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-[#25D366] to-[#1DA851] rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgb(37,211,102,0.3)] transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-95 border border-white/20 relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <FaWhatsapp className="w-7 h-7 text-white drop-shadow-md relative z-10" />
                </div>
                <span className="text-[11px] font-bold text-gray-600">WhatsApp</span>
              </button>

              <button
                onClick={handleShareMessenger}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgb(0,132,255,0.3)] transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-95 border border-white/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <FaFacebookMessenger className="w-7 h-7 text-white drop-shadow-md relative z-10" />
                </div>
                <span className="text-[11px] font-bold text-gray-600">Messenger</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-[#00A6A6] to-[#00E5E5] rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgb(0,166,166,0.3)] transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-95 border border-white/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <FiCopy className="w-6 h-6 text-white drop-shadow-md relative z-10" />
                </div>
                <span className="text-[11px] font-bold text-gray-600">Copy Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* How it works Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <h3 className="text-[15px] font-black text-gray-900 tracking-wide mb-6">How it works?</h3>

          <div className="relative pl-8 space-y-8">
            {/* Vertical Gradient Line */}
            <div className="absolute left-3.5 top-2 bottom-2 w-1 bg-gradient-to-b from-[#00A6A6] via-teal-200 to-gray-100 rounded-full"></div>

            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-9 top-0 w-8 h-8 rounded-full bg-white shadow-md border-2 flex items-center justify-center text-[12px] font-black" style={{ borderColor: '#00A6A6', color: '#00A6A6' }}>
                1
              </div>
              <h4 className="text-[14px] font-bold text-gray-800 mb-1">Invite friends</h4>
              <p className="text-[12px] font-medium text-gray-500">Share your unique link and get rewarded</p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-9 top-0 w-8 h-8 rounded-full bg-white shadow-md border-2 border-teal-200 flex items-center justify-center text-[12px] font-black text-teal-500">
                2
              </div>
              <h4 className="text-[14px] font-bold text-gray-800 mb-1">They get ₹100</h4>
              <p className="text-[12px] font-medium text-gray-500">Your friends get flat ₹100 off on their first service</p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-9 top-0 w-8 h-8 rounded-full bg-white shadow-sm border-2 border-gray-100 flex items-center justify-center text-[12px] font-black text-gray-400">
                3
              </div>
              <h4 className="text-[14px] font-bold text-gray-800 mb-1">You get ₹100</h4>
              <p className="text-[12px] font-medium text-gray-500">Once their service is completed, you earn your reward</p>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="flex items-center justify-center gap-4 text-[#00A6A6] text-[12px] font-bold">
          <button className="hover:underline hover:text-teal-600 transition-colors">Terms and conditions</button>
          <span className="w-1 h-1 rounded-full bg-[#00A6A6]"></span>
          <button className="hover:underline hover:text-teal-600 transition-colors">FAQs</button>
        </div>

        {/* Scratch Cards Section - New Addition */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="text-center mb-6">
            <h2 className="text-[16px] font-black text-gray-900 mb-1">
              You are yet to earn any scratch cards
            </h2>
            <p className="text-[12px] font-medium text-gray-500">
              Start referring to get surprises
            </p>
          </div>

          {/* Referral Offer */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-100/50 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-yellow-100 relative z-10">
              <span className="text-2xl filter drop-shadow-sm">🎁</span>
            </div>
            <p className="text-[13px] text-gray-800 font-bold leading-tight relative z-10">
              Earn <span className="text-orange-500 text-[15px] font-black">₹100</span> on every successful referral
            </p>
          </div>
        </div>
      </main>


    </div>
  );
};

export default Rewards;
