import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiBriefcase, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';

const StatsCards = memo(({ stats }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Today's Earnings",
      value: `₹${stats.todayEarnings.toLocaleString()}`,
      icon: FaWallet,
      iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      shadowColor: 'rgba(16, 185, 129, 0.3)',
      onClick: () => navigate('/vendor/wallet')
    },
    {
      title: 'Pending Alerts',
      value: stats.pendingAlerts,
      icon: FiClock,
      iconBg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
      shadowColor: 'rgba(244, 63, 94, 0.3)',
      onClick: () => navigate('/vendor/booking-alerts')
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: FiBriefcase,
      iconBg: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
      shadowColor: 'rgba(14, 165, 233, 0.3)',
      onClick: () => navigate('/vendor/jobs')
    },
    {
      title: 'Completed Jobs',
      value: stats.completedJobs,
      icon: FiCheckCircle,
      iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      shadowColor: 'rgba(139, 92, 246, 0.3)',
      onClick: () => navigate('/vendor/jobs')
    }
  ];

  return (
    <div className="px-4 pt-4">
      <div className="grid grid-cols-2 gap-3 mb-4">
        {cards.map((card, index) => {
          const IconComponent = card.icon;

          return (
            <div
              key={index}
              onClick={card.onClick}
              className="rounded-[24px] p-5 relative overflow-hidden cursor-pointer transition-all duration-300 bg-white group hover:-translate-y-1"
              style={{
                boxShadow: '0 8px 25px -4px rgba(0,0,0,0.05), inset 0 -2px 6px rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: card.iconBg,
                    boxShadow: `0 6px 16px ${card.shadowColor}`,
                  }}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-bold mb-0.5 uppercase tracking-wide">
                    {card.title}
                  </p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

StatsCards.displayName = 'VendorStatsCards';

export default StatsCards;
