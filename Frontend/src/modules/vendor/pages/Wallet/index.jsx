import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowUp, FiArrowDown, FiArrowRight, FiClock, FiCheckCircle, FiAlertCircle, FiSend, FiX } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import LogoLoader from '../../../../components/common/LogoLoader';
import vendorWalletService from '../../../../services/vendorWalletService';
import { toast } from 'react-hot-toast';

const Wallet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({
    balance: 0,
    dues: 0,
    earnings: 0,
    amountDue: 0,
    totalCashCollected: 0,
    totalSettled: 0,
    totalWithdrawn: 0,
    pendingSettlements: 0,
    cashLimit: 10000
  });
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

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
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, txnRes] = await Promise.all([
        vendorWalletService.getWallet(),
        vendorWalletService.getTransactions({ limit: 50 })
      ]);

      if (walletRes.success) {
        setWallet(walletRes.data);
      }

      if (txnRes.success) {
        setTransactions(txnRes.data || []);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filter === 'all') return true;
    return txn.type === filter;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'cash_collected':
        return <FiArrowDown className="w-5 h-5 text-red-500" />;
      case 'earnings_credit':
        return <FiArrowUp className="w-5 h-5 text-green-500" />;
      case 'settlement':
        return <FiSend className="w-5 h-5 text-blue-500" />;
      case 'withdrawal':
        return <FaRupeeSign className="w-5 h-5 text-purple-500" />;
      case 'tds_deduction':
        return <FiAlertCircle className="w-5 h-5 text-amber-500" />;
      case 'commission':
        return <FaRupeeSign className="w-5 h-5 text-orange-500" />;
      case 'platform_fee':
        return <FiAlertCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <FaRupeeSign className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'cash_collected':
        return 'Cash Collected';
      case 'earnings_credit':
        return 'Earnings Credited';
      case 'settlement':
        return 'Settlement Paid';
      case 'withdrawal':
        return 'Withdrawal Payout';
      case 'tds_deduction':
        return 'TDS Deduction';
      case 'commission':
        return 'Commission';
      case 'platform_fee':
        return 'Platform Charge';
      default:
        return type;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LogoLoader />;
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
        <Header title="Wallet & Ledger" />

        <main className="px-4 py-6">
          {/* Earnings Card (Green) - Premium Glassmorphic */}
          <div className="rounded-[32px] p-6 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] relative overflow-hidden mb-6 bg-gradient-to-br from-emerald-600 to-emerald-800 border border-emerald-500/50">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/30 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-900/40 rounded-full blur-[40px] -ml-12 -mb-12"></div>
            
            <div className="relative z-10 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-emerald-100 drop-shadow-md bg-white/10 inline-block px-2 py-0.5 rounded-full border border-white/20">
                    Available Earnings
                  </p>
                  <p className="text-4xl font-black mt-2 tracking-tight">₹{wallet.earnings?.toLocaleString() || 0}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-[16px] backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <span className="text-2xl font-bold text-white">₹</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/vendor/wallet/withdraw')}
                className="w-full bg-white/10 backdrop-blur-md text-white py-3.5 rounded-xl font-bold text-sm hover:bg-white/20 active:scale-95 transition-all border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
              >
                Request Withdrawal
              </button>
            </div>
          </div>

          {/* Dues Card (Red) - Premium Glassmorphic */}
          <div className="rounded-[32px] p-6 shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)] relative overflow-hidden mb-8 bg-[#0F172A] border border-white/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/20 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-900/40 rounded-full blur-[40px] -ml-12 -mb-12"></div>
            
            <div className="relative z-10 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300 drop-shadow-md bg-rose-500/10 inline-block px-2 py-0.5 rounded-full border border-rose-500/20">
                      Amount Due to Admin
                    </p>
                    {wallet.dues > 0 && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-4xl font-black mt-2 tracking-tight">₹{wallet.dues?.toLocaleString() || 0}</p>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-[16px] backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                  <FiArrowDown className="w-5 h-5 text-rose-400" />
                </div>
              </div>

              {wallet.dues > 0 ? (
                <button
                  onClick={() => navigate('/vendor/wallet/settle')}
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-[0_4px_12px_rgba(244,63,94,0.3)]"
                >
                  Pay Now
                </button>
              ) : (
                <div className="w-full bg-white/5 backdrop-blur-md text-gray-300 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest text-center border border-white/10">
                  No Dues Pending
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Cash Collected */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white group transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[14px] bg-rose-50 text-rose-500 flex items-center justify-center shadow-[0_4px_12px_rgba(244,63,94,0.1)]">
                  <FiArrowDown className="w-5 h-5" />
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cash Collected</p>
              </div>
              <p className="text-2xl font-black text-gray-900">
                ₹{wallet.totalCashCollected?.toLocaleString() || 0}
              </p>
            </div>

            {/* Total Settled */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white group transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[14px] bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.1)]">
                  <FiArrowUp className="w-5 h-5" />
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Settled</p>
              </div>
              <p className="text-2xl font-black text-gray-900">
                ₹{wallet.totalSettled?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Blocked Status Notice */}
          {wallet.isBlocked && (
            <div className="bg-rose-500/10 backdrop-blur-xl border border-rose-500/30 rounded-[24px] p-5 mb-8 shadow-[0_8px_30px_rgba(244,63,94,0.1)]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <FiX className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="font-black text-rose-800 text-base mb-1">Account Blocked</p>
                  <p className="text-sm text-rose-600/80 font-semibold mb-3">
                    {wallet.blockReason || 'Your account is blocked due to excessive dues.'}
                  </p>
                  <button
                    onClick={() => navigate('/vendor/wallet/settle')}
                    className="text-[10px] font-black uppercase tracking-widest text-white bg-rose-600 px-4 py-2.5 rounded-[12px] shadow-[0_4px_12px_rgba(244,63,94,0.3)] active:scale-95 transition-all"
                  >
                    Pay Now to Unblock
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cash Limit Indicator */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8 border border-white">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black text-gray-900 tracking-tight">Cash Collection Limit</p>
              <p className="text-[11px] font-bold text-gray-500 bg-white shadow-sm border border-gray-100 px-2.5 py-1.5 rounded-[10px] uppercase tracking-wider">
                <span className={wallet.dues > (wallet.cashLimit || 10000) * 0.8 ? 'text-rose-500' : 'text-gray-900'}>₹{(wallet.dues || 0).toLocaleString()}</span> / <span className="text-gray-400">₹{(wallet.cashLimit || 10000).toLocaleString()}</span>
              </p>
            </div>
            <div className="w-full h-3 bg-gray-100/50 rounded-full overflow-hidden mb-3 shadow-inner">
              <div
                className={`h-full transition-all duration-500 rounded-full ${(wallet.dues / (wallet.cashLimit || 10000)) > 0.8 ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-gradient-to-r from-[#008080] to-teal-400 shadow-[0_0_10px_rgba(0,128,128,0.5)]'
                  }`}
                style={{ width: `${Math.min(100, (wallet.dues / (wallet.cashLimit || 10000)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              * Auto-blocked if you exceed ₹{(wallet.cashLimit || 10000).toLocaleString()} limit.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide px-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'cash_collected', label: 'Cash' },
              { id: 'settlement', label: 'Settlements' },
              { id: 'withdrawal', label: 'Withdrawals' },
              { id: 'tds_deduction', label: 'TDS' },
              { id: 'platform_fee', label: 'Fees' },
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

          {/* Transactions/Ledger */}
          <div>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-2 mb-4">Transaction History</h3>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16 bg-white/50 backdrop-blur-md rounded-[32px] border border-white border-dashed">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaRupeeSign className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-black text-gray-900 mb-1">No transactions yet</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                  Your ledger will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((txn) => (
                  <div
                    key={txn._id}
                    className="bg-white/70 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            txn.type === 'cash_collected' ? 'rgba(244,63,94,0.1)' :
                              txn.type === 'settlement' ? 'rgba(16,185,129,0.1)' :
                                txn.type === 'withdrawal' ? 'rgba(139,92,246,0.1)' :
                                  txn.type === 'tds_deduction' ? 'rgba(245,158,11,0.1)' :
                                    txn.type === 'platform_fee' ? 'rgba(244,63,94,0.1)' : 'rgba(249,115,22,0.1)'
                        }}
                      >
                        {getTransactionIcon(txn.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-black text-gray-900 text-[14px] truncate pr-2">
                            {getTransactionLabel(txn.type)}
                          </p>
                          <p className={`text-[16px] font-black shrink-0 ${['cash_collected', 'tds_deduction', 'withdrawal', 'platform_fee'].includes(txn.type)
                            ? 'text-rose-500'
                            : 'text-emerald-500'
                            }`}>
                            {['cash_collected', 'tds_deduction', 'withdrawal', 'platform_fee'].includes(txn.type) ? '-' : '+'}₹{Math.abs(txn.amount).toLocaleString()}
                          </p>
                        </div>

                        <p className="text-xs font-bold text-gray-500 truncate mb-2">{txn.description}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatDate(txn.createdAt)}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${txn.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            txn.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* View Settlements Link */}
          <button
            onClick={() => navigate('/vendor/wallet/settlements')}
            className="w-full mt-8 py-4 rounded-[16px] font-bold text-[11px] uppercase tracking-widest text-gray-600 bg-white/50 backdrop-blur-xl border border-white shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-95"
          >
            View Settlement History
            <FiArrowRight className="w-4 h-4" />
          </button>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Wallet;
