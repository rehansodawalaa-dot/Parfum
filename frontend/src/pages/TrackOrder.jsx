import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Search, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { formatPrice } from '../utils/format';

const STATUS_STYLE = {
  pending:          'bg-yellow-50 text-yellow-700',
  confirmed:        'bg-blue-50 text-blue-700',
  processing:       'bg-indigo-50 text-indigo-700',
  packed:           'bg-orange-50 text-orange-700',
  shipped:          'bg-purple-50 text-purple-700',
  out_for_delivery: 'bg-teal-50 text-teal-700',
  delivered:        'bg-green-50 text-green-700',
  cancelled:        'bg-red-50 text-red-500',
};

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

function OrderResult({ order }) {
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="bg-white border border-stone-100 p-6 mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-stone-100">
        <div>
          <p className="font-mono font-bold text-obsidian text-lg">{order.orderNumber}</p>
          <p className="font-sans text-xs text-stone-400 mt-1">
            Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className={`text-xs font-sans font-semibold tracking-widest uppercase px-3 py-1.5 w-fit ${STATUS_STYLE[order.status] || 'bg-stone-100 text-stone-500'}`}>
          {order.status?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Progress bar */}
      {order.status !== 'cancelled' && (
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-2">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex items-center gap-1">
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${i <= currentStep ? 'bg-[#1A6B4A]' : 'bg-stone-100'}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-sans text-stone-400 tracking-widest uppercase">
            <span>Placed</span>
            <span>Confirmed</span>
            <span>Packed</span>
            <span>Shipped</span>
            <span>Delivered</span>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-3 mb-6">
        <p className="text-xs font-sans font-semibold tracking-widest uppercase text-stone-400">Items</p>
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            {item.image && <img src={item.image} alt={item.name} className="w-10 h-12 object-cover bg-stone-50 flex-shrink-0" />}
            <div>
              <p className="font-sans text-sm font-medium text-obsidian">{item.name}</p>
              <p className="font-sans text-xs text-stone-400">{item.size} · Qty {item.quantity} · {formatPrice(item.price)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery address */}
      <div className="bg-stone-50 p-4 mb-6">
        <p className="text-xs font-sans font-semibold tracking-widest uppercase text-stone-400 mb-2">Delivering To</p>
        <p className="font-sans text-sm font-medium text-obsidian">{order.shippingAddress?.fullName}</p>
        <p className="font-sans text-xs text-stone-500 mt-0.5">
          {order.shippingAddress?.line1}{order.shippingAddress?.line2 ? ', ' + order.shippingAddress.line2 : ''}
        </p>
        <p className="font-sans text-xs text-stone-500">
          {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
        </p>
        <p className="font-sans text-xs text-stone-500 mt-1">📞 {order.shippingAddress?.phone}</p>
      </div>

      {/* Tracking info */}
      {order.trackingNumber && (
        <div className="border border-stone-100 p-4 mb-6">
          <p className="text-xs font-sans font-semibold tracking-widest uppercase text-stone-400 mb-1">Tracking Number</p>
          <p className="font-mono text-sm font-bold text-obsidian">{order.trackingNumber}</p>
          {order.carrier && <p className="font-sans text-xs text-stone-400 mt-0.5">via {order.carrier}</p>}
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between items-center pt-4 border-t border-stone-100">
        <span className="font-sans text-sm text-stone-500">Order Total</span>
        <span className="font-sans font-bold text-obsidian">{formatPrice(order.total)}</span>
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [submitted, setSubmitted] = useState('');

  // Fetch user's recent orders to pre-populate
  const { data: myOrders } = useQuery({
    queryKey: ['my-orders-track', user?._id],
    queryFn: () => api.get('/orders/my').then((r) => r.data.orders),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  // Fetch specific order by number when submitted
  const { data: orderData, isLoading, isError } = useQuery({
    queryKey: ['track-order', submitted],
    queryFn: () =>
      api.get('/orders/my').then((r) => {
        const found = r.data.orders.find(
          (o) => o.orderNumber.toLowerCase() === submitted.toLowerCase()
        );
        if (!found) throw new Error('Order not found');
        return found;
      }),
    enabled: !!submitted && isAuthenticated,
    retry: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmitted(orderNumber.trim());
  };

  return (
    <>
      <SEO title="Track Order" />
      <div className="min-h-screen bg-cream pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-stone-100 flex items-center justify-center mx-auto mb-5">
              <Package size={24} className="text-stone-400" />
            </div>
            <h1 className="font-serif text-3xl font-medium text-obsidian mb-2">Track Your Order</h1>
            <p className="font-sans text-stone-500 text-sm">
              Enter your order number to see the latest status and delivery details.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. JRS-20250726-AB12C"
              className="input-luxury flex-1 py-3"
            />
            <button type="submit" className="btn-dark px-5 flex items-center gap-2">
              <Search size={15} />
              Track
            </button>
          </form>

          {/* Recent orders quick links (if logged in) */}
          {isAuthenticated && myOrders?.length > 0 && !submitted && (
            <div className="mt-8">
              <p className="text-xs font-sans font-semibold tracking-widest uppercase text-stone-400 mb-3">Your Recent Orders</p>
              <div className="space-y-2">
                {myOrders.slice(0, 5).map((order) => (
                  <button
                    key={order._id}
                    onClick={() => { setOrderNumber(order.orderNumber); setSubmitted(order.orderNumber); }}
                    className="w-full flex items-center justify-between bg-white border border-stone-100 px-4 py-3 hover:border-stone-300 transition-colors group"
                  >
                    <div className="text-left">
                      <p className="font-mono text-sm font-semibold text-obsidian">{order.orderNumber}</p>
                      <p className="font-sans text-xs text-stone-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{formatPrice(order.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-sans font-semibold tracking-widest uppercase px-2 py-0.5 ${STATUS_STYLE[order.status] || 'bg-stone-100 text-stone-500'}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                      <ArrowRight size={14} className="text-stone-300 group-hover:text-obsidian transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Not logged in prompt */}
          {!isAuthenticated && (
            <div className="mt-6 text-center">
              <p className="font-sans text-xs text-stone-400 mb-3">Have an account?</p>
              <Link to="/login" className="btn-dark inline-flex text-sm">Log In to Track Orders</Link>
            </div>
          )}

          {/* Results */}
          {isLoading && (
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold-500" />
            </div>
          )}
          {isError && submitted && (
            <div className="mt-8 bg-red-50 border border-red-100 p-5 text-center">
              <p className="font-sans text-sm text-red-600 font-medium">Order not found</p>
              <p className="font-sans text-xs text-red-400 mt-1">Check the order number and try again, or{' '}
                <a href="mailto:support@jraphstreach.com" className="underline">contact support</a>.
              </p>
            </div>
          )}
          {orderData && <OrderResult order={orderData} />}

        </div>
      </div>
    </>
  );
}
