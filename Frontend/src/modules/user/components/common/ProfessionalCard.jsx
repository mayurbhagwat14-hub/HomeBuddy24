import React from 'react';
import { FiStar } from 'react-icons/fi';

const ProfessionalCard = ({ image, name, rating, jobsCompleted, onClick }) => {
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_25px_rgba(0,128,128,0.06)] cursor-pointer transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,128,128,0.12)] hover:-translate-y-1 group"
      onClick={onClick}
    >
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={name || "Professional"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[#008080]/10 flex items-center justify-center text-[#008080] font-bold text-xl">
            {(name || 'P').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-[15px] truncate">{name || "Service Professional"}</h3>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-gray-700">{rating || "4.8"}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="text-xs text-gray-500">{jobsCompleted || "100+"} jobs</span>
        </div>
      </div>

      <button className="px-4 py-2 bg-[#008080]/10 text-[#008080] font-bold text-xs rounded-full hover:bg-[#008080] hover:text-white transition-colors duration-300">
        Select
      </button>
    </div>
  );
};

export default ProfessionalCard;
