import React from 'react';
<<<<<<< HEAD
=======
import CategoryCard from '../../../components/common/CategoryCard';
import electricianIcon from '../../../../../assets/images/icons/services/electrician.png';
import womensSalonIcon from '../../../../../assets/images/icons/services/womens-salon-spa-icon.png';
import massageMenIcon from '../../../../../assets/images/icons/services/massage-men-icon.png';
import cleaningIcon from '../../../../../assets/images/icons/services/cleaning-icon.png';
import electricianPlumberIcon from '../../../../../assets/images/icons/services/electrician-plumber-carpenter-icon.png';
import acApplianceRepairIcon from '../../../../../assets/images/icons/services/ac-appliance-repair-icon.png';
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const ServiceCategories = React.memo(({ categories, onCategoryClick, onSeeAllClick }) => {
<<<<<<< HEAD
=======


>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  const serviceCategories = categories.map((cat) => ({
    ...cat,
    icon: toAssetUrl(cat.icon || cat.image),
  }));

  return (
<<<<<<< HEAD
    <div className="w-full">
      {/* Horizontal Scrollable Layout */}
      <div className="overflow-x-auto scrollbar-hide pb-4 pt-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-6 px-5 w-max">
          {serviceCategories.map((category, index) => {
            const iconSrc = toAssetUrl(category.icon || category.image);
            return (
              <div 
                key={category.id || index} 
                onClick={() => onCategoryClick?.(category)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer w-[64px] group"
              >
                {/* Circular Icon Container */}
                <div className="w-[64px] h-[64px] rounded-full bg-[#EAF3EF] flex items-center justify-center mb-2.5 transition-transform duration-300 group-active:scale-95 group-hover:-translate-y-1">
                  <img
                    src={iconSrc}
                    alt={category.title}
                    className="w-8 h-8 object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                {/* Category Title */}
                <span className="text-[12px] font-semibold text-gray-700 text-center leading-tight line-clamp-2">
                  {category.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
=======
    <div className="px-5">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h2 className="text-[20px] font-black text-gray-900 tracking-tight flex items-center gap-2">
            Service Categories
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(40,116,240,0.5)]"></div>
          </h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em] -mt-0.5">Premium Home Services</p>
        </div>

      </div>

      {/* Horizontal Scrollable 2-Row Grid Layout */}
      <div className="overflow-x-auto hide-scrollbar -mx-5 px-5 pb-6 pt-2 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="grid grid-rows-2 grid-flow-col gap-x-4 gap-y-6 auto-cols-[76px] sm:auto-cols-[82px]">
          {serviceCategories.map((category, index) => {
            const iconSrc = toAssetUrl(category.icon || category.image);
            return (
              <div key={category.id || index} className="flex justify-center h-full snap-start">
                <CategoryCard
                  title={category.title}
                  icon={
                    <img
                      src={iconSrc}
                      alt={category.title}
                      className="w-[46px] h-[46px] object-contain group-hover:scale-110 transition-transform duration-500 will-change-transform"
                      loading="lazy"
                      decoding="async"
                    />
                  }
                  onClick={() => onCategoryClick?.(category)}
                  hasSaleBadge={category.hasSaleBadge}
                  index={index}
                />
              </div>
            );
          })}
          
          {/* See All Button - Displayed seamlessly as a card */}
          {serviceCategories.length >= 7 && (
            <div className="flex justify-center h-full snap-start pt-1">
              <div 
                onClick={onSeeAllClick}
                className="flex flex-col items-center justify-start cursor-pointer group w-full"
              >
                <div className="w-[72px] h-[72px] rounded-[20px] bg-gray-50 border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:bg-gray-900 group-hover:border-gray-900 mb-2.5">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-[10px] sm:text-[11px] text-center text-gray-800 font-bold leading-tight px-1 group-hover:text-gray-900">
                  View All
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle Bottom Separator */}
      <div className="mt-10 h-[1px] w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
    </div>
  );
});

ServiceCategories.displayName = 'ServiceCategories';

export default ServiceCategories;

