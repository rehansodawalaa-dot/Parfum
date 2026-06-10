import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User, ShoppingBag, Copy, LogOut, Package, Star, CreditCard,
  ChevronRight, Heart, Settings, MapPin, Wifi, WifiOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useWishlistStore from '../store/wishlistStore';
import useSettingsStore from '../store/settingsStore';
import api from '../lib/api';
import { formatPrice } from '../utils/format';
import SEO from '../components/SEO';
import { getCountryByName } from '../data/countries';

const STATUS_STYLE = {
  pending:    'bg-yellow-50 text-yellow-700',
  confirmed:  'bg-blue-50 text-blue-700',
  processing: 'bg-indigo-50 text-indigo-700',
  packed:     'bg-orange-50 text-orange-700',
  shipped:    'bg-purple-50 text-purple-700',
  out_for_delivery: 'bg-teal-50 text-teal-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-500',
  refunded:   'bg-stone-100 text-stone-500',
};

/* ── Orders tab ─────────────────────────────────────────────────────────── */
function OrdersTab({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders', userId],
    queryFn: () => api.get('/orders/my').then((r) => r.data.orders),
    enabled: !!userId && !userId.startsWith('demo-'),
    staleTime: 60_000,
  });

  const DEMO_ORDERS = [
    { _id: '1', orderNumber: 'JRS-20250502-DEMO1', createdAt: new Date('2025-05-02'), items: [{ name: 'Noir Absolu', quantity: 1 }], total: 15700, status: 'delivered' },
    { _id: '2', orderNumber: 'JRS-20250418-DEMO2', createdAt: new Date('2025-04-18'), items: [{ name: 'Velvet Oud', quantity: 1 }], total: 18500, status: 'shipped' },
    { _id: '3', orderNumber: 'JRS-20250303-DEMO3', createdAt: new Date('2025-03-03'), items: [{ name: 'Bois Sacré', quantity: 2 }], total: 26000, status: 'delivered' },
  ];

  const orders = data ?? (userId?.startsWith('demo-') || error ? DEMO_ORDERS : []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton rounded" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag size={48} className="text-stone-200 mx-auto mb-4" />
        <p className="font-serif text-xl text-stone-300 mb-2">No orders yet</p>
        <Link to="/shop" className="btn-dark inline-flex mt-4">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white border border-stone-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-200 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0">
              <Package size={16} className="text-stone-400" />
            </div>
            <div>
              <p className="font-sans font-semibold text-obsidian text-sm">{order.orderNumber}</p>
              <p className="font-sans text-xs text-stone-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-sans font-semibold text-obsidian">{formatPrice(order.total)}</p>
            <span className={`text-[11px] font-sans font-medium tracking-widest uppercase px-3 py-1 capitalize ${STATUS_STYLE[order.status] || STATUS_STYLE.pending}`}>
              {order.status?.replace(/_/g, ' ')}
            </span>
            {['confirmed','processing','packed','shipped','out_for_delivery'].includes(order.status) && (
              <Link
                to={`/orders/${order._id}/tracking`}
                className="flex items-center gap-1 text-xs font-sans font-medium text-gold-600 hover:text-gold-700 transition-colors"
              >
                <MapPin size={12} /> Track
              </Link>
            )}
            <ChevronRight size={14} className="text-stone-300" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Profile tab ────────────────────────────────────────────────────────── */
function ProfileTab({ user }) {
  const countryObj = getCountryByName(user?.country || '');

  return (
    <div className="max-w-md bg-white border border-stone-100 p-8">
      <h2 className="font-serif text-xl font-medium text-obsidian mb-6">Account Details</h2>
      <div className="space-y-5">
        {[
          { label: 'First Name',    value: user?.firstName || user?.name?.split(' ')[0] || '—' },
          { label: 'Last Name',     value: user?.lastName  || user?.name?.split(' ').slice(1).join(' ') || '—' },
          { label: 'Email Address', value: user?.email },
          { label: 'Phone Number',  value: user?.phoneNumber || user?.phone || '—' },
          {
            label: 'Country',
            value: countryObj ? `${countryObj.flag} ${countryObj.name}` : (user?.country || '—'),
          },
          { label: 'Account Type',  value: user?.role === 'admin' ? 'Administrator' : 'Member' },
          {
            label: 'Member Since',
            value: user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
              : '—',
          },
        ].map((f) => (
          <div key={f.label}>
            <p className="label-luxury">{f.label}</p>
            <p className="font-sans text-sm text-obsidian bg-stone-50 border border-stone-100 px-4 py-3">{f.value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-stone-400 font-sans mt-6">
        To update your details, contact{' '}
        <a href="mailto:support@jraphstreach.com" className="text-gold-600 hover:underline">
          support@jraphstreach.com
        </a>
      </p>
    </div>
  );
}

/* ── Referral tab ───────────────────────────────────────────────────────── */
function ReferralTab({ user }) {
  const copy = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast.success('Referral code copied!', {
        style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' },
      });
    }
  };

  return (
    <div className="max-w-lg">
      <div className="bg-obsidian p-8 mb-6">
        <p className="section-tag text-gold-400 mb-3">Your Referral Code</p>
        <div className="flex items-center gap-3 bg-white/5 border border-cream/20 px-5 py-4 mb-4">
          <span className="font-mono text-2xl font-bold text-gold-400 flex-1 tracking-widest">
            {user?.referralCode || '—'}
          </span>
          <button onClick={copy} className="text-cream/50 hover:text-gold-400 transition-colors" aria-label="Copy">
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
  );
}

/* ── Wishlist tab ───────────────────────────────────────────────────────── */
function WishlistTab() {
  const { items } = useWishlistStore();
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart size={48} className="text-stone-200 mx-auto mb-4" />
        <p className="font-serif text-xl text-stone-300 mb-2">No saved items</p>
        <Link to="/wishlist" className="btn-dark inline-flex mt-4">View Wishlist Page</Link>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500 font-sans">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        <Link to="/wishlist" className="text-xs font-sans font-medium tracking-widest uppercase text-gold-600 hover:underline">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.slice(0, 8).map((p) => (
          <Link key={p._id || p.id} to={`/product/${p.slug}`} className="group bg-white border border-stone-100 hover:border-stone-200 transition-colors">
            <div className="aspect-[3/4] overflow-hidden bg-stone-50">
              {p.images?.[0] && (
                <img src={p.images[0]} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
            </div>
            <div className="p-3">
              <p className="text-[10px] font-sans text-stone-400 mb-0.5 uppercase tracking-widest truncate">{p.brand}</p>
              <p className="font-serif text-sm font-medium text-obsidian leading-snug truncate">{p.name}</p>
              <p className="font-sans text-sm font-semibold text-obsidian mt-1">{formatPrice(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Settings tab ───────────────────────────────────────────────────────── */
function SettingsTab() {
  const { dataSaverEnabled, setDataSaver } = useSettingsStore();

  const handleToggle = async () => {
    await setDataSaver(!dataSaverEnabled);
    toast.success(
      dataSaverEnabled ? 'Data Saver Mode disabled.' : 'Data Saver Mode enabled.',
      { style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' } }
    );
  };

  return (
    <div className="max-w-md space-y-6">
      <div className="bg-white border border-stone-100 p-6">
        <h2 className="font-serif text-xl font-medium text-obsidian mb-1">Preferences</h2>
        <p className="text-xs text-stone-400 font-sans mb-6">Customise your browsing experience.</p>

        {/* Data Saver toggle */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {dataSaverEnabled
              ? <WifiOff size={20} className="text-gold-500 mt-0.5 flex-shrink-0" />
              : <Wifi size={20} className="text-stone-400 mt-0.5 flex-shrink-0" />
            }
            <div>
              <p className="font-sans font-medium text-sm text-obsidian">Data Saver Mode</p>
              <p className="font-sans text-xs text-stone-400 mt-0.5 leading-relaxed">
                Reduces bandwidth by disabling animations, autoplay banners, and loading compressed images. Ideal for slow connections.
              </p>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={dataSaverEnabled}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer transition-colors duration-200 focus:outline-none ${
              dataSaverEnabled ? 'bg-gold-500' : 'bg-stone-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 bg-white shadow transform transition-transform duration-200 mt-0.5 ${
                dataSaverEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-stone-50 border border-stone-100 p-4">
        <p className="text-xs text-stone-400 font-sans">
          Settings are synced to your account so they persist across devices.
        </p>
      </div>
    </div>
  );
}

/* ── Main Account page ──────────────────────────────────────────────────── */
export default function Account() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const { items: wishlistItems } = useWishlistStore();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully.');
  };

  const tabs = [
    { id: 'orders',   label: 'Orders',    icon: Package },
    { id: 'wishlist', label: 'Wishlist',  icon: Heart,    badge: wishlistItems.length || null },
    { id: 'profile',  label: 'Profile',   icon: User },
    { id: 'referral', label: 'Referrals', icon: Star },
    { id: 'settings', label: 'Settings',  icon: Settings },
  ];

  return (
    <>
      <SEO title="My Account" description="Manage your J Raph Streach orders, wishlist, profile, and settings." />
      <div className="min-h-screen bg-cream pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="section-tag mb-1">My Account</p>
              <h1 className="font-serif text-3xl font-medium text-obsidian">
                Welcome, {user?.firstName || user?.name?.split(' ')[0]}
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Member Since',  value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2025', icon: User },
              { label: 'Referrals',     value: user?.referralCount ?? 0, icon: Star },
              { label: 'Saved Items',   value: wishlistItems.length,     icon: Heart },
              { label: 'Account Type',  value: user?.role === 'admin' ? 'Admin' : 'Member', icon: CreditCard },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-stone-100 p-5">
                <s.icon size={18} className="text-gold-500 mb-3" />
                <p className="font-sans font-bold text-xl text-obsidian">{s.value}</p>
                <p className="font-sans text-xs text-stone-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap border-b border-stone-200 mb-8 gap-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-sans font-medium tracking-widest uppercase border-b-2 -mb-px transition-all duration-200 ${
                  tab === t.id
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-stone-400 hover:text-obsidian'
                }`}
              >
                <t.icon size={13} />
                {t.label}
                {t.badge > 0 && (
                  <span className="ml-0.5 bg-red-400 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {t.badge > 9 ? '9+' : t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'orders'   && <OrdersTab userId={user?.id} />}
          {tab === 'wishlist' && <WishlistTab />}
          {tab === 'profile'  && <ProfileTab user={user} />}
          {tab === 'referral' && <ReferralTab user={user} />}
          {tab === 'settings' && <SettingsTab />}

        </div>
      </div>
    </>
  );
}
