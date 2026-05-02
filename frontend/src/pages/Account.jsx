import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Copy, LogOut, Package, Star, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { formatPrice } from '../utils/format';

/* ── Mock order history (replace with API call when backend orders exist) ── */
const MOCK_ORDERS = [
  { id: 'ORD-2025-001', date: '2 May 2025',   items: 2, total: 17000, status: 'Delivered' },
  { id: 'ORD-2025-002', date: '18 Apr 2025',  items: 1, total: 8500,  status: 'Delivered' },
  { id: 'ORD-2025-003', date: '3 Mar 2025',   items: 3, total: 24200, status: 'Delivered' },
];

const STATUS_STYLE = {
  Delivered:  'bg-green-50 text-green-700',
  Processing: 'bg-gold-50 text-gold-700',
  Shipped:    'bg-blue-50 text-blue-700',
  Cancelled:  'bg-red-50 text-red-500',
};

export default function Account() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully.');
  };

  const copyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast.success('Referral code copied!', {
        style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' },
      });
    }
  };

  const tabs = [
    { id: 'orders',   label: 'My Orders',    icon: Package },
    { id: 'profile',  label: 'Profile',      icon: User },
    { id: 'referral', label: 'Refer & Earn', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="section-tag mb-1">My Account</p>
            <h1 className="font-serif text-3xl font-medium text-obsidian">
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-stone-400 text-sm font-sans mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-sans font-medium tracking-widest uppercase text-stone-400 hover:text-red-500 transition-colors mt-1"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Orders',   value: MOCK_ORDERS.length,                          icon: ShoppingBag },
            { label: 'Total Spent',    value: formatPrice(MOCK_ORDERS.reduce((s,o)=>s+o.total,0)), icon: CreditCard },
            { label: 'Referrals',      value: user?.referralCount ?? 0,                    icon: Star },
            { label: 'Member Since',   value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2025', icon: User },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-stone-100 p-5">
              <s.icon size={18} className="text-gold-500 mb-3" />
              <p className="font-sans font-bold text-xl text-obsidian">{s.value}</p>
              <p className="font-sans text-xs text-stone-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-sans font-medium tracking-widest uppercase border-b-2 -mb-px transition-all duration-200 ${
                tab === t.id
                  ? 'border-gold-500 text-gold-600'
                  : 'border-transparent text-stone-400 hover:text-obsidian'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Orders ── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {MOCK_ORDERS.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag size={48} className="text-stone-200 mx-auto mb-4" />
                <p className="font-serif text-xl text-stone-300 mb-2">No orders yet</p>
                <Link to="/shop" className="btn-dark mt-4 inline-flex">Start Shopping</Link>
              </div>
            ) : (
              MOCK_ORDERS.map((order) => (
                <div key={order.id} className="bg-white border border-stone-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone-50 border border-stone-100 flex items-center justify-center">
                      <Package size={18} className="text-stone-400" />
                    </div>
                    <div>
                      <p className="font-sans font-semibold text-obsidian text-sm">{order.id}</p>
                      <p className="font-sans text-xs text-stone-400 mt-0.5">{order.date} · {order.items} item{order.items > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-sans font-semibold text-obsidian">{formatPrice(order.total)}</p>
                    <span className={`text-[11px] font-sans font-medium tracking-widest uppercase px-3 py-1 ${STATUS_STYLE[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <div className="max-w-md bg-white border border-stone-100 p-8">
            <h2 className="font-serif text-xl font-medium text-obsidian mb-6">Account Details</h2>
            <div className="space-y-5">
              <div>
                <p className="label-luxury">Full Name</p>
                <p className="font-sans text-sm text-obsidian bg-stone-50 border border-stone-100 px-4 py-3">{user?.name}</p>
              </div>
              <div>
                <p className="label-luxury">Email Address</p>
                <p className="font-sans text-sm text-obsidian bg-stone-50 border border-stone-100 px-4 py-3">{user?.email}</p>
              </div>
              <div>
                <p className="label-luxury">Account Type</p>
                <p className="font-sans text-sm text-obsidian bg-stone-50 border border-stone-100 px-4 py-3 capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="label-luxury">Member Since</p>
                <p className="font-sans text-sm text-obsidian bg-stone-50 border border-stone-100 px-4 py-3">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-400 font-sans mt-6">
              To update your details, contact{' '}
              <a href="mailto:support@parfum.in" className="text-gold-600 hover:underline">support@parfum.in</a>
            </p>
          </div>
        )}

        {/* ── Referral ── */}
        {tab === 'referral' && (
          <div className="max-w-lg">
            <div className="bg-obsidian p-8 mb-6">
              <p className="section-tag text-gold-400 mb-3">Your Referral Code</p>
              <div className="flex items-center gap-3 bg-white/5 border border-cream/20 px-5 py-4 mb-4">
                <span className="font-mono text-2xl font-bold text-gold-400 flex-1 tracking-widest">
                  {user?.referralCode || '—'}
                </span>
                <button
                  onClick={copyReferral}
                  className="text-cream/50 hover:text-gold-400 transition-colors"
                  aria-label="Copy referral code"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-cream/50 text-sm font-sans">
                Share this code with friends. When they sign up, you both get rewarded.
              </p>
            </div>

            <div className="bg-white border border-stone-100 p-6">
              <h3 className="font-serif text-lg font-medium text-obsidian mb-4">How it works</h3>
              <div className="space-y-4">
                {[
                  { step: '01', text: 'Share your unique referral code with friends' },
                  { step: '02', text: 'They sign up using your code' },
                  { step: '03', text: 'You both receive exclusive rewards on your next order' },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <span className="font-display text-2xl font-light text-gold-400 leading-none">{s.step}</span>
                    <p className="font-sans text-sm text-stone-600 pt-1">{s.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-stone-100">
                <p className="font-sans text-sm text-stone-500">
                  Total referrals: <span className="font-semibold text-obsidian">{user?.referralCount ?? 0}</span>
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
