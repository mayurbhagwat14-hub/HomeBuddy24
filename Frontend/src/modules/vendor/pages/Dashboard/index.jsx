import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, memo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiBell, FiArrowRight, FiUser, FiClock, FiMapPin, FiCheckCircle, FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import { vendorDashboardService } from '../../services/dashboardService';
import { acceptBooking, rejectBooking, assignWorker } from '../../services/bookingService';
// Booking alert handled globally
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

import { registerFCMToken } from '../../../../services/pushNotificationService';
import LogoLoader from '../../../../components/common/LogoLoader';
import StatsCards from './components/StatsCards';
import PendingBookings from './components/PendingBookings';


const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const [stats, setStats] = useState({
    todayEarnings: 0,
    activeJobs: 0,
    pendingAlerts: 0,
    workersOnline: 0,
    totalEarnings: 0,
    completedJobs: 0,
    rating: 0,
  });
  const [vendorProfile, setVendorProfile] = useState({
    name: 'Vendor Name',
    businessName: 'Business Name',
    photo: null,
    service: []
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [globalConfig, setGlobalConfig] = useState({ maxSearchTime: 5, waveDuration: 60 });

  const ignoredBookingIds = useRef(new Set());

  // Set background gradient
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';

    };
  }, []);



  // Process API response - extracted to avoid duplication
  const processApiResponse = useCallback((response) => {
    if (!response.success) return;

    const { stats: apiStats, recentBookings, config } = response.data;
    if (config) setGlobalConfig(config);

    // Separate requested/searching bookings from other bookings
    const requestedBookings = (recentBookings || []).filter(booking => {
      const status = booking.status?.toLowerCase();
      return status === 'requested' || status === 'searching';
    });
    const otherBookings = (recentBookings || []).filter(booking => {
      const status = booking.status?.toLowerCase();
      return status !== 'requested' && status !== 'searching';
    });

    // Build pending bookings map
    const mergedMap = new Map();
    const vendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
    const vendorId = vendorData._id || vendorData.id;

    requestedBookings.forEach(b => {
      const id = String(b._id || b.id);

      // Find distance for this vendor if available
      let distance = 'N/A';
      if (b.potentialVendors && vendorId) {
        const potentialVendor = b.potentialVendors.find(pv =>
          String(pv.vendorId?._id || pv.vendorId) === String(vendorId)
        );
        if (potentialVendor && potentialVendor.distance) {
          distance = `${potentialVendor.distance.toFixed(1)} km`;
        }
      }

      mergedMap.set(id, {
        ...b, // Spread first!
        id,
        serviceName: b.serviceName || b.serviceId?.title || 'New Booking Request',
        serviceCategory: b.serviceCategory || b.serviceId?.categoryId?.title || 'General Service',
        customerName: b.userId?.name || 'Customer',
        location: {
          address: b.address?.addressLine1 || 'Address not available',
          distance: distance
        },
        // Prioritize vendorEarnings, fallback to 90% of finalAmount if it's not a free plan (finalAmount > 0)
        price: (b.vendorEarnings > 0 ? b.vendorEarnings : (b.finalAmount > 0 ? b.finalAmount * 0.9 : 0)).toFixed(2),
        vendorEarnings: b.vendorEarnings, // Ensure it's explicitly passed
        timeSlot: {
          date: new Date(b.scheduledDate).toLocaleDateString(),
          time: b.scheduledTime || 'Time not set'
        },
        status: b.status,
        expiresAt: b.expiresAt || (b.createdAt && config ? new Date(new Date(b.createdAt).getTime() + (config.maxSearchTime || 5) * 60000).toISOString() : null)
      });
    });

    // Filter out locally ignored bookings
    const finalMap = new Map();
    mergedMap.forEach((value, key) => {
      if (!ignoredBookingIds.current.has(key)) {
        finalMap.set(key, value);
      }
    });

    // Merge with local storage to avoid losing real-time updates that haven't hit API yet
    const localPending = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
    const apiPending = Array.from(finalMap.values());
    const mergedPending = [...apiPending];

    localPending.forEach(localJob => {
      const id = String(localJob.id || localJob._id);
      if (!mergedPending.find(job => String(job.id || job._id) === id) && !ignoredBookingIds.current.has(id)) {

        const createdAt = localJob.createdAt ? new Date(localJob.createdAt).getTime() : Date.now();
        const expiresAt = localJob.expiresAt || (localJob.createdAt && config ? new Date(createdAt + (config.maxSearchTime || 5) * 60000).toISOString() : null);
        const isExpired = (expiresAt && new Date(expiresAt) <= new Date()) || (Date.now() - createdAt > 300000);

        const lowerStatus = String(localJob.status || '').toLowerCase();

        if (!isExpired && (lowerStatus === 'requested' || lowerStatus === 'searching')) {
          mergedPending.push({
            ...localJob,
            id,
            serviceName: localJob.serviceName || localJob.serviceId?.title || 'New Booking Request',
            serviceCategory: localJob.serviceCategory || localJob.serviceId?.categoryId?.title || 'General Service',
            customerName: localJob.customerName || localJob.userId?.name || 'Customer',
            expiresAt
          });
        }
      }
    });

    setPendingBookings(mergedPending);
    localStorage.setItem('vendorPendingJobs', JSON.stringify(mergedPending));

    // Update stats
    setStats({
      todayEarnings: apiStats.vendorEarnings || 0,
      activeJobs: apiStats.inProgressBookings || 0,
      pendingAlerts: mergedPending.length,
      workersOnline: apiStats.workersOnline || 0,
      totalEarnings: apiStats.vendorEarnings || 0,
      completedJobs: apiStats.completedBookings || 0,
      rating: apiStats.rating || 0,
    });

    // Recent jobs (non-requested)
    const recentJobsData = otherBookings.slice(0, 3).map(booking => ({
      id: booking._id,
      serviceType: booking.serviceId?.title || 'Service',
      customerName: booking.userId?.name || 'Customer',
      location: booking.address?.addressLine1 || 'Address not available',
      price: (booking.vendorEarnings > 0 ? booking.vendorEarnings : (booking.finalAmount ? booking.finalAmount * 0.9 : 0)).toFixed(2),
      vendorEarnings: booking.vendorEarnings,
      timeSlot: {
        date: new Date(booking.scheduledDate).toLocaleDateString(),
        time: booking.scheduledTime || 'Time not set'
      },
      status: booking.status,
      assignedTo: booking.workerId ? { name: booking.workerId.name } : null,
    }));
    setRecentJobs(recentJobsData);

    // Load vendor profile from localStorage (once)
    const profile = JSON.parse(localStorage.getItem('vendorData') || '{}');
    setVendorProfile({
      name: profile.name || 'Vendor Name',
      businessName: profile.businessName || 'Business Name',
      photo: profile.profilePhoto || null,
      service: profile.service || []
    });
  }, []);

  // Main data loader - useCallback to prevent recreation
  const loadDashboardData = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      setError(null);

      const response = await vendorDashboardService.getDashboardStats();
      processApiResponse(response);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(String(err.message || 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  }, [processApiResponse]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Check for redirected state (to open a specific alert modal)
  useEffect(() => {
    if (location.state?.openBookingId && pendingBookings.length > 0) {
      const bId = String(location.state.openBookingId);
      const booking = pendingBookings.find(b => String(b.id || b._id) === bId);
      if (booking) {
        setActiveAlertBookings(prev => {
          if (prev.find(p => String(p.id || p._id) === bId)) return prev;
          return [...prev, booking];
        });
        // Clear state to avoid reopening on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, pendingBookings, navigate]);

  // Listen for real-time updates via window events (dispatched by useAppNotifications)
  useEffect(() => {
    const handleUpdate = () => {
      loadDashboardData(false); // false = don't show spinner for background refresh
    };

    // Ask for notification permission and register FCM
    registerFCMToken('vendor', true).catch(err => console.error('FCM registration failed:', err));

    // Listen for custom dashboard events from SocketContext
    const handleShowAlert = (e) => {
      // e.detail contains the new booking job
      if (e.detail) {
        // Also add to pending if not present
        setPendingBookings(prev => {
          if (prev.find(b => b.id === e.detail.id)) return prev;
          return [e.detail, ...prev];
        });
      }
    };

    const handleRemoveBooking = (e) => {
      if (e.detail?.id) {
        const idToRemove = String(e.detail.id);

        // Add to ignored list so it doesn't come back on next fetch
        ignoredBookingIds.current.add(idToRemove);

        // Remove from pending bookings state immediately
        setPendingBookings(prev => prev.filter(b => String(b.id || b._id) !== idToRemove));

        // Remove from recent jobs state
        setRecentJobs(prev => prev.filter(b => String(b.id || b._id) !== idToRemove));

        // Remove from localStorage
        const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
        const updatedPending = pendingJobs.filter(job => String(job.id || job._id) !== idToRemove);
        localStorage.setItem('vendorPendingJobs', JSON.stringify(updatedPending));
      }
    };

    window.addEventListener('vendorJobsUpdated', handleUpdate);
    window.addEventListener('vendorStatsUpdated', handleUpdate);
    window.addEventListener('showDashboardBookingAlert', handleShowAlert);
    window.addEventListener('removeVendorBooking', handleRemoveBooking);

    return () => {
      window.removeEventListener('vendorJobsUpdated', handleUpdate);
      window.removeEventListener('vendorStatsUpdated', handleUpdate);
      window.removeEventListener('showDashboardBookingAlert', handleShowAlert);
      window.removeEventListener('removeVendorBooking', handleRemoveBooking);
    };
  }, [loadDashboardData]);


  // Alert Action Handlers
  const handleAcceptAlert = async (bookingId) => {
    try {
      const response = await acceptBooking(bookingId);
      if (response.success) {
        toast.success('Booking accepted successfully!');
        setPendingBookings(prev => prev.filter(b => String(b.id || b._id) !== String(bookingId)));

        // Sync localStorage
        const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
        const updated = pendingJobs.filter(b => String(b.id || b._id) !== String(bookingId));
        localStorage.setItem('vendorPendingJobs', JSON.stringify(updated));

        window.dispatchEvent(new CustomEvent('removeVendorBooking', { detail: { id: bookingId } }));
        window.dispatchEvent(new Event('vendorStatsUpdated'));
      }
    } catch (error) {
      console.error('Error accepting:', error);
      toast.error('Failed to accept booking');
    }
  };

  const handleRejectAlert = async (bookingId) => {
    try {
      const response = await rejectBooking(bookingId);
      if (response.success) {
        toast.success('Booking rejected');
        setPendingBookings(prev => prev.filter(b => String(b.id || b._id) !== String(bookingId)));

        // Sync localStorage
        const pendingJobs = JSON.parse(localStorage.getItem('vendorPendingJobs') || '[]');
        const updated = pendingJobs.filter(b => String(b.id || b._id) !== String(bookingId));
        localStorage.setItem('vendorPendingJobs', JSON.stringify(updated));

        window.dispatchEvent(new CustomEvent('removeVendorBooking', { detail: { id: bookingId } }));
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error('Failed to reject booking');
    }
  };

  const handleAssignAlert = async (bookingId) => {
    navigate('/vendor/workers', { state: { bookingId } });
  };

  // Memoize quickActions to prevent recreation on every render
  const quickActions = useMemo(() => [
    {
      title: 'Active Jobs',
      icon: FiBriefcase,
      color: '#00a6a6',
      path: '/vendor/jobs',
      count: stats.activeJobs,
      subtitle: `${stats.activeJobs} running`,
    },
    {
      title: 'Manage Workers',
      icon: FiUsers,
      color: '#29ad81',
      path: '/vendor/workers',
      count: stats.workersOnline,
      subtitle: `${stats.workersOnline} online`,
    },
    {
      title: 'Wallet',
      icon: FaWallet,
      color: '#F59E0B',
      path: '/vendor/wallet',
      subtitle: `₹${stats.totalEarnings.toLocaleString()} total`,
    },
  ], [stats.activeJobs, stats.workersOnline, stats.totalEarnings]);

  const getStatusColor = (status) => {
    const s = String(status).toLowerCase();
    const statusColors = {
      'accepted': '#3B82F6',
      'confirmed': '#10B981',
      'assigned': '#8B5CF6',
      'journey_started': '#F59E0B',
      'visited': '#F59E0B',
      'in_progress': '#F59E0B',
      'work_done': '#10B981',
      'completed': '#10B981',
      'worker_paid': '#06B6D4',
      'settlement_pending': '#F97316',
    };
    return statusColors[s] || '#6B7280';
  };

  const getStatusLabel = (status) => {
    const s = String(status).toLowerCase();
    const labels = {
      'requested': 'Requested',
      'searching': 'Searching',
      'accepted': 'Accepted',
      'confirmed': 'Confirmed',
      'assigned': 'Assigned',
      'journey_started': 'On the way',
      'visited': 'Visited',
      'in_progress': 'In Progress',
      'work_done': 'Work Done',
      'completed': 'Completed',
      'worker_paid': 'Payment Done',
      'settlement_pending': 'Settlement',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected'
    };
    return labels[s] || status;
  };

  // Show loading state
  if (loading) {
    return <LogoLoader />;
  }

  // Show error state
  if (error && !loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center px-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-gray-900 text-xl font-bold mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-500 mb-6 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#008080] text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-[0_4px_15px_rgba(0,128,128,0.3)]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-32 relative bg-[#F8FAFC] overflow-x-hidden">
      {/* Premium Modern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        <Header title="Dashboard" showBack={false} notificationCount={stats.pendingAlerts} />

        <main className="pt-0">
        {/* Profile Card Section */}
        <div className="px-4 pt-4 pb-2">
          <div
            className="rounded-[28px] p-5 cursor-pointer transition-all duration-300 relative overflow-hidden shadow-[0_12px_40px_rgba(0,128,128,0.25)]"
            onClick={() => navigate('/vendor/profile')}
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Decorative Glowing Orbs */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#008080] rounded-full blur-[40px] opacity-40"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500 rounded-full blur-[30px] opacity-30"></div>

            <div className="relative z-10 flex items-center gap-4">
              {/* Profile Photo */}
              <div
                className="w-16 h-16 rounded-[20px] flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                }}
              >
                {vendorProfile.photo ? (
                  <img
                    src={vendorProfile.photo}
                    alt={vendorProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-8 h-8 text-white/80" />
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 mb-1">
                  Welcome Back
                </p>
                <h2 className="text-xl font-bold text-white truncate mb-0.5 tracking-tight">{vendorProfile.name}</h2>
                <p className="text-sm text-gray-400 truncate font-medium">{vendorProfile.businessName}</p>
              </div>

              {/* Arrow Icon */}
              <div
                className="p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:translate-x-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <FiChevronRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Incomplete Profile Prompt */}
        {(!vendorProfile.service || vendorProfile.service.length === 0) && (
          <div className="px-4 pt-2 -mb-2">
            <div
              onClick={() => navigate('/vendor/profile')}
              className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r shadow-sm cursor-pointer hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiClock className="h-5 w-5 text-orange-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-orange-700">Profile Incomplete</p>
                  <p className="text-sm text-orange-600">
                    Add services to your profile to start receiving bookings.
                  </p>
                </div>
                <div className="ml-auto">
                  <FiArrowRight className="h-4 w-4 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Optimized Component */}
        <StatsCards stats={stats} />

        {/* Content Section (below gradient) */}
        <div className="px-4 py-4 space-y-4">
          {/* Pending Booking Alerts - Optimized Component */}
          <PendingBookings
            bookings={pendingBookings}
            maxSearchTimeMins={globalConfig.maxSearchTime}
            setPendingBookings={setPendingBookings}
            setActiveAlertBooking={(booking) => {
              // Dispatch to global alert via CustomEvent
              window.dispatchEvent(new CustomEvent('showDashboardBookingAlert', { detail: booking }));
            }}
          />

          {/* Performance Metrics */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight px-1">Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Completed Jobs Card */}
              <div
                className="bg-white/70 backdrop-blur-xl rounded-[24px] relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300 border border-white"
                style={{
                  boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                }}
              >
                {/* Beautiful Emerald Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-80"></div>
                
                <div className="relative p-5 z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-[16px] bg-emerald-100 flex items-center justify-center mb-3 text-emerald-600 shadow-[0_4px_15px_rgba(16,185,129,0.2)]">
                    <FiCheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1">{stats.completedJobs}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jobs Done</p>
                </div>
              </div>

              {/* Rating Card */}
              <div
                className="bg-white/70 backdrop-blur-xl rounded-[24px] relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300 border border-white"
                style={{
                  boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                }}
              >
                {/* Beautiful Amber Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-80"></div>
                
                <div className="relative p-5 z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-[16px] bg-amber-100 flex items-center justify-center mb-3 text-amber-500 shadow-[0_4px_15px_rgba(245,158,11,0.2)]">
                    <FiTrendingUp className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1">
                    {stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Jobs - List View */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900 tracking-tight px-1">Active Jobs</h2>
              {recentJobs.length > 0 && (
                <button
                  onClick={() => navigate('/vendor/jobs')}
                  className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 text-[#008080] bg-[#008080]/10 hover:bg-[#008080]/20"
                >
                  View All
                </button>
              )}
            </div>
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job, index) => {
                  const statusColor = getStatusColor(job.status);
                  
                  return (
                    <div
                      key={job.id}
                      onClick={() => navigate(`/vendor/booking/${job.id}`)}
                      className="bg-white/70 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white group cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                    >
                      {/* Glowing Accent Border */}
                      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: `linear-gradient(180deg, ${statusColor} 0%, ${statusColor}40 100%)` }}></div>

                      <div className="relative z-10 pl-2">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 pr-3">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                                style={{ background: hexToRgba(statusColor, 0.1) }}
                              >
                                <FiUser className="w-5 h-5" style={{ color: statusColor }} />
                              </div>
                              <h3 className="font-black text-gray-900 text-[15px] leading-tight">{job.customerName}</h3>
                            </div>
                            <div className="ml-[52px]">
                              <span
                                className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                                style={{
                                  color: statusColor,
                                  background: hexToRgba(statusColor, 0.05),
                                  borderColor: hexToRgba(statusColor, 0.2)
                                }}
                              >
                                {job.serviceType || 'Service'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span
                              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border mb-2"
                              style={{
                                color: statusColor,
                                background: hexToRgba(statusColor, 0.05),
                                borderColor: hexToRgba(statusColor, 0.2)
                              }}
                            >
                              {getStatusLabel(job.status)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/vendor/booking/${job.id}`);
                              }}
                              className="p-2 rounded-xl flex-shrink-0 transition-all duration-300 active:scale-95 bg-gray-100 text-gray-500 group-hover:bg-[#008080] group-hover:text-white"
                            >
                              <FiArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Info Section */}
                        <div className="space-y-3 bg-white/40 rounded-[16px] p-4 border border-white/60">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <FiMapPin className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <span className="text-gray-600 text-[13px] font-medium truncate pr-4">{job.location}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <FiClock className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <span className="text-gray-600 text-[13px] font-medium">{job.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/50 backdrop-blur-md rounded-[32px] border border-white border-dashed shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
                  <FiBriefcase className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-lg font-black text-gray-900 mb-1">No active jobs</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                  New bookings will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
});

export default Dashboard;
