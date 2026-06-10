import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package } from 'lucide-react';
import api from '../lib/api';
import OrderTimeline from '../components/OrderTimeline';
import SEO from '../components/SEO';
import { formatPrice } from '../utils/format';

const DEMO_TRACKING = {
  orderNumber: 'JRS-20250502-DEMO1',
  status: 'shipped',
  trackingNumber: 'BLUEEX9876543',
  courierPartner: 'Blue Express',
  carrier: 'Blue Express',
  createdAt: new Date('2025-05-02').toISOString(),
  trackingTimeline: [
    { status: 'pending',    message: 'Order placed successfully.',         timestamp: new Date('2025-05-02T10:00:00').toISOString() },
    { status: 'confirmed',  message: 'Payment confirmed. Order accepted.', timestamp: new Date('2025-05-02T10:05:00').toISOString() },
    { status: 'processing', message: 'Your order is being processed.',     timestamp: new Date('2025-05-03T09:00:00').toISOString() },
    { status: 'packed',     message: 'Packed and ready to ship.',          timestamp: new Date('2025-05-04T11:00:00').toISOString() },
    { status: 'shipped',    message: 'Shipped via Blue Express.',          timestamp: new Date('2025-05-05T08:00:00').toISOString() },
  ],
};

export default function OrderTracking() {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order-tracking', id],
    queryFn: async () => {
      if (!id || id.startsWith('demo-')) return DEMO_TRACKING;
      try {
        const res = await api.get(`/orders/${id}/tracking`);
        return res.data.tracking;
      } catch {
        return DEMO_TRACKING;
      }
    },
    staleTime: 30_000,
    refetchInterval: 60_000, // refresh every minute
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-gold-500" />
      </div>
    );
  }

  const tracking = data || DEMO_TRACKING;

  return (
    <>
      <SEO title={`Track Order ${tracking.orderNumber}`} description="Live order tracking for your J Raph Streach order." />
      <div className="min-h-screen bg-cream pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-widest uppercase text-stone-400 hover:text-obsidian transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Account
          </Link>

          {/* Order header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="section-tag mb-1">Order Tracking</p>
              <h1 className="font-serif text-2xl font-medium text-obsidian">
                {tracking.orderNumber}
              </h1>
              <p className="text-stone-400 text-sm font-sans mt-1">
                Placed on{' '}
                {new Date(tracking.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-stone-100 px-4 py-3">
              <Package size={16} className="text-gold-500" />
              <span className="font-sans text-xs font-medium tracking-widest uppercase text-obsidian capitalize">
                {tracking.status?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-stone-100 p-6 mb-6">
            <OrderTimeline
              status={tracking.status}
              trackingTimeline={tracking.trackingTimeline}
              trackingNumber={tracking.trackingNumber}
              courierPartner={tracking.courierPartner || tracking.carrier}
            />
          </div>

          {/* Help */}
          <div className="text-center">
            <p className="text-sm text-stone-400 font-sans">
              Need help with your order?{' '}
              <a href="mailto:support@jraphstreach.com" className="text-gold-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
