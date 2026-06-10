import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle, ArrowLeft, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { formatPrice } from '../utils/format';
import SEO from '../components/SEO';

const TAX_RATE = 0.18;

const INITIAL_ADDRESS = {
  fullName: '', phone: '', email: '',
  line1: '', line2: '', city: '', state: '', pincode: '',
};

/* ── Address form ─────────────────────────────────────────────────────────── */
function AddressForm({ address, onChange, errors }) {
  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label htmlFor={name} className="label-luxury">{label}</label>
      <input
        id={name} name={name} type={type}
        value={address[name]} onChange={onChange}
        placeholder={placeholder}
        className={`input-luxury ${errors[name] ? 'border-red-400' : ''}`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1 font-sans">{errors[name]}</p>}
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('fullName', 'Full Name *', 'text', 'Jane Doe')}
        {field('phone', 'Phone Number *', 'tel', '9876543210')}
      </div>
      {field('email', 'Email Address *', 'email', 'jane@example.com')}
      {field('line1', 'Address Line 1 *', 'text', 'House / Flat / Block No.')}
      {field('line2', 'Address Line 2 (Optional)', 'text', 'Street, Area, Locality')}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {field('city', 'City *', 'text', 'Mumbai')}
        {field('state', 'State *', 'text', 'Maharashtra')}
        {field('pincode', 'PIN Code *', 'text', '400001')}
      </div>
    </div>
  );
}

