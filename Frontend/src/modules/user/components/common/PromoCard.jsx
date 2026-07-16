import React, { memo } from 'react';
import OptimizedImage from '../../../../components/common/OptimizedImage';
import OptimizedVideo from '../../../../components/common/OptimizedVideo';

const PromoCard = memo(({ title, subtitle, buttonText, image, onClick, className = '' }) => {
  const isVideo = image && (
    image.includes('video/upload') ||
    image.match(/\.(mp4|webm|ogg|mov)$|^https:\/\/res\.cloudinary\.com.*\/video\//i)
  );

  return (
    <div
      className={`relative rounded-[20px] overflow-hidden w-[85vw] sm:w-[320px] md:w-[380px] aspect-[1.8/1] cursor-pointer transition-all duration-300 active:scale-[0.98] flex-shrink-0 group ${className}`}
      onClick={onClick}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />
      
      {/* Background Image/Video */}
      {image ? (
        isVideo ? (
          <OptimizedVideo
            src={image}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <OptimizedImage
            src={image}
            alt={title || 'Promo'}
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
        

        
        <p className="text-white/70 text-[10px] mb-3 line-clamp-1">
          {subtitle || 'On all home services today'}
        </p>

        <button className="bg-[#F7C948] hover:bg-[#f5b82e] text-gray-900 text-[12px] font-black px-5 py-2 rounded-full w-max transition-colors">
          {buttonText || 'Claim'}
        </button>
      </div>
    </div>
  );
});

PromoCard.displayName = 'PromoCard';

export default PromoCard;
