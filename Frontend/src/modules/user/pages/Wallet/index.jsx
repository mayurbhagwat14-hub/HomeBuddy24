import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronRight, FiLoader } from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { walletService } from '../../../../services/walletService';
import LogoLoader from '../../../../components/common/LogoLoader';
import NotificationBell from '../../components/common/NotificationBell';
import { themeColors } from '../../../../theme';

const Wallet = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setLoading(true);
        const [balanceResponse, transactionsResponse] = await Promise.all([
          walletService.getBalance(),
          walletService.getTransactions()
        ]);

        if (balanceResponse.success) {
          setWalletBalance(balanceResponse.data.balance || 0);
        }

        if (transactionsResponse.success) {
          setTransactions(transactionsResponse.data || []);
        }
      } catch (error) {
        toast.error('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, []);

  return (
    <div className="min-h-[100dvh] pb-32 relative bg-[#F8FAFC] overflow-x-hidden">
      {/* Premium Modern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#008080]/10 blur-[120px] animate-floating" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#D68F35]/10 blur-[100px] animate-floating" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] animate-floating" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Modern Glassmorphism Header */}
        <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/60 border-b border-white px-4 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-white transition-transform active:scale-95"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-800" />
            </button>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Wallet</h1>
          </div>
          <NotificationBell />
        </header>

        <main className="px-4 py-6">
          {/* Referral Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[24px] p-5 mb-6 relative overflow-hidden shadow-[0_15px_30px_-10px_rgba(124,58,237,0.4)] text-white group cursor-pointer" onClick={() => navigate('/user/rewards')}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black mb-1">Refer & Earn <span className="text-yellow-300">₹100</span></h2>
                <p className="text-xs text-purple-100 font-medium">Give ₹100, Get ₹100 when they book!</p>
              </div>
              
              <div className="relative group-hover:scale-110 transition-transform duration-300">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transform rotate-12 shadow-inner border border-white/30">
                   <span className="text-3xl drop-shadow-md">🎁</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Main Balance Card */}
          <div className="bg-[#0F172A] rounded-[32px] p-6 mb-8 text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden border border-white/10">
            {/* Vivid glow behind balance */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/20 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#008080]/20 rounded-full blur-[40px] -ml-12 -mb-12"></div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center py-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-[18px] flex items-center justify-center mb-4 border border-white/5">
                <MdAccountBalanceWallet className="w-6 h-6 text-white" />
              </div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Current Balance</p>
              {/* User Request: Balance should only reflect penalties (negative) */}
              <h2 className="text-5xl font-black text-red-400 tracking-tight">
                -₹{transactions
                  .filter(t => ['penalty', 'fine', 'cancellation_fee', 'debit'].includes(t.type))
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('en-IN')} 
              </h2>
              <span className="text-xs font-bold text-red-400/70 uppercase tracking-widest mt-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">Penalty Due</span>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,128,128,0.1)] transition-all flex flex-col justify-between group hover:-translate-y-1">
              <div className="w-10 h-10 rounded-[16px] bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Spent</p>
                <p className="text-xl font-black text-gray-900 mt-1">
                  ₹{transactions
                    .filter(t => ['payment', 'withdrawal', 'platform_fee', 'convenience_fee', 'gst', 'worker_payment', 'cash_collected'].includes(t.type))
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.1)] transition-all flex flex-col justify-between group hover:-translate-y-1">
              <div className="w-10 h-10 rounded-[16px] bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Penalty</p>
                <p className="text-xl font-black text-red-600 mt-1">
                  ₹{transactions
                    .filter(t => ['penalty', 'fine', 'cancellation_fee', 'debit'].includes(t.type))
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pl-2">Recent Transactions</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-20">
                  <LogoLoader fullScreen={false} />
                  <p className="text-sm font-bold text-gray-400 mt-4 animate-pulse">Syncing wallet...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16 bg-white/50 backdrop-blur-md rounded-[24px] border border-white border-dashed">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                     <MdAccountBalanceWallet className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">No wallet activity yet</p>
                </div>
              ) : (
                transactions.map((item, index) => {
                  const date = new Date(item.date);
                  const formattedDate = date.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  // Determine styles based on transaction type
                  let typeStyle = { color: 'text-gray-600', bg: 'bg-gray-100', icon: '•', sign: '' };

                  if (['credit', 'refund', 'topup', 'referral', 'cashback', 'cash_collected'].includes(item.type)) {
                    typeStyle = { color: 'text-green-600', bg: 'bg-green-500/10', icon: '↓', sign: '+' };
                  } else if (['payment', 'withdrawal'].includes(item.type)) {
                    typeStyle = { color: 'text-gray-800', bg: 'bg-gray-100', icon: '↑', sign: '-' };
                  } else if (['penalty', 'fine', 'cancellation_fee', 'debit'].includes(item.type)) {
                    typeStyle = { color: 'text-red-600', bg: 'bg-red-500/10', icon: '!', sign: '-' };
                  }

                  return (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-xl border border-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all group hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-transform group-hover:scale-110 ${typeStyle.bg}`}
                        >
                          <span className={`text-xl font-black ${typeStyle.color}`}>
                            {item.type === 'penalty' ? '!' : typeStyle.sign}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[15px] font-bold text-gray-900 line-clamp-1">
                            {item.description || item.title || 'Transaction'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[11px] font-semibold text-gray-400">{formattedDate}</p>
                            {item.type && (
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${typeStyle.bg} ${typeStyle.color}`}>
                                {item.type.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-base font-black ${typeStyle.color}`}
                        >
                          {typeStyle.sign}₹{item.amount.toLocaleString('en-IN')}
                        </p>
                        {item.balanceAfter !== undefined && (
                          <p className="text-[10px] font-bold text-gray-400 mt-1">
                            Bal: ₹{item.balanceAfter.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wallet;
