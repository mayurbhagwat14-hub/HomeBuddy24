import React, { memo } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { optimizeCloudinaryUrl } from '../../../../utils/cloudinaryOptimize';

const DetailedServiceCard = memo(({ image, title, rating, reviews, price, originalPrice, discount, onClick, onAddClick }) => {
  const formatPrice = (p) => {
    if (!p) return null;
    const clean = p.toString().replace(/[^0-9]/g, '');
    return new Intl.NumberFormat('en-IN').format(clean);
  };

  const displayPrice = formatPrice(price);

  return (
    <div
      className="min-w-[160px] max-w-[180px] flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md active:scale-95"
      onClick={onClick}
    >
      <div className="relative h-[110px] w-full">
        {/* Floating Rating Pill */}
        <div className="absolute top-2 left-2 bg-[#F7C948] text-gray-900 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 flex items-center gap-1">
          <AiFillStar className="w-3 h-3 text-white drop-shadow-sm" />
          <span>{rating || '4.5'}</span>
        </div>

        {image ? (
          <img
            src={optimizeCloudinaryUrl(image, { width: 300, height: 220, crop: 'fill', quality: 'auto' })}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-200" />
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[13px] font-bold text-gray-800 leading-tight mb-2 line-clamp-2 min-h-[36px]">
          {title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-[14px] font-black text-[#3B826D]">₹{displayPrice || '199'}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 text-[#3B826D] hover:bg-[#3B826D] hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div >
  );
});

DetailedServiceCard.displayName = 'DetailedServiceCard';

export default DetailedServiceCard;

