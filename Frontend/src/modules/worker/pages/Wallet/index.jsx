import React, { useState, useEffect, useLayoutEffect } from 'react';
import { BiRupee } from 'react-icons/bi';
import { FiArrowUp, FiArrowDown, FiClock, FiBell, FiX, FiImage, FiFileText, FiCreditCard, FiCalendar, FiInfo } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import workerWalletService from '../../../../services/workerWalletService';
import { toast } from 'react-hot-toast';
import LogoLoader from '../../../../components/common/LogoLoader';

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [wallet, setWallet] = useState({
    balance: 0,
    pendingPayout: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
        workerWalletService.getWallet(),
        workerWalletService.getTransactions({ limit: 50 })
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

  const handleRequestPayout = async (bookingId) => {
    if (payoutLoading) return;
    try {
      setPayoutLoading(bookingId);
      await workerWalletService.requestPayout(bookingId);
      toast.success('Payout request sent to vendor');
    } catch (error) {
      toast.error(error.message || 'Failed to request payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filter === 'all') return true;
    return txn.type === filter;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'worker_payment':
        return <FiArrowDown className="w-5 h-5 text-green-500" />;
      case 'cash_collected':
        return <FiArrowUp className="w-5 h-5 text-red-500" />;
      default:
        return <BiRupee className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'worker_payment':
        return 'Payment Received';
      case 'cash_collected':
        return 'Cash Collected';
      default:
        return type.replace('_', ' ');
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

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTransactionClick = (txn) => {
    // Only open details modal for worker_payment transactions
    if (txn.type === 'worker_payment') {
      setSelectedTransaction(txn);
    }
  };

  const viewScreenshot = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedTransaction || imageModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedTransaction, imageModalOpen]);

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
        <Header title="My Wallet" />

        <main className="px-4 py-6">
          {/* Balance Card - Premium Glassmorphic */}
          <div className="rounded-[32px] p-6 shadow-[0_20px_40px_-15px_rgba(0,128,128,0.3)] relative overflow-hidden mb-8 bg-[#0F172A] border border-white/10">
            {/* Vivid glow behind balance */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#008080]/30 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D68F35]/20 rounded-full blur-[40px] -ml-12 -mb-12"></div>

            <div className="relative z-10 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-[#008080] drop-shadow-md bg-[#008080]/10 inline-block px-2 py-0.5 rounded-full border border-[#008080]/20">
                    Available Balance
                  </p>
                  <p className="text-4xl font-black mt-2 tracking-tight">₹{wallet.balance?.toLocaleString() || 0}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-[16px] backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <span className="text-2xl font-bold text-white">₹</span>
                </div>
              </div>
              <div className="w-full bg-white/5 backdrop-blur-md text-gray-300 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest text-center border border-white/10">
                Payments are managed by your Vendor
              </div>
            </div>
          </div>

          {/* Pending Payouts List */}
          {wallet.pendingBookings?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-2 mb-4">Pending Payments</h3>
              <div className="space-y-3">
                {wallet.pendingBookings.map(booking => (
                  <div key={booking._id} className="bg-white/70 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_8px_30px_rgba(249,115,22,0.1)] border border-orange-500/20 flex justify-between items-center group hover:-translate-y-1 transition-all duration-300">
                    <div className="min-w-0">
                      <p className="font-black text-gray-900 text-sm mb-1 truncate">{booking.serviceName}</p>
                      <p className="text-[11px] text-gray-500 font-bold mb-1.5 uppercase tracking-wide">Booking #{booking.bookingNumber}</p>
                      <p className="text-[10px] text-gray-400 font-semibold bg-gray-100/50 inline-block px-2 py-0.5 rounded-md">
                        Completed: {new Date(booking.completedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRequestPayout(booking._id)}
                      disabled={payoutLoading === booking._id}
                      className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-[14px] active:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(249,115,22,0.3)]"
                    >
                      {payoutLoading === booking._id ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <FiBell className="w-4 h-4" />
                          Ask Vendor
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide px-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'worker_payment', label: 'Payments' },
              { id: 'cash_collected', label: 'Cash Collected' },
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
                  <FiCreditCard className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-black text-gray-900 mb-1">No transactions yet</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                  Your payments will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((txn) => (
                  <div
                    key={txn._id}
                    onClick={() => handleTransactionClick(txn)}
                    className={`bg-white/70 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white group transition-all duration-300 ${txn.type === 'worker_payment' ? 'cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: txn.type === 'cash_collected' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'
                        }}
                      >
                        {getTransactionIcon(txn.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-black text-gray-900 text-[15px] truncate pr-2">
                            {getTransactionLabel(txn.type)}
                          </p>
                          <p className={`text-lg font-black shrink-0 ${txn.type === 'cash_collected' ? 'text-red-500' : 'text-green-500'}`}>
                            {txn.type === 'cash_collected' ? '-' : '+'}₹{Math.abs(txn.amount).toLocaleString()}
                          </p>
                        </div>

                        <p className="text-xs font-bold text-gray-500 truncate mb-2">{txn.description}</p>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatDate(txn.createdAt)}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${txn.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                            txn.status === 'pending' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                            {txn.status}
                          </span>
                          {txn.type === 'worker_payment' && (
                            <span className="text-[10px] text-[#008080] font-black uppercase tracking-widest ml-auto opacity-0 group-hover:opacity-100 transition-opacity">Details →</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#0F172A] text-white px-6 py-5 rounded-t-3xl flex items-center justify-between z-10 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[16px] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <span className="text-xl font-bold">₹</span>
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight">Payment Details</h3>
                    <p className="text-[10px] font-bold text-[#008080] uppercase tracking-widest">Transaction Info</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="w-10 h-10 rounded-[14px] bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Amount Section */}
                <div className="text-center pb-6 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Amount Received</p>
                  <p className="text-4xl font-black text-green-600">₹{selectedTransaction.amount?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDateTime(selectedTransaction.createdAt)}</p>
                </div>

                {/* Screenshot */}
                {selectedTransaction.metadata?.screenshot && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FiImage className="w-5 h-5 text-teal-600" />
                      <h4 className="font-bold text-gray-900">Payment Proof</h4>
                    </div>
                    <div
                      className="relative rounded-2xl overflow-hidden border-2 border-gray-100 cursor-pointer hover:border-teal-500 transition-colors group"
                      onClick={() => viewScreenshot(selectedTransaction.metadata.screenshot)}
                    >
                      <img
                        src={selectedTransaction.metadata.screenshot}
                        alt="Payment Screenshot"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23f3f4f6" width="400" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="100" dx="120"%3EImage not available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                          <p className="text-sm font-bold text-gray-900">Click to enlarge</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                {selectedTransaction.metadata?.paymentMethod && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FiCreditCard className="w-5 h-5 text-teal-600" />
                      <h4 className="font-bold text-gray-900">Payment Method</h4>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 font-semibold capitalize">
                        {selectedTransaction.metadata.paymentMethod === 'hand_to_hand'
                          ? 'Cash / Hand-to-Hand'
                          : selectedTransaction.metadata.paymentMethod}
                      </p>
                    </div>
                  </div>
                )}

                {/* Transaction ID */}
                {selectedTransaction.metadata?.transactionId && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FiFileText className="w-5 h-5 text-teal-600" />
                      <h4 className="font-bold text-gray-900">Transaction ID</h4>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 font-mono text-sm break-all">{selectedTransaction.metadata.transactionId}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedTransaction.metadata?.notes && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FiInfo className="w-5 h-5 text-teal-600" />
                      <h4 className="font-bold text-gray-900">Payment Notes</h4>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedTransaction.metadata.notes}</p>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-teal-50 rounded-xl p-4">
                    <p className="text-xs text-teal-600 font-semibold mb-1">Status</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{selectedTransaction.status}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Type</p>
                    <p className="text-sm font-bold text-gray-900">Payment Received</p>
                  </div>
                </div>

                {/* Description */}
                {selectedTransaction.description && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-2">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedTransaction.description}</p>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Fullscreen Modal */}
      <AnimatePresence>
        {imageModalOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[10001] flex items-center justify-center p-4"
            onClick={() => setImageModalOpen(false)}
          >
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            >
              <FiX className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedImage}
              alt="Payment Screenshot"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide BottomNav when modal is open */}
      {!selectedTransaction && !imageModalOpen && <BottomNav />}
    </div>
  );
};

export default Wallet;
