import React, { useState, useRef, memo, useEffect } from 'react';
import { gsap } from 'gsap';
import { createRipple } from '../../../../utils/gsapAnimations';

import { themeColors } from '../../../../theme';

const CategoryCard = memo(({ icon, title, onClick, hasSaleBadge = false, index = 0 }) => {
  const cardRef = useRef(null);

  // Simple entrance animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          delay: index * 0.05,
          ease: 'power2.out',
        }
      );
    }
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="flex flex-col items-center justify-center p-1 cursor-pointer relative category-card-container group transition-transform duration-300 ease-out active:scale-95 w-full"
      onClick={onClick}
      style={{
        opacity: 0, // Start hidden for GSAP
      }}
    >
      <div
        className="w-[76px] h-[76px] rounded-[22px] flex items-center justify-center mb-2.5 relative flex-shrink-0 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 bg-white border border-gray-100/60"
        style={{
          boxShadow: '0 4px 14px -2px rgba(0,0,0,0.03), inset 0 -2px 6px rgba(0,0,0,0.01)',
        }}
      >
        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-[#008080]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {icon || (
          <svg
            className="w-8 h-8 text-gray-400 transition-colors duration-300"
            style={{ color: 'inherit' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            onMouseEnter={(e) => e.currentTarget.style.color = themeColors.button}
            onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {hasSaleBadge && (
          <div
            className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg z-10 border-2 border-white"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #E83E8C 100%)',
              boxShadow: '0 4px 12px rgba(232,62,140,0.3)'
            }}
          >
            SALE
          </div>
        )}
      </div>
      <span
        className="text-[10px] sm:text-[11px] text-center text-gray-800 font-bold leading-tight mt-0.5 transition-colors duration-300 w-full line-clamp-2 px-1"
        style={{
          wordWrap: 'break-word',
          color: 'inherit'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = themeColors.button}
        onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
      >
        {title}
      </span>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;