/* ── Order summary ────────────────────────────────────────────────────────── */
function OrderSummary({ items, subtotal, tax, shipping, total }) {
  return (
    <div className="bg-white border border-stone-100 p-6 sticky top-24">
      <h3 className="font-serif text-lg font-medium text-obsidian mb-5">Order Summary</h3>
      <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
        {items.map(({ product, size, quantity }) => (
          <div key={`${product.id}-${size}`} className="flex gap-3">
            <img src={product.images[0]} alt={product.name} className="w-14 h-16 object-cover bg-stone-50 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-medium text-obsidian truncate">{product.name}</p>
              <p className="font-sans text-xs text-stone-400">{size} · Qty {quantity}</p>
              <p className="font-sans text-sm font-semibold text-obsidian mt-1">{formatPrice(product.price * quantity)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm font-sans text-stone-500">
          <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-sans text-stone-500">
          <span>GST (18%)</span><span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between text-sm font-sans text-stone-500">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between font-sans font-semibold text-obsidian pt-2 border-t border-stone-100">
          <span>Total</span><span className="text-lg">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Success screen ───────────────────────────────────────────────────────── */
function SuccessScreen({ orderNumber }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center pt-20 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="font-serif text-3xl font-medium text-obsidian mb-3">Order Confirmed!</h2>
        <p className="text-stone-500 font-sans mb-2">
          Thank you for your purchase. We'll send a confirmation to your email.
        </p>
        {orderNumber && (
          <div className="bg-stone-50 border border-stone-100 px-4 py-3 my-5 inline-block">
            <p className="text-xs font-sans text-stone-400 tracking-widest uppercase mb-1">Order Number</p>
            <p className="font-mono font-bold text-obsidian">{orderNumber}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <Link to="/account" className="btn-dark flex items-center gap-2">
            <Package size={16} /> View My Orders
          </Link>
          <Link to="/shop" className="btn-outline-gold">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

/* ── Razorpay loader ──────────────────────────────────────────────────────── */
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function Checkout() {
  const navigate  = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [address, setAddress] = useState({
    ...INITIAL_ADDRESS,
    fullName: user?.name || '',
    email:    user?.email || '',
  });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const tax      = Math.round(subtotal * TAX_RATE);
  const shipping = subtotal >= 3000 ? 0 : 299;
  const total    = subtotal + tax + shipping;

  const handleChange = (e) => setAddress((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!address.fullName.trim())                          e.fullName = 'Full name is required';
    if (!/^\d{10}$/.test(address.phone.replace(/\s/g,''))) e.phone    = 'Enter a valid 10-digit phone number';
    if (!/\S+@\S+\.\S+/.test(address.email))               e.email    = 'Enter a valid email';
    if (!address.line1.trim())                             e.line1    = 'Address is required';
    if (!address.city.trim())                              e.city     = 'City is required';
    if (!address.state.trim())                             e.state    = 'State is required';
    if (!/^\d{6}$/.test(address.pincode))                  e.pincode  = 'Enter a valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;
    if (items.length === 0) { toast.error('Your cart is empty.'); return; }

    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Could not load payment gateway. Check your connection.'); setLoading(false); return; }

      // Build order payload
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.product.id || i.product._id,
          name:      i.product.name,
          size:      i.size,
          quantity:  i.quantity,
        })),
        shippingAddress: {
          fullName: address.fullName,
          phone:    address.phone.replace(/\s/g, ''),
          email:    address.email,
          line1:    address.line1,
          line2:    address.line2,
          city:     address.city,
          state:    address.state,
          pincode:  address.pincode,
        },
      };

      // Create order on backend
      let orderData = null;
      if (isAuthenticated) {
        try {
          const { data } = await api.post('/orders/create', orderPayload);
          orderData = data.order;
        } catch (err) {
          // If backend unavailable, proceed with direct Razorpay (demo mode)
          if (err.response) throw err;
        }
      }

      const options = {
        key:         orderData?.key || import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount:      (orderData?.amount) || total * 100,
        currency:    'INR',
        name:        'J Raph Streach',
        description: `Order — ${items.length} item(s)`,
        order_id:    orderData?.razorpayOrderId,
        prefill:     { name: address.fullName, email: address.email, contact: address.phone },
        notes:       { address: `${address.line1}, ${address.city}` },
        theme:       { color: '#d4a843' },
        handler: async (response) => {
          try {
            if (isAuthenticated && orderData) {
              const verifyRes = await api.post('/orders/verify', {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });
              setOrderNumber(verifyRes.data.order.orderNumber);
            } else {
              setOrderNumber('JRS-DEMO-' + Date.now().toString().slice(-6));
            }
            clearCart();
            setSuccess(true);
          } catch {
            toast.error('Payment verification failed. Contact support if amount was deducted.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => { toast('Payment cancelled.', { icon: 'ℹ️' }); setLoading(false); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        toast.error(`Payment failed: ${r.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen orderNumber={orderNumber} />;
  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <>
      <SEO title="Checkout" />
      <div className="min-h-screen bg-cream pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-widest uppercase text-stone-400 hover:text-obsidian transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Cart
          </Link>
          <h1 className="font-serif text-3xl font-medium text-obsidian mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {/* Address */}
              <div className="bg-white border border-stone-100 p-6">
                <h2 className="font-serif text-xl font-medium text-obsidian mb-6">Delivery Address</h2>
                <AddressForm address={address} onChange={handleChange} errors={errors} />
              </div>

              {/* Payment info */}
              <div className="bg-white border border-stone-100 p-6">
                <h2 className="font-serif text-xl font-medium text-obsidian mb-4">Payment</h2>
                <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-100">
                  <Shield size={20} className="text-gold-500 flex-shrink-0" />
                  <div>
                    <p className="font-sans text-sm font-medium text-obsidian">Secure Payment via Razorpay</p>
                    <p className="font-sans text-xs text-stone-400 mt-0.5">
                      Supports UPI, cards, net banking &amp; wallets. 256-bit SSL encrypted.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'Wallets'].map((m) => (
                    <span key={m} className="text-[10px] font-sans font-medium tracking-widest uppercase border border-stone-200 px-2.5 py-1 text-stone-500">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <button onClick={handlePayment} disabled={loading} className="btn-dark w-full text-base py-4">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-cream" />
                    Processing…
                  </span>
                ) : `Pay ${formatPrice(total)} Securely`}
              </button>

              <p className="text-center text-xs text-stone-400 font-sans">
                By placing your order you agree to our{' '}
                <a href="#" className="underline hover:text-obsidian">Terms of Service</a> and{' '}
                <a href="#" className="underline hover:text-obsidian">Privacy Policy</a>.
              </p>
            </div>

            <div className="lg:col-span-2">
              <OrderSummary items={items} subtotal={subtotal} tax={tax} shipping={shipping} total={total} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
