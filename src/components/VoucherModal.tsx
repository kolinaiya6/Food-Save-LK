import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Store, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  User, 
  Coins, 
  AlertCircle 
} from 'lucide-react';
import { Voucher, Reservation } from '../types';

interface VoucherModalProps {
  voucher: Voucher | null;
  reservation?: Reservation;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  voucher,
  reservation,
  onClose
}) => {
  if (!voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Printable Area */}
        <div id="printable-voucher" className="p-6 space-y-5 bg-white">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase block">
                කෑම සුරකින්නෝ · QR වවුචරය
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {voucher.order_number}
              </h3>
            </div>
            <div className="no-print">
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Success Banner */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center gap-2.5 text-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              වෙන්කිරීම සාර්ථකයි! කඩේදී මුදල් ගෙවා කෑම ලබාගන්න.
            </span>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
              <QRCodeSVG
                value={voucher.qr_data}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="font-mono text-xs font-bold text-slate-600 mt-3 tracking-widest">
              {voucher.order_number}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              වෙළඳසැලට පෙන්වීමට මෙම QR කේතය භාවිත කරන්න
            </p>
          </div>

          {/* Voucher Details Card */}
          <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs text-slate-700">
            
            <div className="flex items-start justify-between">
              <span className="text-slate-500">කෑම පැකේජය:</span>
              <span className="font-bold text-slate-900 text-right max-w-[65%] truncate">
                {voucher.deal_title}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">ප්‍රමාණය:</span>
              <span className="font-bold text-slate-900">
                පැකේජ {voucher.quantity}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500">වෙළඳසැල:</span>
              <span className="font-bold text-emerald-800 text-right max-w-[65%]">
                {voucher.store_name}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500">ලිපිනය:</span>
              <span className="text-slate-700 text-right max-w-[65%]">
                {voucher.store_address}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">ලබාගැනීමේ දිනය සහ වේලාව:</span>
              <span className="font-semibold text-slate-900">
                {voucher.pickup_date} ({voucher.pickup_time_range})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">පාරිභෝගික නම:</span>
              <span className="font-medium text-slate-900">
                {voucher.customer_name} ({voucher.customer_phone})
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900">කඩේදී ගෙවිය යුතු මුදල:</span>
              <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">
                රු. {voucher.total_amount.toLocaleString()}
              </span>
            </div>

          </div>

          {/* Sinhala Instruction Notice */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2">
            <Coins className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>උපදෙස:</strong> කඩයට ගොස් මෙම QR සංකේතය පෙන්වා ඔබේ කෑම පැකේජය ලබාගන්න. මුදල් කඩයේදී ගෙවන්න.
            </p>
          </div>

        </div>

        {/* Modal Action Buttons (No-print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 no-print">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>මුද්‍රණය / සුරකින්න</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            හරි, තේරුණා
          </button>
        </div>

      </div>
    </div>
  );
};
