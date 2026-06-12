import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import { themeColors } from '../../../../../theme';

const TimeSlotModal = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onSave,
  getDates,
  getTimeSlots,
  formatDate,
  isDateSelected,
  isTimeSelected
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      setIsClosing(false);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${isClosing ? 'opacity-0' : 'opacity-100'
          }`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Modal */}
        <div
          className={`bg-white rounded-t-3xl ${isClosing ? 'animate-slide-down' : 'animate-slide-up'
            }`}
          style={{
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-white/50 px-5 py-4 z-10 shrink-0 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-100 active:scale-95 shadow-sm"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-800" />
              </button>
              <h1 className="text-[18px] font-black text-gray-900 tracking-tight">Select Time Slot</h1>
            </div>
            <button
              onClick={handleClose}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-100 active:scale-95 shadow-sm text-gray-500 hover:text-red-500"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div
            className="px-5 py-5 overflow-y-auto flex-1 bg-[#F8FAFC]"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            <div className="mb-5 relative">
              <div className="absolute -left-4 -top-4 w-24 h-24 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>
              <h2 className="text-[16px] font-black text-gray-900 mb-1.5 tracking-tight relative z-10">When should the professional arrive?</h2>
              <p className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                Service will take approx. 45 mins
              </p>
            </div>

            {/* Date Selection */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-2 -mx-5 px-5 relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
              {getDates().map((date, index) => {
                const { day, date: dateNum } = formatDate(date);
                const isSelected = isDateSelected(date);
                return (
                  <button
                    key={index}
                    onClick={() => onDateSelect(date)}
                    className={`shrink-0 w-16 py-3.5 rounded-[20px] transition-all duration-300 relative overflow-hidden shadow-sm ${isSelected ? 'scale-105 shadow-[0_8px_20px_rgba(0,128,128,0.15)] border-0' : 'hover:-translate-y-0.5 border border-gray-200'}`}
                    style={isSelected ? {
                      background: 'linear-gradient(135deg, #0f766e 0%, #059669 100%)',
                      color: 'white'
                    } : {
                      background: 'white',
                      color: '#64748b'
                    }}
                  >
                    {isSelected && <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>}
                    <div className="flex flex-col items-center relative z-10">
                      <span className={`text-[11px] font-bold mb-1 uppercase tracking-widest ${isSelected ? 'text-teal-100' : 'text-gray-400'}`}>{day}</span>
                      <span className={`text-[18px] font-black ${isSelected ? 'text-white' : 'text-gray-900'}`}>{dateNum}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Payment Information */}
            <div className="flex items-center gap-2.5 mb-6 bg-blue-50/50 p-3 rounded-[16px] border border-blue-100/50">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-500 font-bold text-[10px]">i</span>
              </div>
              <p className="text-[11px] font-bold text-blue-700/80 uppercase tracking-wide">Online payment only for selected date</p>
            </div>

            {/* Time Selection */}
            <div className="mb-6 relative z-10">
              <h3 className="text-[14px] font-black text-gray-900 mb-4 tracking-tight">Select start time of service</h3>
              {getTimeSlots().length === 0 ? (
                <div className="text-center py-10 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-gray-50 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-gray-300 text-xl">🕒</span>
                  </div>
                  <p className="text-gray-900 font-black text-[14px] mb-1">No slots available</p>
                  <p className="text-[12px] font-medium text-gray-400">Please select a different date</p>
                </div>
              ) : (
                <div
                  className="grid grid-cols-3 gap-3 pb-2"
                  style={{
                    maxHeight: '280px',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain'
                  }}
                >
                  {getTimeSlots().map((slot, index) => {
                    const isSelected = isTimeSelected(slot.value);
                    return (
                      <button
                        key={index}
                        onClick={() => onTimeSelect(slot.value)}
                        className={`px-3 py-3.5 rounded-[16px] text-[13px] font-black transition-all duration-300 shadow-sm relative overflow-hidden ${isSelected ? 'scale-105 shadow-[0_8px_20px_rgba(0,128,128,0.15)] border-0' : 'border border-gray-200 hover:-translate-y-0.5'}`}
                        style={isSelected ? {
                          background: 'linear-gradient(135deg, #0f766e 0%, #059669 100%)',
                          color: 'white'
                        } : {
                          background: 'white',
                          color: '#334155'
                        }}
                      >
                        {isSelected && <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>}
                        <span className="relative z-10">{slot.display}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Proceed Button */}
            <div className="px-1 relative pb-6 z-10">
              {selectedDate && selectedTime && (
                <div className="absolute inset-x-1 inset-y-0 bottom-6 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-2xl blur-xl opacity-40 animate-pulse pointer-events-none"></div>
              )}
              <button
                onClick={() => onSave(selectedDate, selectedTime)}
                disabled={!selectedDate || !selectedTime}
                className="w-full relative py-4 rounded-2xl font-black text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-[13px] overflow-hidden group shadow-[0_8px_20px_rgba(0,128,128,0.2)]"
                style={{
                  background: (!selectedDate || !selectedTime) ? '#cbd5e1' : 'linear-gradient(135deg, #0f766e 0%, #059669 100%)',
                  boxShadow: (!selectedDate || !selectedTime) ? 'none' : ''
                }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10">Proceed to checkout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimeSlotModal;

