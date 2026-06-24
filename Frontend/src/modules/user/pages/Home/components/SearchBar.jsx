<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { FiSearch, FiSliders } from 'react-icons/fi';
=======
import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import NotificationBell from '../../../components/common/NotificationBell';
import { themeColors } from '../../../../../theme';
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86

const SearchBar = ({ onInputClick }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  const serviceNames = [
    'AC service and repair',
    'Washing machine services',
    'Cooler repair at Home',
    'R.O. repair installation',
    'Microwave repair',
<<<<<<< HEAD
=======
    'Geyser repair',
    'Bathroom appliance installation',
    'Fridge at Home'
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
  ];

  useEffect(() => {
    let timer;
    const currentFullText = serviceNames[currentServiceIndex];

    if (isTyping) {
      if (displayedText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
<<<<<<< HEAD
        }, 100);
      } else {
        timer = setTimeout(() => setIsTyping(false), 2500);
=======
        }, 150);
      } else {
        timer = setTimeout(() => setIsTyping(false), 2000);
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
      }
    } else {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
<<<<<<< HEAD
        }, 50);
=======
        }, 100);
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
      } else {
        setCurrentServiceIndex((prev) => (prev + 1) % serviceNames.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isTyping, currentServiceIndex]);

  return (
<<<<<<< HEAD
    <div className="flex items-center w-full pb-4">
      <div className="flex-1 relative cursor-pointer group" onClick={onInputClick}>
        
        {/* Input Container */}
        <div className="w-full bg-white rounded-xl flex items-center h-12 shadow-sm relative overflow-hidden transition-all duration-300">
          
          {/* Left Search Icon */}
          <div className="pl-4 pr-3 flex items-center justify-center shrink-0">
            <FiSearch className="w-[18px] h-[18px] text-gray-400" />
          </div>

          {/* Center Text (Typing effect) */}
          <div className="flex-1 overflow-hidden pr-2">
            <span className="text-[14px] text-gray-400 font-medium whitespace-nowrap">
              Search <span className="text-gray-800 ml-1">{displayedText}</span>
              <span className="animate-pulse ml-0.5 text-[#3B826D]">|</span>
            </span>
          </div>

          {/* Right Filter Icon */}
          <div className="pr-1 flex items-center shrink-0 h-full">
             <div className="h-8 w-[1px] bg-gray-100 mr-1"></div>
             <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors group-hover:text-[#3B826D] text-gray-400">
               <FiSliders className="w-5 h-5" />
             </button>
          </div>

        </div>
      </div>
=======
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 relative cursor-pointer" onClick={onInputClick}>
        <div className="relative w-full group">
          {/* Glow effect on hover */}
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `linear-gradient(90deg, ${themeColors.brand.teal}1A, ${themeColors.brand.orange}1A)` }}
          />

          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <FiSearch
              className="w-5 h-5 transition-colors duration-300"
              style={{ stroke: '#00a6a6' }}
            />
          </div>

          {/* Simulated Input */}
          <div
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-[15px] bg-white border border-gray-200 transition-all duration-300 text-gray-800 flex items-center h-[52px]"
            style={{
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
            }}
          >
            {/* Placeholder text with typing animation */}
            <span className="text-[15px] text-gray-400 tracking-wide font-light">
              Search for <span
                className="font-medium inline-block min-w-[2px]"
                style={{
                  color: '#00a6a6'
                }}
              >
                {displayedText}
                <span className="animate-pulse ml-0.5" style={{ color: '#00a6a6' }}>|</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Notification Bell next to Search Bar */}
      <div className="shrink-0">
        <NotificationBell />
      </div>
>>>>>>> c34bad6595e739083b7fdef20687f1c2dec39a86
    </div>
  );
};

export default SearchBar;
