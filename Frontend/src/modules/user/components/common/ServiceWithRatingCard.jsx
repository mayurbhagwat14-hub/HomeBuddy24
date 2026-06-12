import React, { memo } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { themeColors } from '../../../../theme';
import Logo from '../../../../components/common/Logo';

const ServiceWithRatingCard = memo(({ image, title, rating, reviews, price, originalPrice, discount, onClick, onAddClick }) => {
  return (
    <div
      className="min-w-[180px] w-[180px] bg-white rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,128,128,0.1)] hover:-translate-y-1 active:scale-95 group border border-gray-100"
      onClick={onClick}
    >
      <div className="relative">
        {discount && (
          <div
            className="absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10"
            style={{ backgroundColor: '#008080' }}
          >
            {discount} OFF
          </div>
        )}
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-36 flex items-center justify-center bg-[#F5FBFC] border-b border-gray-50">
            <Logo
              className="w-12 h-12 opacity-40 grayscale"
            />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-[13px] font-bold text-gray-800 leading-snug mb-1 line-clamp-2 min-h-[38px]">{title}</h3>
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <AiFillStar className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-700 font-bold">{rating}</span>
            {reviews && (
              <span className="text-[10px] text-gray-400">({reviews})</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-black text-gray-900">
                {price && !isNaN(price.toString().replace(/[,]/g, '')) ? `₹${price}` : (price || 'Contact')}
              </span>
              {originalPrice && (
                <span className="text-[10px] text-gray-400 line-through decoration-gray-400/60">₹{originalPrice}</span>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
            className="px-4 py-1.5 h-8 rounded-full text-[11px] font-bold transition-all active:scale-95 bg-[#008080] text-white hover:bg-[#006666] hover:shadow-lg hover:shadow-teal-500/30"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
});

ServiceWithRatingCard.displayName = 'ServiceWithRatingCard';

export default ServiceWithRatingCard;

