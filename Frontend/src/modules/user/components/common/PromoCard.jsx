import React, { memo } from 'react';
import { themeColors } from '../../../../theme';
import OptimizedImage from '../../../../components/common/OptimizedImage';
import OptimizedVideo from '../../../../components/common/OptimizedVideo';

const PromoCard = memo(({ title, subtitle, buttonText, image, onClick, className = '' }) => {
  const isVideo = image && (
    image.includes('video/upload') ||
    image.match(/\.(mp4|webm|ogg|mov)$|^https:\/\/res\.cloudinary\.com.*\/video\//i)
  );

  return (
    <div
      className={`relative rounded-[24px] overflow-hidden w-[88vw] sm:w-[360px] md:w-[420px] aspect-[16/9] sm:aspect-[2/1] cursor-pointer transition-all duration-500 hover:shadow-[0_15px_40px_rgba(0,128,128,0.2)] hover:-translate-y-1 active:scale-95 border border-teal-50 flex-shrink-0 ${className}`}
      style={{
        boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClick}
    >
      {image ? (
        isVideo ? (
          <OptimizedVideo
            src={image}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <OptimizedImage
            src={image}
            alt={title || 'Promo'}
            className="w-full h-full object-cover"
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <span className="text-gray-400 text-sm">Image</span>
        </div>
      )}
    </div>
  );
});

PromoCard.displayName = 'PromoCard';

export default PromoCard;
