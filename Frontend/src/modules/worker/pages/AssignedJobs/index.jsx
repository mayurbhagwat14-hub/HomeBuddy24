import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiClock, FiCheckCircle, FiXCircle, FiMapPin, FiChevronRight, FiUser, FiSearch } from 'react-icons/fi';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';
import { SkeletonList } from '../../../../components/common/SkeletonLoaders';

const AssignedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, confirmed, in_progress, completed
  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await workerService.getAssignedJobs();
      if (response.success) {
        setJobs(response.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch jobs error:', err);
      setError('Failed to load assigned jobs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    const handleUpdate = () => {
      fetchJobs();
    };
    window.addEventListener('workerJobsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('workerJobsUpdated', handleUpdate);
    };
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#F59E0B',
      'confirmed': '#3B82F6',
      'in_progress': '#F59E0B',
      'completed': '#10B981',
      'cancelled': '#EF4444',
      'rejected': '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'confirmed': 'Assigned',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected',
    };
    return labels[status] || status;
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const filteredJobs = jobs.filter(job => {
    const status = (job.status || '').toLowerCase();

    let matchesFilter = false;
    if (filter === 'all') {
      matchesFilter = true;
    } else if (filter === 'confirmed') {
      matchesFilter = ['confirmed', 'assigned', 'pending'].includes(status);
    } else if (filter === 'in_progress') {
      matchesFilter = ['in_progress', 'started', 'reached', 'visited', 'work_done', 'on_the_way'].includes(status);
    } else if (filter === 'completed') {
      matchesFilter = ['completed', 'worker_paid', 'paid'].includes(status);
    }

    const matchesSearch = searchQuery === '' ||
      job.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-[100dvh] pb-32 relative bg-[#F8FAFC] overflow-x-hidden">
      {/* Premium Modern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        <Header title="My Jobs" showSearch={true} />

        <main className="px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#008080]/20 to-[#D68F35]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center px-4 overflow-hidden focus-within:border-[#008080]/50 focus-within:bg-white transition-all duration-300">
              <FiSearch className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 pl-3 pr-4 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide px-1">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'confirmed', label: 'Pending' },
            { id: 'in_progress', label: 'Active' },
            { id: 'completed', label: 'Completed' },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-5 py-2.5 rounded-[14px] font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${filter === filterOption.id
                ? 'text-white bg-[#008080] shadow-[0_4px_12px_rgba(0,128,128,0.3)]'
                : 'bg-white/70 backdrop-blur-xl text-gray-500 border border-white hover:text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="py-2">
            <SkeletonList count={5} cardHeight="140px" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-md rounded-[32px] border border-white border-dashed mt-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
              <FiBriefcase className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-black text-gray-900 mb-2">No jobs found</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
              {searchQuery ? 'Try a different search term' : 'No jobs assigned at the moment'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const statusColor = getStatusColor(job.status);
              const rgbColor = hexToRgba(statusColor, 1);

              return (
                <div
                  key={job._id}
                  onClick={() => navigate(`/worker/job/${job._id}`)}
                  className="bg-white/70 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white group cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Glowing Accent Border */}
                  <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: `linear-gradient(180deg, ${statusColor} 0%, ${statusColor}40 100%)` }}></div>

                  <div className="relative z-10 pl-2">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                            style={{ background: hexToRgba(statusColor, 0.1) }}
                          >
                            <FiBriefcase className="w-5 h-5" style={{ color: statusColor }} />
                          </div>
                          <h3 className="font-black text-gray-900 text-[15px] leading-tight">{job.serviceName}</h3>
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
                            {getStatusLabel(job.status)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-[#0F172A] px-3.5 py-2 rounded-[14px] shadow-[0_4px_12px_rgba(15,23,42,0.15)] flex flex-col items-end">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Payout</span>
                        <span className="font-black text-white text-base">₹{job.finalAmount}</span>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-3 bg-white/40 rounded-[16px] p-4 border border-white/60">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <FiUser className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="text-gray-800 text-[13px] font-bold">{job.userId?.name || 'Customer'}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <FiMapPin className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="text-gray-600 text-[13px] font-medium truncate pr-4">{job.address?.addressLine1 || 'Address not available'}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <FiClock className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="text-gray-600 text-[13px] font-medium">
                          <span className="font-bold text-gray-800">{job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                          <span className="mx-1 text-gray-300">•</span>
                          {job.scheduledTime || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default AssignedJobs;
