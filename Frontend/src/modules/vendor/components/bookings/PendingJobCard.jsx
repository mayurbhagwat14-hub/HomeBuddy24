import React from 'react';
import { FiClock, FiMapPin, FiBell } from 'react-icons/fi';

// Internal Timer Component for unification
const CountdownTimer = ({ durationSeconds, createdAt, expiresAt, onExpire }) => {
  const calculateTimeLeft = () => {
    try {
      if (expiresAt) {
        const end = new Date(expiresAt).getTime();
        if (!isNaN(end)) {
          const left = Math.floor((end - Date.now()) / 1000);
          return Math.max(0, left);
        }
      }
      if (!createdAt) return Number(durationSeconds) || 300;
      const start = new Date(createdAt).getTime();
      if (!isNaN(start)) {
        const elapsed = Math.floor((Date.now() - start) / 1000);
        return Math.max(0, (Number(durationSeconds) || 300) - elapsed);
      }
      return Number(durationSeconds) || 300;
    } catch (err) {
      return 0;
    }
  };

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

  React.useEffect(() => {
    // Recalculate once on mount to handle refresh correctly
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    if (initial <= 0 && onExpire) onExpire();
  }, [createdAt, expiresAt]);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }
    const interval = setInterval(() => {
      const current = calculateTimeLeft();
      setTimeLeft(current);
      if (current <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, createdAt, expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return (
    <div className={`text-[10px] font-mono font-bold flex items-center gap-1 ${timeLeft < 30 ? 'text-red-600 animate-pulse' : 'text-yellow-600'}`}>
      <FiClock className="w-3 h-3" />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
};

const PendingJobCard = ({ booking, onAccept, onReject, onClick, loadingAction, showTimer = false, maxSearchTimeMins = 5 }) => {
  const bookingId = booking.id || booking._id;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[24px] shadow-sm cursor-pointer active:scale-98 transition-transform border border-gray-100 overflow-hidden relative group"
      style={{
        boxShadow: '0 8px 25px rgba(0,0,0,0.04)',
      }}
    >
      {/* Urgency header */}
      {showTimer && (
        <div className="px-5 py-2.5 bg-[#F5FBFC] border-b border-gray-50 flex justify-between items-center">
          <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${booking.bookingType === 'instant' ? 'text-red-500 animate-pulse' : 'text-teal-700'}`}>
            {booking.bookingType === 'instant' && <span className="text-sm">⚡</span>}
            {booking.bookingType === 'instant' ? 'INSTANT' : 'NEW REQUEST'}
          </span>
          <CountdownTimer
            durationSeconds={maxSearchTimeMins * 60}
            createdAt={booking.createdAt}
            expiresAt={booking.expiresAt}
            onExpire={() => {
              // Locally remove from state if it expires
              window.dispatchEvent(new CustomEvent('removeVendorBooking', { detail: { id: bookingId } }));
            }}
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
              {booking.serviceCategory || (booking.serviceId?.category?.title) || (booking.categoryName) || 'General Service'}
            </p>
            <div className="flex items-start gap-2 mb-1.5">
              <p className="font-bold text-gray-900 text-[15px] leading-tight line-clamp-2">
                {booking.serviceName || booking.serviceType || booking.serviceId?.title || 'New Booking Request'}
              </p>
            </div>
            {booking.brandName && (
              <div className="flex items-center gap-1.5 mb-2 bg-[#F5FBFC] border border-teal-50 px-2 py-1 rounded-full w-fit">
                {booking.brandIcon && (
                  <img src={booking.brandIcon} alt={booking.brandName} className="w-3 h-3 object-contain" />
                )}
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wide">{booking.brandName}</span>
              </div>
            )}
            <p className="text-[13px] text-gray-500 font-medium line-clamp-1">
              <span className="text-gray-800 font-bold">{booking.customerName || booking.userId?.name || 'Customer'}</span> • {booking.location?.address || booking.address?.addressLine1 || 'Location'}
            </p>
          </div>
          <div className="flex flex-col items-center shrink-0">
            {booking.categoryIcon || booking.serviceId?.category?.icon ? (
              <div className="w-12 h-12 rounded-full bg-[#F5FBFC] border border-teal-50 flex items-center justify-center p-1.5 shadow-sm">
                <img src={booking.categoryIcon || booking.serviceId?.category?.icon} className="w-full h-full object-contain" alt="Category" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#F5FBFC] border border-teal-50 flex items-center justify-center shadow-sm">
                <FiBell className="w-5 h-5 text-teal-600 animate-pulse" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 py-3 border-t border-b border-gray-50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
              <FiClock className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {booking.timeSlot?.date || (booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : '')}
                {(booking.timeSlot?.date || booking.scheduledDate) ? ' • ' : ''}
                {booking.timeSlot?.time || booking.scheduledTime || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
              <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {(() => {
                  const dist = booking.location?.distance || booking.distance;
                  if (!dist || dist === 'N/A') return 'N/A';
                  return String(dist).includes('km') ? dist : `${dist} km`;
                })()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Est. Earnings</p>
            <div className="text-[18px] font-black text-gray-900">
              ₹{booking.price || booking.vendorEarnings || booking.finalAmount || 0}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button
            disabled={!!loadingAction}
            onClick={(e) => onReject(e, booking)}
            className="flex-1 bg-white text-gray-700 border border-gray-200 py-2.5 px-4 rounded-full text-[13px] font-bold hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingAction === 'reject' ? 'Rejecting...' : 'Reject'}
          </button>
          <button
            disabled={!!loadingAction}
            onClick={(e) => onAccept(e, booking)}
            className="flex-1 bg-[#008080] text-white py-2.5 px-4 rounded-full text-[13px] font-bold hover:bg-[#006666] hover:shadow-lg hover:shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingAction === 'accept' ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingJobCard;
