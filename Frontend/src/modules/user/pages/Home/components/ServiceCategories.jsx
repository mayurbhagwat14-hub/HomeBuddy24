import React from 'react';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const ServiceCategories = React.memo(({ categories, onCategoryClick, onSeeAllClick }) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  const serviceCategories = categories.map((cat) => ({
    ...cat,
    icon: toAssetUrl(cat.icon || cat.image),
  }));

  return (
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
    </div>
  );
});

ServiceCategories.displayName = 'ServiceCategories';

export default ServiceCategories;

