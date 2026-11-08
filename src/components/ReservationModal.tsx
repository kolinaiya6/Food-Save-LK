import React, { useState } from 'react';
import { X, Clock, MapPin, AlertCircle, CheckCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { FoodDeal, Reservation, Voucher } from '../types';

interface ReservationModalProps {
  deal: FoodDeal | null;
  onClose: () => void;
  onConfirmReservation: (data: {
    dealId: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
  }) => { success: boolean; reservation?: Reservation; voucher?: Voucher; error?: string };
  onSuccess: (reservation: Reservation, voucher: Voucher) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  deal,
  onClose,
  onConfirmReservation,
  onSuccess
}) => {
  if (!deal) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const totalAmount = deal.discounted_price * quantity;
  const originalTotal = deal.original_price * quantity;
  const savings = originalTotal - totalAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('කරුණාකර ඔබේ නම ඇතුළත් කරන්න.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      setErrorMsg('කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 0771234567).');
      return;
    }

    setIsSubmitting(true);
    const result = onConfirmReservation({
      dealId: deal.id,
      quantity,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setIsSubmitting(false);

    if (result.success && result.reservation && result.voucher) {
      onSuccess(result.reservation, result.voucher);
    } else {
      setErrorMsg(result.error || 'වෙන්කිරීම සිදු කිරීමට නොහැකි විය.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                කෑම පැකේජය වෙන්කර ගන්න
              </h3>
              <p className="text-xs text-slate-500">
                නොමිලේ Reservation කර කඩේදී මුදල් ගෙවන්න
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Deal Summary Box */}
          <div className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <img
              src={deal.image_url}
              alt={deal.title}
              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-emerald-700 truncate">
                {deal.store_name}
              </p>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                {deal.title}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{deal.store_address || deal.store_city}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                <span>ලබාගැනීම: {deal.pickup_start} - {deal.pickup_end} ({deal.pickup_date})</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              පැකේජ ප්‍රමාණය (උපරිම: {deal.quantity_available})
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-xl font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-slate-900 font-mono text-base">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(deal.quantity_available, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-xl font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="text-right flex-1">
                <span className="text-xs text-slate-500 block">ගෙවිය යුතු මුළු මුදල:</span>
                <span className="text-xl font-extrabold text-emerald-700 tabular-nums">
                  රු. {totalAmount.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-600 block">
                  (ඔබේ ඉතිරිය: රු. {savings.toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Pay At Store Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>කඩේට ගිය පසු එහිදී මුදල් ගෙවන්න.</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              ඔබට අන්තර්ජාලය හරහා මුදල් ගෙවීමට අවශ්‍ය නැත. කෑම ලබාගන්නා අවස්ථාවේදී කඩයට මුදල් ගෙවන්න.
            </p>
          </div>

          {/* Customer Details Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                ඔබේ සම්පූර්ණ නම *
              </label>
              <input
                type="text"
                required
                placeholder="උදා: කසුන් ජයවර්ධන"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ජංගම දුරකථන අංකය *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0771234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ඊමේල් ලිපිනය (විකල්ප)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                වෙළඳසැලට සටහනක් (විකල්ප)
              </label>
              <input
                type="text"
                placeholder="උදා: සවස 6:30 ට පැමිණෙමි"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'සකසමින්...' : 'වෙන්කිරීම තහවුරු කරන්න'}</span>
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              කිසිදු පෙර ගෙවීමක් නැත · කඩේදී QR වවුචරය පෙන්වා මුදල් ගෙවන්න
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
