import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiMapPin, FiCheckCircle, FiXCircle, FiLoader, FiCalendar, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationBell from '../../components/common/NotificationBell';
import { motion } from 'framer-motion';
import { bookingService } from '../../../../services/bookingService';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, confirmed, in-progress, completed, cancelled
  const [bookingToDelete, setBookingToDelete] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filter !== 'all') {
          params.status = filter;
        }
        const response = await bookingService.getUserBookings(params);
        if (response.success) {
          setBookings(response.data || []);
        } else {
          toast.error(response.message || 'Failed to load bookings');
          setBookings([]);
        }
      } catch (error) {
        toast.error('Failed to load bookings. Please try again.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();

    // Listen for real-time updates
    window.addEventListener('userBookingsUpdated', loadBookings);

    return () => {
      window.removeEventListener('userBookingsUpdated', loadBookings);
    };
  }, [filter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FiCheckCircle className="w-3.5 h-3.5" />;
      case 'in_progress':
      case 'in-progress':
        return <FiLoader className="w-3.5 h-3.5 animate-spin" />;
      case 'journey_started':
      case 'visited':
        return <FiMapPin className="w-3.5 h-3.5 text-blue-500" />;
      case 'completed':
        return <FiCheckCircle className="w-3.5 h-3.5" />;
      case 'cancelled':
      case 'rejected':
        return <FiXCircle className="w-3.5 h-3.5" />;
      case 'awaiting_payment':
      default:
        return <FiClock className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'confirmed': return '!border-l-emerald-500';
      case 'in_progress':
      case 'in-progress':
      case 'journey_started':
      case 'visited':
        return '!border-l-blue-500';
      case 'completed': return '!border-l-violet-500';
      case 'cancelled':
      case 'rejected': return '!border-l-rose-500';
      case 'awaiting_payment': return '!border-l-amber-500';
      default: return '!border-l-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500 text-white border-emerald-600 ring-emerald-500';
      case 'in_progress':
      case 'in-progress':
      case 'journey_started':
      case 'visited':
        return 'bg-blue-500 text-white border-blue-600 ring-blue-500';
      case 'completed':
        return 'bg-violet-500 text-white border-violet-600 ring-violet-500';
      case 'cancelled':
      case 'rejected':
        return 'bg-rose-500 text-white border-rose-600 ring-rose-500';
      case 'awaiting_payment':
        return 'bg-amber-500 text-white border-amber-600 ring-amber-500';
      default:
        return 'bg-gray-500 text-white border-gray-600 ring-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    switch (status) {
      case 'in_progress':
      case 'in-progress':
        return 'In Progress';
      case 'journey_started': return 'On The Way';
      case 'visited': return 'Arrived';
      case 'awaiting_payment': return 'Request Accepted';
      case 'work_done': return 'Work Completed';
      default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  const handleBookingClick = (booking) => {
    navigate(`/user/booking/${booking._id || booking.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    try {
      setLoading(true);
      const res = await bookingService.delete(bookingToDelete);
      if (res.success) {
        toast.success('Booking removed from history');
        setBookings(prev => prev.filter(b => (b._id || b.id) !== bookingToDelete));
      } else {
        toast.error(res.message || 'Failed to remove booking');
      }
    } catch (error) {
      toast.error('Failed to remove booking. Please try again.');
    } finally {
      setLoading(false);
      setBookingToDelete(null);
    }
  };

  const getAddressString = (address) => {
    if (typeof address === 'string') return address;
    if (address && typeof address === 'object') {
      const parts = [
        address.addressLine1,
        address.addressLine2,
        address.city
      ].filter(Boolean);
      return parts.join(', ');
    }
    return 'Detailed Address';
  };

  return (
    <div className="min-h-[100dvh] pb-24 relative bg-[#F8FAFC] overflow-x-hidden">
      {/* Premium Modern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Modern Glassmorphism Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white shadow-sm px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-gray-100 active:scale-95 transition-all"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">My Bookings</h1>
          </div>
          <div className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-gray-100 relative">
            <NotificationBell />
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="sticky top-[73px] z-20 backdrop-blur-md bg-white/50 border-b border-white shadow-[0_4px_20px_-16px_rgba(0,0,0,0.1)]">
          <div className="flex overflow-x-auto px-4 py-3 gap-3 no-scrollbar scroll-smooth">
            {[
              { id: 'all', label: 'All Bookings' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'in-progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-5 py-2.5 rounded-[14px] text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border ${filter === tab.id
                  ? 'border-transparent text-white shadow-[0_4px_15px_rgba(0,128,128,0.3)] active:scale-95'
                  : 'bg-white/70 border-white text-gray-500 hover:text-gray-900 shadow-sm'
                  }`}
                style={filter === tab.id ? { background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <main className="px-4 py-5 max-w-lg mx-auto w-full">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse">
                  <div className="flex justify-between mb-4 border-b border-slate-100 pb-4">
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-slate-200 rounded"></div>
                      <div className="h-5 w-48 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-4 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <div className="space-y-1.5 py-1">
                      <div className="h-2.5 w-16 bg-slate-200 rounded"></div>
                      <div className="h-3.5 w-32 bg-slate-200 rounded"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <div className="space-y-1.5 py-1">
                      <div className="h-2.5 w-16 bg-slate-200 rounded"></div>
                      <div className="h-3.5 w-40 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-slate-200">
                    <div className="space-y-1">
                      <div className="h-2.5 w-16 bg-slate-200 rounded"></div>
                      <div className="h-6 w-24 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-9 w-28 bg-slate-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center px-6 bg-white/50 backdrop-blur-md rounded-[32px] border border-white border-dashed shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                <FiClock className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-gray-900 text-xl font-black mb-2 tracking-tight">No Bookings Found</h3>
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
                {filter === 'all'
                  ? "Looks like you haven't booked any services yet."
                  : `You don't have any ${filter.replace('-', ' ')} bookings.`}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="space-y-4"
            >
              {bookings.map((booking) => (
                <motion.div
                  key={booking._id || booking.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { type: "spring", stiffness: 100, damping: 15 }
                    }
                  }}
                  onClick={() => handleBookingClick(booking)}
                  className={`group relative bg-white/70 backdrop-blur-xl rounded-[20px] p-3 border border-white shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-300 cursor-pointer overflow-hidden`}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#008080]/5 rounded-full blur-[20px] -mr-8 -mt-8 pointer-events-none" />

                  {/* Header Section */}
                  <div className="relative z-10 flex items-start justify-between mb-3 border-b border-white/60 pb-3">
                    <div className="pr-3 flex-1">
                      <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        #{booking.bookingNumber || (booking._id || booking.id).substring(0, 8)}
                      </p>

                      {/* Detailed Booking Info */}
                      <div className="space-y-1.5">
                        {/* 1. Category */}
                        {booking.serviceCategory && (
                          <div className="text-[9px] font-black text-[#008080] bg-[#008080]/10 px-2.5 py-1 w-fit rounded-[8px] uppercase tracking-widest mb-2 border border-[#008080]/20">
                            {booking.serviceCategory}
                          </div>
                        )}

                        {/* 2. Brand / Section (if available from booked items) */}
                        {booking.bookedItems && booking.bookedItems.length > 0 && booking.bookedItems[0].sectionTitle && (
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {booking.bookedItems.map(item => item.sectionTitle).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                          </div>
                        )}

                        {/* 3. Service Name */}
                        <h3 className="text-[16px] font-black text-gray-900 leading-tight line-clamp-2 group-hover:text-[#008080] transition-colors tracking-tight">
                          {booking.serviceName || 'Service Request'}
                        </h3>

                        {/* Item Details (Preview) */}
                        {booking.bookedItems && booking.bookedItems.length > 0 && (
                          <p className="text-[11px] font-bold text-gray-400 line-clamp-1">
                            {booking.bookedItems.map(item => item.card?.title || item.title).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`shrink-0 px-3 py-1.5 rounded-[10px] border shadow-sm flex items-center gap-1.5 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="relative z-10 grid grid-cols-[auto_1fr] gap-x-2 gap-y-2 mb-3 p-2.5 rounded-[12px] bg-white/40 border border-white/60">
                    {/* Schedule */}
                    <div className="w-8 h-8 rounded-[10px] bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                      <FiCalendar className="w-3.5 h-3.5 text-[#008080]" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Slot</p>
                      <div className="flex items-center gap-2 text-[12px] font-black text-gray-700">
                        <span>{formatDate(booking.scheduledDate)}</span>
                        <span className="text-gray-300">•</span>
                        <span>{booking.scheduledTime || booking.timeSlot?.start || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="w-8 h-8 rounded-[10px] bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                      <FiMapPin className="w-3.5 h-3.5 text-[#D68F35]" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                      <p className="text-[12px] font-bold text-gray-700 truncate w-full">
                        {getAddressString(booking.address)}
                      </p>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-white/60">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-lg font-black text-gray-900 flex items-baseline gap-0.5 tracking-tight">
                        <span className="text-[12px] font-bold text-gray-400">₹</span>
                        {(booking.finalAmount || booking.totalAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {['cancelled', 'completed', 'rejected'].includes(booking.status) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingToDelete(booking._id || booking.id);
                          }}
                          className="p-2 rounded-[10px] text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete from history"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#008080]/10 border border-[#008080]/20 text-[#008080] font-black text-[10px] uppercase tracking-widest hover:bg-[#008080] hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        Details
                        <FiChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>

      {/* Premium Delete Confirmation Modal */}
      {bookingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-[320px] bg-white rounded-[24px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white/50 relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[30px] -mr-16 -mt-16 pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mb-4">
                <FiTrash2 className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-[18px] font-black text-gray-900 mb-2 tracking-tight">Clear History</h3>
              <p className="text-[12px] font-medium text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to remove this booking from your history? This action cannot be undone.
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setBookingToDelete(null)}
                  className="flex-1 py-3.5 px-4 rounded-[14px] bg-gray-50 text-gray-600 font-black text-[12px] uppercase tracking-widest hover:bg-gray-100 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBooking}
                  className="flex-1 py-3.5 px-4 rounded-[14px] bg-rose-500 text-white font-black text-[12px] uppercase tracking-widest hover:bg-rose-600 shadow-[0_4px_15px_rgba(244,63,94,0.3)] active:scale-95 transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

