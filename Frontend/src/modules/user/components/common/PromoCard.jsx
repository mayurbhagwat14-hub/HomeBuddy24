import React, { memo } from 'react';
<<<<<<< HEAD
=======
import { themeColors } from '../../../../theme';
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
import OptimizedImage from '../../../../components/common/OptimizedImage';
import OptimizedVideo from '../../../../components/common/OptimizedVideo';

const PromoCard = memo(({ title, subtitle, buttonText, image, onClick, className = '' }) => {
  const isVideo = image && (
    image.includes('video/upload') ||
    image.match(/\.(mp4|webm|ogg|mov)$|^https:\/\/res\.cloudinary\.com.*\/video\//i)
  );

  return (
    <div
<<<<<<< HEAD
      className={`relative rounded-[20px] overflow-hidden w-[85vw] sm:w-[320px] md:w-[380px] aspect-[1.8/1] cursor-pointer transition-all duration-300 active:scale-[0.98] flex-shrink-0 group ${className}`}
      onClick={onClick}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />
      
      {/* Background Image/Video */}
=======
      className={`relative rounded-[24px] overflow-hidden w-[88vw] sm:w-[360px] md:w-[420px] aspect-[16/9] sm:aspect-[2/1] cursor-pointer transition-all duration-500 hover:shadow-[0_15px_40px_rgba(0,128,128,0.2)] hover:-translate-y-1 active:scale-95 border border-teal-50 flex-shrink-0 ${className}`}
      style={{
        boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClick}
    >
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
      {image ? (
        isVideo ? (
          <OptimizedVideo
            src={image}
<<<<<<< HEAD
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
=======
            className="w-full h-full object-cover"
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <OptimizedImage
            src={image}
            alt={title || 'Promo'}
<<<<<<< HEAD
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )
      ) : (
        <div className="w-full h-full bg-slate-200" />
      )}

      {/* Content overlay */}
      <div className="absolute inset-y-0 left-0 p-5 z-20 flex flex-col justify-center max-w-[70%]">
        <div className="bg-white/90 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase w-max mb-2 tracking-wide">
          Limited Offer
        </div>
        
        <h3 className="text-white text-[15px] font-bold mb-0.5 leading-tight">
          {title || 'Get Special Offer'}
        </h3>
        
        <div className="text-white font-medium text-[13px] mb-2 flex items-baseline gap-1">
          <span className="opacity-90">Up to</span>
          <span className="text-[28px] font-black">40%</span>
        </div>
        
        <p className="text-white/70 text-[10px] mb-3 line-clamp-1">
          {subtitle || 'On all home services today'}
        </p>

        <button className="bg-[#F7C948] hover:bg-[#f5b82e] text-gray-900 text-[12px] font-black px-5 py-2 rounded-full w-max transition-colors">
          {buttonText || 'Claim'}
        </button>
      </div>
=======
            className="w-full h-full object-cover"
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <span className="text-gray-400 text-sm">Image</span>
        </div>
      )}
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
    </div>
  );
});

PromoCard.displayName = 'PromoCard';

export default PromoCard;
