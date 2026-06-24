import React, { useState, useEffect } from 'react';
import { FiSearch, FiSliders } from 'react-icons/fi';

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
  ];

  useEffect(() => {
    let timer;
    const currentFullText = serviceNames[currentServiceIndex];

    if (isTyping) {
      if (displayedText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, 100);
      } else {
        timer = setTimeout(() => setIsTyping(false), 2500);
      }
    } else {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
        }, 50);
      } else {
        setCurrentServiceIndex((prev) => (prev + 1) % serviceNames.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isTyping, currentServiceIndex]);

  return (
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
    </div>
  );
};

export default SearchBar;
