import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp, FiChevronRight, FiUser, FiBell, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { workerTheme as themeColors, vendorTheme } from '../../../../theme';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';
import { registerFCMToken } from '../../../../services/pushNotificationService';
import { SkeletonProfileHeader, SkeletonDashboardStats, SkeletonList } from '../../../../components/common/SkeletonLoaders';
import OptimizedImage from '../../../../components/common/OptimizedImage';
import { useSocket } from '../../../../context/SocketContext';
import WorkerJobAlertModal from '../../components/bookings/WorkerJobAlertModal';
import LogoLoader from '../../../../components/common/LogoLoader';


const Dashboard = () => {
  const navigate = useNavigate();

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected',
      'COMPLETED': 'Completed',
      'ASSIGNED': 'Assigned',
      'VISITED': 'Visited',
      'WORK_DONE': 'Work Done',
    };
    return statusMap[status] || status;
  };

  const [stats, setStats] = useState({
    pendingJobs: 0,
    acceptedJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    rating: 0,
  });
  const [workerProfile, setWorkerProfile] = useState({
    name: 'Worker Name',
    phone: '+91 9876543210',
    photo: null,
    categories: [],
    address: null,
  });
  const [recentJobs, setRecentJobs] = useState([]);

  // Set background gradient
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    // We remove the old background override so it can be handled by our new CSS/divs
    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  const [alertJobId, setAlertJobId] = useState(null);


  // Fetch Dashboard Data Function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch Profile, Stats and Recent Jobs in parallel (Stats also includes recent jobs but let's be robust)
      const [profileRes, statsRes] = await Promise.all([
        workerService.getProfile(),
        workerService.getDashboardStats()
      ]);

      if (profileRes.success) {
        const profile = profileRes.worker;
        setWorkerProfile({
          name: profile.name || 'Worker Name',
          phone: profile.phone || '',
          photo: profile.profilePhoto || null,
          categories: profile.serviceCategories || (profile.serviceCategory ? [profile.serviceCategory] : []),
          address: profile.address,
        });
      }

      if (statsRes.success) {
        const { totalEarnings, activeJobs, completedJobs, rating, recentJobs: apiRecentJobs } = statsRes.data;

        setStats(prev => ({
          ...prev,
          totalEarnings: totalEarnings || 0,
          thisMonthEarnings: totalEarnings || 0, // Assuming total is this month for now or total
          pendingJobs: activeJobs || 0, // Using active for pending display for now, or map specifically if needed
          acceptedJobs: activeJobs || 0, // Overlap in meaning, simplify
          completedJobs: completedJobs || 0,
          rating: rating || 0
        }));

        // Use recent jobs from stats API
        if (apiRecentJobs && apiRecentJobs.length > 0) {
          setRecentJobs(apiRecentJobs.map(job => ({
            id: job._id,
            serviceType: job.serviceId?.title || job.serviceName || 'Service',
            customerName: job.userId?.name || 'Customer',
            location: job.address?.city || 'Location N/A',
            time: job.scheduledTime || 'N/A',
            status: job.status,
            price: job.finalAmount,
          })));
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Load real data from API
  useEffect(() => {
    fetchDashboardData();

    // Ask for notification permission and register FCM
    registerFCMToken('worker', true).catch(err => console.error('FCM registration failed:', err));

    // Listen for updates
    const handleUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('workerJobsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('workerJobsUpdated', handleUpdate);
    };

  }, []);



  // Socket Listener for New Jobs
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notif) => {
      // Listen for new job assignments
      if ((notif.type === 'booking_created' || notif.type === 'job_assigned') && notif.relatedId) {
        setAlertJobId(notif.relatedId);
      }
    };

    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [socket]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] pb-32 relative bg-[#F8FAFC] overflow-x-hidden">
        <Header title="Dashboard" showBack={false} />
        <main className="px-4 py-4 space-y-6 relative z-10">
          <SkeletonProfileHeader />
          <SkeletonDashboardStats />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
            <SkeletonList count={3} />
          </div>
        </main>
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
        <Header title="Dashboard" showBack={false} notificationCount={stats.pendingJobs} />

        <main className="pt-2">
          {/* Profile Card Section */}
          <div className="px-4 pt-4 pb-2">
            <div
              className="rounded-[32px] p-6 cursor-pointer active:scale-95 transition-all duration-300 relative overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] bg-[#0F172A] border border-white/10 group"
              onClick={() => navigate('/worker/profile')}
            >
              {/* Vivid glow behind balance */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#008080]/30 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-[#008080]/40 transition-all duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D68F35]/20 rounded-full blur-[40px] -ml-12 -mb-12 group-hover:bg-[#D68F35]/30 transition-all duration-500"></div>

              <div className="relative z-10 flex items-center gap-4">
                {/* Profile Photo */}
                <div
                  className="w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0 overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-300"
                >
                  {workerProfile.photo ? (
                    <OptimizedImage
                      src={workerProfile.photo}
                      alt={workerProfile.name}
                      className="w-full h-full object-cover"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <FiUser className="w-8 h-8 text-white/70" />
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-[#008080] drop-shadow-md bg-[#008080]/10 inline-block px-2 py-0.5 rounded-full border border-[#008080]/20">
                    WELCOME BACK
                  </p>
                  <h2 className="text-xl font-black text-white truncate mb-1 tracking-tight">{workerProfile.name}</h2>
                  {workerProfile.categories && workerProfile.categories.length > 0 && (
                    <p className="text-xs text-gray-400 truncate font-semibold uppercase tracking-wider">
                      {workerProfile.categories.join(' • ')}
                    </p>
                  )}
                </div>

                {/* Arrow Icon */}
                <div
                  className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-white/10 transition-colors"
                >
                  <FiChevronRight className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Incomplete Profile Prompt */}
          {((!workerProfile.categories || workerProfile.categories.length === 0) ||
            (!workerProfile.address || Object.keys(workerProfile.address).length === 0)) && (
              <div className="px-4 pt-4 mb-2">
                <div
                  onClick={() => navigate('/worker/profile')}
                  className="bg-orange-500/10 backdrop-blur-xl border border-orange-500/20 p-4 rounded-[24px] shadow-[0_8px_30px_rgba(249,115,22,0.1)] cursor-pointer hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[16px] bg-orange-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <FiClock className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-orange-600 uppercase tracking-widest mb-1">Action Required</p>
                      <p className="text-xs font-bold text-gray-600 leading-tight">
                        Complete your profile setup to start receiving jobs.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <FiArrowRight className="h-4 w-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Stats Cards - Premium Glassmorphism */}
          <div className="px-4 pt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Card 1: This Month Earnings */}
              <div
                onClick={() => navigate('/worker/jobs')}
                className="bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,128,128,0.1)] transition-all flex flex-col justify-between group hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[16px] bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FaWallet className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                    <FiTrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-[9px] text-green-600 font-black uppercase tracking-widest">Earnings</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">This Month</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    ₹{stats.thisMonthEarnings.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Card 2: Pending Jobs */}
              <div
                onClick={() => navigate('/worker/jobs')}
                className="bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.1)] transition-all flex flex-col justify-between group hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[16px] bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiClock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">
                    <FiCheckCircle className="w-3 h-3 text-orange-600" />
                    <span className="text-[9px] text-orange-600 font-black uppercase tracking-widest">Waiting</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Pending Jobs</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    {stats.pendingJobs}
                  </p>
                </div>
              </div>

              {/* Card 3: Accepted Jobs */}
              <div
                onClick={() => navigate('/worker/jobs')}
                className="bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] transition-all flex flex-col justify-between group hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[16px] bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiCheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                    <FiBriefcase className="w-3 h-3 text-blue-600" />
                    <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">Active</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Accepted</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    {stats.acceptedJobs}
                  </p>
                </div>
              </div>

              {/* Card 4: Completed Jobs */}
              <div
                onClick={() => navigate('/worker/jobs')}
                className="bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)] transition-all flex flex-col justify-between group hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[16px] bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiBriefcase className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
                    <FiCheckCircle className="w-3 h-3 text-purple-600" />
                    <span className="text-[9px] text-purple-600 font-black uppercase tracking-widest">Done</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Completed</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    {stats.completedJobs}
                  </p>
                </div>
              </div>
            </div>
          </div>          {/* Recent Jobs Section */}
          <div className="px-4 pt-2 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-2">Recent Jobs</h2>
              {recentJobs.length > 0 && (
                <button
                  onClick={() => navigate('/worker/jobs')}
                  className="text-[10px] font-black text-[#008080] uppercase tracking-widest hover:text-[#005e5e] transition-colors"
                >
                  View All
                </button>
              )}
            </div>
            
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job, index) => {
                  return (
                    <div
                      key={job.id}
                      onClick={() => navigate(`/worker/job/${job.id}`)}
                      className="bg-white/70 backdrop-blur-xl border border-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] cursor-pointer group hover:-translate-y-1 transition-all duration-300 p-5"
                    >
                      <div className="flex items-center gap-4">
                        {/* Profile Image Circle */}
                        <div
                          className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 overflow-hidden bg-[#008080]/10 group-hover:scale-110 transition-transform duration-300"
                        >
                          <FiUser className="w-6 h-6 text-[#008080]" />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[15px] font-black text-gray-900 truncate tracking-tight">{job.customerName}</p>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#008080]/10 text-[#008080] border border-[#008080]/20">
                              {getStatusLabel(job.status)}
                            </span>
                          </div>

                          <p className="text-[13px] font-bold text-gray-600 mb-2 truncate">{job.serviceType || 'Service'}</p>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-[11px] font-semibold text-gray-500 truncate max-w-[100px]">{job.location}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <div className="flex items-center gap-1.5">
                              <FiClock className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-[11px] font-semibold text-gray-500">{job.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/50 backdrop-blur-md rounded-[32px] border border-white border-dashed">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <FiBriefcase className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-black text-gray-900 mb-1">No jobs assigned yet</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                  You'll see assigned jobs here when vendors assign work to you
                </p>
              </div>
            )}
          </div>
        </main>
      </div>


      <WorkerJobAlertModal
        isOpen={!!alertJobId}
        jobId={alertJobId}
        onClose={() => setAlertJobId(null)}
        onJobAccepted={(id) => {
          fetchDashboardData();
          navigate(`/worker/job/${id}`);
        }}
      />


    </div >
  );
};

export default Dashboard;

