import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser, FiBriefcase, FiPhone } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import LogoLoader from '../../../../components/common/LogoLoader';
import { getWorkers, deleteWorker } from '../../services/workerService';

const WorkersList = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const response = await getWorkers();
        const mapped = (response.data || response).map(w => ({
          ...w,
          id: w._id || w.id
        }));
        setWorkers(mapped || []);
      } catch (error) {
        console.error('Error loading workers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkers();
    window.addEventListener('vendorWorkersUpdated', loadWorkers);

    return () => {
      window.removeEventListener('vendorWorkersUpdated', loadWorkers);
    };
  }, []);

  const handleDelete = async (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await deleteWorker(workerId);
        setWorkers(workers.filter(w => w.id !== workerId));
        window.dispatchEvent(new Event('vendorWorkersUpdated'));
      } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Failed to delete worker');
      }
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const workerStatus = (worker.status || 'OFFLINE').toUpperCase();
    const isOnline = workerStatus === 'ONLINE';
    const isOffline = workerStatus === 'OFFLINE' || workerStatus === 'ACTIVE';

    const matchesFilter = filter === 'all' ||
      (filter === 'online' && isOnline) ||
      (filter === 'offline' && isOffline);

    const matchesSearch = searchQuery === '' ||
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.phone.includes(searchQuery);

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
        <Header title="Workers" />

        <main className="px-4 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#008080]/5 rounded-[20px] blur transition-all duration-300 group-hover:bg-[#008080]/10"></div>
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Search workers by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-xl rounded-[20px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#008080]/20 transition-all font-bold text-gray-700 relative z-0"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide px-1">
            {[
              { id: 'all', label: 'All Workers' },
              { id: 'online', label: 'Online' },
              { id: 'offline', label: 'Offline' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`px-6 py-3 rounded-[16px] font-black text-[11px] uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${filter === option.id
                  ? 'text-white bg-[#008080] shadow-[0_4px_15px_rgba(0,128,128,0.3)]'
                  : 'bg-white/70 backdrop-blur-xl text-gray-500 border border-white hover:text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                  }`}
              >
                {option.label}
                {filter === option.id && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-[6px] text-[10px]">
                    {filteredWorkers.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Workers List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/50 backdrop-blur-xl rounded-[24px] p-5 border border-white shadow-sm animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200/50 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-40 bg-gray-200/50 rounded" />
                      <div className="h-4 w-24 bg-gray-200/50 rounded" />
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200/50 rounded-full" />
                        <div className="h-6 w-16 bg-gray-200/50 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-16 bg-white/50 backdrop-blur-md rounded-[32px] border border-white border-dashed shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
                <FiUsers className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-lg font-black text-gray-900 mb-1">No workers found</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed mb-6">
                {searchQuery ? 'Try matching a different name or phone' : 'Start by adding a worker to your team'}
              </p>
              <button
                onClick={() => navigate('/vendor/workers/add')}
                className="px-8 py-4 rounded-[16px] font-black text-[11px] uppercase tracking-widest text-white bg-[#008080] shadow-[0_4px_15px_rgba(0,128,128,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                Add Worker
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkers.map((worker, index) => {
                const statusRaw = (worker.status || 'OFFLINE').toUpperCase();

                let displayStatus = 'Offline';
                let statusColor = '#94A3B8'; // Grey

                if (statusRaw === 'ONLINE') {
                  statusColor = '#10B981'; // Green
                  displayStatus = 'Online';
                } else if (statusRaw === 'BUSY') {
                  statusColor = '#F59E0B'; // Orange
                  displayStatus = 'Busy';
                }

                return (
                  <div
                    key={worker.id || index}
                    onClick={() => navigate(`/vendor/workers/${worker.id}/edit`)}
                    className="bg-white/70 backdrop-blur-xl rounded-[28px] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 active:scale-95 group relative"
                  >
                    <div className="flex gap-4">
                      {/* Profile Photo */}
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-[20px] overflow-hidden bg-white shadow-inner flex items-center justify-center">
                          {worker.profilePhoto ? (
                            <img src={worker.profilePhoto} alt={worker.name} className="w-full h-full object-cover" />
                          ) : (
                            <FiUser className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        <div
                          className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-all duration-300 ${statusRaw === 'ONLINE' ? 'animate-pulse' : ''}`}
                          style={{ backgroundColor: statusColor }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0">
                            <h3 className="font-black text-gray-900 text-[17px] tracking-tight truncate">{worker.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1.5 bg-white/50 px-2 py-0.5 rounded-md border border-white">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
                                <span
                                  className="text-[9px] font-black uppercase tracking-widest"
                                  style={{ color: statusColor }}
                                >
                                  {displayStatus}
                                </span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-500 font-bold text-[11px] tracking-wider font-mono">{worker.phone}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/vendor/workers/${worker.id}/edit`);
                              }}
                              className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition-colors border border-teal-100"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(worker.id);
                              }}
                              className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors border border-rose-100"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Skills & Stats */}
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                          <div className="flex flex-wrap gap-1.5 min-w-0 flex-1 pr-2">
                            {worker.skills && worker.skills.length > 0 ? (
                              worker.skills.slice(0, 2).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-[8px] text-[9px] font-black uppercase tracking-widest bg-gray-100/80 text-gray-600 border border-white shadow-sm whitespace-nowrap"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold italic">No skills</span>
                            )}
                            {worker.skills?.length > 2 && (
                              <span className="text-[10px] text-gray-400 font-black px-1.5 py-0.5 bg-white rounded-md border border-gray-100 shadow-sm">+{worker.skills.length - 2}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 bg-white/60 px-3 py-1.5 rounded-[12px] border border-white shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px]">⭐</span>
                              <span className="text-[11px] font-black text-gray-800">{worker.rating || '4.5'}</span>
                            </div>
                            <div className="h-3 w-[1px] bg-gray-300" />
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                              <span className="text-gray-800 mr-1">{worker.completedJobs || 0}</span>Jobs
                            </div>
                          </div>
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

      {/* Floating Action Button */}
      <motion.button
        onClick={() => navigate('/vendor/workers/add')}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-[0_8px_30px_rgba(0,128,128,0.4)] active:scale-95 z-50 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #008080 0%, #006666 100%)' }}
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
        <FiPlus className="w-8 h-8 font-bold" />
      </motion.button>

      <BottomNav />
    </div>
  );
};

export default WorkersList;
