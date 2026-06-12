import React, { memo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { AiFillStar } from 'react-icons/ai';
import { themeColors } from '../../../../theme';
import { optimizeCloudinaryUrl } from '../../../../utils/cloudinaryOptimize';

const DetailedServiceCard = memo(({ image, title, rating, reviews, price, originalPrice, discount, onClick, onAddClick }) => {
  const cardRef = useRef(null);

  // Format price (remove non-digits, then format)
  const formatPrice = (p) => {
    if (!p) return null;
    const clean = p.toString().replace(/[^0-9]/g, '');
    return new Intl.NumberFormat('en-IN').format(clean);
  };

  const displayPrice = formatPrice(price);
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

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
            className="px-4 py-1.5 h-8 rounded-full text-[11px] font-bold transition-all active:scale-95 bg-[#008080] text-white hover:bg-[#006666] hover:shadow-lg hover:shadow-teal-500/30"
          >
            Book
          </button>
        </div>
      </div>
    </div >
  );
});

DetailedServiceCard.displayName = 'DetailedServiceCard';

export default DetailedServiceCard;

