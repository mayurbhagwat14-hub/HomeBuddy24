<<<<<<< HEAD
import React, { memo } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { optimizeCloudinaryUrl } from '../../../../utils/cloudinaryOptimize';

const DetailedServiceCard = memo(({ image, title, rating, reviews, price, originalPrice, discount, onClick, onAddClick }) => {
=======
import React, { memo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { AiFillStar } from 'react-icons/ai';
import { themeColors } from '../../../../theme';
import { optimizeCloudinaryUrl } from '../../../../utils/cloudinaryOptimize';

const DetailedServiceCard = memo(({ image, title, rating, reviews, price, originalPrice, discount, onClick, onAddClick }) => {
  const cardRef = useRef(null);

  // Format price (remove non-digits, then format)
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
  const formatPrice = (p) => {
    if (!p) return null;
    const clean = p.toString().replace(/[^0-9]/g, '');
    return new Intl.NumberFormat('en-IN').format(clean);
  };

  const displayPrice = formatPrice(price);
<<<<<<< HEAD

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
=======
  const displayOriginalPrice = formatPrice(originalPrice);

  useEffect(() => {
    if (cardRef.current) {
      const card = cardRef.current;

      const handleMouseEnter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          boxShadow: '0 12px 24px rgba(59, 130, 246, 0.15), 0 6px 12px rgba(59, 130, 246, 0.1)',
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: themeColors.cardShadow,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleClick = () => {
        gsap.to(card, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
      card.addEventListener('click', handleClick);

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
        card.removeEventListener('click', handleClick);
      };
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="min-w-[200px] flex flex-col bg-white rounded-[24px] overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,128,128,0.1)] border border-gray-100"
      onClick={onClick}
    >
      <div className="relative">
        {discount && (
          <div
            className="absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10"
            style={{ backgroundColor: '#008080' }}
          >
            {discount.toString().toUpperCase().includes('OFF') ? discount : `${discount}% OFF`}
          </div>
        )}
        {image ? (
          <img
            src={optimizeCloudinaryUrl(image, { width: 400, quality: 'auto' })}
            alt={title}
            className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-36 flex items-center justify-center bg-[#F5FBFC] border-b border-gray-50">
            <span style={{ color: '#008080' }} className="font-medium text-xs uppercase tracking-wider opacity-50">No Image</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[13px] font-bold text-gray-800 leading-snug mb-1 line-clamp-2 min-h-[40px]">{title}</h3>

        <div className="flex items-center gap-1 mb-2">
          <AiFillStar className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-gray-700 font-bold">{rating}</span>
          {reviews && (
            <span className="text-[10px] text-gray-400">({reviews})</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-black text-gray-900">₹{displayPrice}</span>
              {displayOriginalPrice && (
                <span className="text-[10px] text-gray-400 line-through decoration-gray-400/60">₹{displayOriginalPrice}</span>
              )}
            </div>
          </div>

>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
<<<<<<< HEAD
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 text-[#3B826D] hover:bg-[#3B826D] hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
=======
            className="px-4 py-1.5 h-8 rounded-full text-[11px] font-bold transition-all active:scale-95 bg-[#008080] text-white hover:bg-[#006666] hover:shadow-lg hover:shadow-teal-500/30"
          >
            Book
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
          </button>
        </div>
      </div>
    </div >
  );
});

DetailedServiceCard.displayName = 'DetailedServiceCard';

export default DetailedServiceCard;

