import { Check, Package, CreditCard, Cog, Archive, Truck, MapPin, CheckCircle, XCircle } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'pending',          label: 'Order Placed',        icon: Package },
  { key: 'confirmed',        label: 'Payment Confirmed',   icon: CreditCard },
  { key: 'processing',       label: 'Processing',          icon: Cog },
  { key: 'packed',           label: 'Packed',              icon: Archive },
  { key: 'shipped',          label: 'Shipped',             icon: Truck },
  { key: 'out_for_delivery', label: 'Out For Delivery',    icon: MapPin },
  { key: 'delivered',        label: 'Delivered',           icon: CheckCircle },
];

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key);

/**
 * Elegant vertical tracking timeline component.
 */
export default function OrderTimeline({ status, trackingTimeline = [], trackingNumber, courierPartner }) {
  const isCancelled = status === 'cancelled';
  const currentIdx  = STATUS_ORDER.indexOf(status);

  return (
    <div className="space-y-6">
      {/* Tracking info badge */}
      {(trackingNumber || courierPartner) && (
        <div className="bg-stone-50 border border-stone-100 px-4 py-3 flex flex-wrap gap-4">
          {courierPartner && (
            <div>
              <p className="label-luxury text-[10px]">Courier</p>
              <p className="font-sans font-medium text-sm text-obsidian">{courierPartner}</p>
            </div>
          )}
          {trackingNumber && (
            <div>
              <p className="label-luxury text-[10px]">Tracking Number</p>
              <p className="font-mono font-semibold text-sm text-obsidian">{trackingNumber}</p>
            </div>
          )}
        </div>
      )}

      {/* Cancelled state */}
      {isCancelled ? (
        <div className="flex items-center gap-4 bg-red-50 border border-red-100 p-5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle size={20} className="text-red-500" />
          </div>
          <div>
            <p className="font-sans font-semibold text-red-600">Order Cancelled</p>
            <p className="text-xs text-stone-400 font-sans mt-0.5">
              This order has been cancelled. Contact support for assistance.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isActive    = idx === currentIdx;
            const Icon        = step.icon;

            // Find matching timeline entry
            const timelineEntry = trackingTimeline
              ?.slice()
              .reverse()
              .find((t) => t.status === step.key);

            return (
              <div key={step.key} className="flex gap-4">
                {/* Icon + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      isCompleted
                        ? isActive
                          ? 'bg-gold-500 shadow-lg shadow-gold-200'
                          : 'bg-obsidian'
                        : 'bg-stone-100'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <Check size={14} className="text-cream" />
                    ) : (
                      <Icon size={14} className={isCompleted ? 'text-cream' : 'text-stone-300'} />
                    )}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 my-1 transition-all duration-500 ${
                        idx < currentIdx ? 'bg-obsidian' : 'bg-stone-100'
                      }`}
                      style={{ minHeight: '28px' }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pb-6 flex-1">
                  <p
                    className={`font-sans font-medium text-sm transition-colors ${
                      isCompleted ? 'text-obsidian' : 'text-stone-300'
                    } ${isActive ? 'text-gold-700' : ''}`}
                  >
                    {step.label}
                    {isActive && (
                      <span className="ml-2 text-[10px] font-sans font-medium tracking-widest uppercase bg-gold-100 text-gold-700 px-2 py-0.5">
                        Current
                      </span>
                    )}
                  </p>
                  {timelineEntry && (
                    <p className="text-xs text-stone-400 font-sans mt-0.5">
                      {timelineEntry.message && (
                        <span className="block">{timelineEntry.message}</span>
                      )}
                      {new Date(timelineEntry.timestamp).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
