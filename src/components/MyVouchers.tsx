import React, { useState } from 'react';
import { Search, Ticket, Clock, MapPin, CheckCircle, AlertCircle, Eye, Printer, ChevronRight } from 'lucide-react';
import { Voucher, Reservation } from '../types';

interface MyVouchersProps {
  vouchers: Voucher[];
  reservations: Reservation[];
  onViewVoucherModal: (voucher: Voucher) => void;
}

export const MyVouchers: React.FC<MyVouchersProps> = ({
  vouchers,
  reservations,
  onViewVoucherModal,
}) => {
  const [searchPhoneOrId, setSearchPhoneOrId] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'redeemed'>('all');

  const filteredVouchers = vouchers.filter((v) => {
    // Status filter
    if (filterStatus === 'active' && v.is_redeemed) return false;
    if (filterStatus === 'redeemed' && !v.is_redeemed) return false;

    // Search query
    if (searchPhoneOrId.trim()) {
      const q = searchPhoneOrId.trim().toLowerCase();
      const matchOrder = v.order_number.toLowerCase().includes(q);
      const matchPhone = v.customer_phone.includes(q);
      const matchName = v.customer_name.toLowerCase().includes(q);
      return matchOrder || matchPhone || matchName;
    }
    return true;
  });

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Ticket className="w-3.5 h-3.5" />
            <span>ඔබේ වෙන්කිරීම් සහ QR කේත</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            මගේ වවුචර් (My Vouchers)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            කඩයට පෙන්වීම සඳහා ඔබ වෙන්කරගත් සියලුම ආහාර පැකේජ මෙතැනින් බලන්න.
          </p>
        </div>

        {/* Search & Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="දුරකථන අංකය හෝ Order ID (උදා: KS-2026...) ඇතුළත් කරන්න"
                value={searchPhoneOrId}
                onChange={(e) => setSearchPhoneOrId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                සියල්ල ({vouchers.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ලබාගත යුතු ({vouchers.filter(v => !v.is_redeemed).length})
              </button>
              <button
                onClick={() => setFilterStatus('redeemed')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === 'redeemed'
                    ? 'bg-slate-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ලබාගත් ({vouchers.filter(v => v.is_redeemed).length})
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            * ගිණුමක් නොමැතිව වෙන්කළේ නම් ඔබ ඇතුළත් කළ දුරකථන අංකය මගින් වවුචර සොයාගත හැක.
          </p>
        </div>

        {/* Voucher List */}
        {filteredVouchers.length > 0 ? (
          <div className="space-y-4">
            {filteredVouchers.map((voucher) => {
              const res = reservations.find(r => r.order_number === voucher.order_number);
              return (
                <div
                  key={voucher.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {voucher.order_number}
                      </span>
                      {voucher.is_redeemed ? (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          කෑම ලබාගෙන අවසන් (Redeemed)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          ලබාගැනීමට සූදානම් (වෙන්කර ඇත)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {voucher.deal_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{voucher.store_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{voucher.pickup_date} ({voucher.pickup_time_range})</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 pt-1">
                      පාරිභෝගික: <strong className="text-slate-800">{voucher.customer_name}</strong> ({voucher.customer_phone}) · පැකේජ {voucher.quantity} ක්
                    </div>
                  </div>

                  {/* Pricing & View Button */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-2 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-slate-400 block">කඩේදී ගෙවිය යුතු මුදල:</span>
                      <span className="text-lg font-extrabold text-emerald-700 font-mono tabular-nums">
                        රු. {voucher.total_amount.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => onViewVoucherModal(voucher)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>QR වවුචරය බලන්න</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">
              වවුචර් හමු නොවීය
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              ඔබ තවමත් කිසිදු කෑම පැකේජයක් වෙන්කර නොමැත, නැතහොත් සෙවූ දුරකථන අංකයට අදාළ වවුචර් නොමැත.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
