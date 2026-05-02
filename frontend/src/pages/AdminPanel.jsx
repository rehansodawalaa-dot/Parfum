import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Package, Users, BarChart3,
  Plus, Pencil, Trash2, X, Check, AlertTriangle,
  TrendingUp, IndianRupee, UserCheck, ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { formatPrice } from '../utils/format';
import { PRODUCTS as SAMPLE_PRODUCTS } from '../data/products';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PRODUCT FORM MODAL                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: '', slug: '', brand: '', category: 'men', fragranceType: 'woody',
  price: '', originalPrice: '', sizes: '30ml, 50ml, 100ml',
  images: '', description: '', brandStory: '',
  notes_top: '', notes_middle: '', notes_base: '',
  isBestSeller: false, isNew: true, stock: 100,
};

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product
      ? {
          ...product,
          sizes:        product.sizes?.join(', ') || '',
          images:       product.images?.join(', ') || '',
          notes_top:    product.notes?.top?.join(', ') || '',
          notes_middle: product.notes?.middle?.join(', ') || '',
          notes_base:   product.notes?.base?.join(', ') || '',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price:         Number(form.price),
      originalPrice: Number(form.originalPrice),
      stock:         Number(form.stock),
      sizes:         form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      images:        form.images.split(',').map((s) => s.trim()).filter(Boolean),
      notes: {
        top:    form.notes_top.split(',').map((s) => s.trim()).filter(Boolean),
        middle: form.notes_middle.split(',').map((s) => s.trim()).filter(Boolean),
        base:   form.notes_base.split(',').map((s) => s.trim()).filter(Boolean),
      },
    };
    delete payload.notes_top; delete payload.notes_middle; delete payload.notes_base;
    await onSave(payload);
    setSaving(false);
  };

  const Field = ({ label, name, type = 'text', placeholder = '' }) => (
    <div>
      <label className="label-luxury">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        className="input-luxury"
      />
    </div>
  );

  const Select = ({ label, name, options }) => (
    <div>
      <label className="label-luxury">{label}</label>
      <select value={form[name]} onChange={(e) => set(name, e.target.value)} className="input-luxury cursor-pointer">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-obsidian/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-white w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-serif text-xl font-medium text-obsidian">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-obsidian transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Product Name *" name="name" placeholder="Noir Absolu" />
            <Field label="Slug (auto-generated if blank)" name="slug" placeholder="noir-absolu" />
            <Field label="Brand *" name="brand" placeholder="Maison Élite" />
            <Field label="Stock" name="stock" type="number" placeholder="100" />
            <Field label="Price (₹) *" name="price" type="number" placeholder="8500" />
            <Field label="Original Price (₹) *" name="originalPrice" type="number" placeholder="10000" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Category *" name="category" options={[
              { value: 'men',     label: 'For Him' },
              { value: 'women',   label: 'For Her' },
              { value: 'unisex',  label: 'Unisex' },
              { value: 'premium', label: 'Premium' },
            ]} />
            <Select label="Fragrance Type *" name="fragranceType" options={[
              { value: 'woody',    label: 'Woody' },
              { value: 'floral',   label: 'Floral' },
              { value: 'citrus',   label: 'Citrus' },
              { value: 'oriental', label: 'Oriental' },
              { value: 'fresh',    label: 'Fresh' },
              { value: 'aquatic',  label: 'Aquatic' },
            ]} />
          </div>

          <Field label="Sizes (comma-separated)" name="sizes" placeholder="30ml, 50ml, 100ml" />
          <Field label="Image URLs (comma-separated)" name="images" placeholder="https://..." />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Top Notes" name="notes_top" placeholder="Bergamot, Pepper" />
            <Field label="Heart Notes" name="notes_middle" placeholder="Oud, Rose" />
            <Field label="Base Notes" name="notes_base" placeholder="Sandalwood, Musk" />
          </div>

          <div>
            <label className="label-luxury">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="A bold, commanding fragrance…"
              className="input-luxury resize-none"
            />
          </div>

          <div>
            <label className="label-luxury">Brand Story</label>
            <textarea
              value={form.brandStory}
              onChange={(e) => set('brandStory', e.target.value)}
              rows={2}
              placeholder="Founded in Grasse, France…"
              className="input-luxury resize-none"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isBestSeller}
                onChange={(e) => set('isBestSeller', e.target.checked)}
                className="w-4 h-4 accent-gold-500"
              />
              <span className="text-sm font-sans text-stone-600">Best Seller</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => set('isNew', e.target.checked)}
                className="w-4 h-4 accent-gold-500"
              />
              <span className="text-sm font-sans text-stone-600">New Arrival</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-stone-100">
            <button type="button" onClick={onClose} className="btn-outline-gold flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-dark flex-1">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-cream" />
                  Saving…
                </span>
              ) : (
                <><Check size={15} /> {product ? 'Update Product' : 'Add Product'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DELETE CONFIRM                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function DeleteConfirm({ product, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/60 backdrop-blur-sm px-4">
      <div className="bg-white p-8 max-w-sm w-full shadow-2xl text-center">
        <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
        <h3 className="font-serif text-xl font-medium text-obsidian mb-2">Remove Product?</h3>
        <p className="text-stone-400 text-sm font-sans mb-6">
          <strong>{product.name}</strong> will be hidden from the store. This can be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-outline-gold flex-1">Cancel</button>
          <button onClick={onConfirm} className="flex-1 btn-dark bg-red-500 hover:bg-red-600 border-red-500">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PRODUCTS TAB                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
function ProductsTab() {
  const queryClient = useQueryClient();
  const [modal, setModal]   = useState(null); // null | 'add' | product object
  const [deleting, setDeleting] = useState(null);

  // Try API, fall back to sample data for demo
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/products');
        return res.data.products;
      } catch {
        return SAMPLE_PRODUCTS; // demo fallback
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ payload, id }) => {
      if (id) return api.put(`/admin/products/${id}`, payload);
      return api.post('/admin/products', payload);
    },
    onSuccess: (_, { id }) => {
      toast.success(id ? 'Product updated.' : 'Product added to store!', {
        style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' },
      });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save product.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      toast.success('Product removed from store.');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleting(null);
    },
    onError: () => toast.error('Failed to remove product.'),
  });

  const handleSave = async (payload) => {
    const id = modal?._id || modal?.id;
    saveMutation.mutate({ payload, id: typeof id === 'string' && id.length === 24 ? id : undefined });
  };

  const products = data || [];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-sans text-stone-500">{products.length} products</p>
        <button onClick={() => setModal('add')} className="btn-gold text-xs py-2.5 px-5">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 text-xs font-sans font-medium tracking-widest uppercase">
                <th className="text-left pb-3 pr-4">Product</th>
                <th className="text-left pb-3 pr-4">Category</th>
                <th className="text-left pb-3 pr-4">Type</th>
                <th className="text-right pb-3 pr-4">Price</th>
                <th className="text-right pb-3 pr-4">Stock</th>
                <th className="text-left pb-3 pr-4">Status</th>
                <th className="text-right pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products.map((p) => (
                <tr key={p.id || p._id} className="group hover:bg-stone-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover bg-stone-100 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-sans font-medium text-obsidian">{p.name}</p>
                        <p className="font-sans text-xs text-stone-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 capitalize">
                    <span className="text-xs font-sans text-stone-500">{p.category}</span>
                  </td>
                  <td className="py-3 pr-4 capitalize">
                    <span className="text-xs font-sans text-stone-500">{p.fragranceType}</span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="font-sans font-semibold text-obsidian">{formatPrice(p.price)}</span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`font-sans text-sm ${(p.stock ?? 100) < 10 ? 'text-red-500 font-semibold' : 'text-stone-500'}`}>
                      {p.stock ?? '—'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col gap-1">
                      {p.isBestSeller && (
                        <span className="text-[10px] font-sans font-medium tracking-widest uppercase bg-gold-100 text-gold-700 px-2 py-0.5 w-fit">
                          Best Seller
                        </span>
                      )}
                      {p.isNew && (
                        <span className="text-[10px] font-sans font-medium tracking-widest uppercase bg-stone-100 text-stone-600 px-2 py-0.5 w-fit">
                          New
                        </span>
                      )}
                      {p.isActive === false && (
                        <span className="text-[10px] font-sans font-medium tracking-widest uppercase bg-red-50 text-red-500 px-2 py-0.5 w-fit">
                          Hidden
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setModal(p)}
                        className="w-8 h-8 flex items-center justify-center border border-stone-200 hover:border-gold-500 hover:text-gold-600 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleting(p)}
                        className="w-8 h-8 flex items-center justify-center border border-stone-200 hover:border-red-400 hover:text-red-500 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleting && (
        <DeleteConfirm
          product={deleting}
          onConfirm={() => deleteMutation.mutate(deleting._id || deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ANALYTICS TAB                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
function AnalyticsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/analytics');
        return res.data.analytics;
      } catch {
        return { totalUsers: 128, activeUsers: 112, totalRevenueINR: 284500, planBreakdown: [], revenueByDay: [] };
      }
    },
  });

  if (isLoading) return <div className="text-center py-20 text-stone-400 font-sans">Loading analytics…</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',   value: data.totalUsers,                    icon: Users,       color: 'text-indigo-500' },
          { label: 'Active Users',  value: data.activeUsers,                   icon: UserCheck,   color: 'text-green-500' },
          { label: 'Total Revenue', value: `₹${(data.totalRevenueINR||0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-gold-500' },
          { label: 'Paid Users',    value: data.planBreakdown?.filter(p=>p._id!=='free').reduce((s,p)=>s+p.count,0)||0, icon: TrendingUp, color: 'text-purple-500' },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-stone-100 p-5">
            <k.icon size={20} className={`${k.color} mb-3`} />
            <p className="font-sans font-bold text-2xl text-obsidian">{k.value}</p>
            <p className="font-sans text-xs text-stone-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {data.revenueByDay?.length > 0 && (
        <div className="bg-white border border-stone-100 p-6">
          <h3 className="font-serif text-lg font-medium text-obsidian mb-4">Revenue — Last 30 Days</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-stone-400 text-xs font-sans font-medium tracking-widest uppercase border-b border-stone-100">
                  <th className="text-left pb-2">Date</th>
                  <th className="text-right pb-2">Revenue</th>
                  <th className="text-right pb-2">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {data.revenueByDay.map((d) => (
                  <tr key={d._id} className="text-stone-600">
                    <td className="py-2 font-sans">{d._id}</td>
                    <td className="py-2 text-right font-sans font-medium text-obsidian">₹{(d.revenue/100).toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right font-sans text-stone-400">{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  USERS TAB                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function UsersTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/users');
        return res.data;
      } catch {
        return { users: [], total: 0 };
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/toggle-active`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Failed to update user.'),
  });

  if (isLoading) return <div className="text-center py-20 text-stone-400 font-sans">Loading users…</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100 text-stone-400 text-xs font-sans font-medium tracking-widest uppercase">
            <th className="text-left pb-3 pr-4">Name</th>
            <th className="text-left pb-3 pr-4">Email</th>
            <th className="text-left pb-3 pr-4">Role</th>
            <th className="text-left pb-3 pr-4">Joined</th>
            <th className="text-right pb-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {data?.users?.map((u) => (
            <tr key={u._id} className="hover:bg-stone-50 transition-colors">
              <td className="py-3 pr-4 font-sans font-medium text-obsidian">{u.name}</td>
              <td className="py-3 pr-4 font-sans text-stone-500">{u.email}</td>
              <td className="py-3 pr-4">
                <span className={`text-[10px] font-sans font-medium tracking-widest uppercase px-2 py-0.5 ${u.role === 'admin' ? 'bg-gold-100 text-gold-700' : 'bg-stone-100 text-stone-600'}`}>
                  {u.role}
                </span>
              </td>
              <td className="py-3 pr-4 font-sans text-stone-400 text-xs">
                {new Date(u.createdAt).toLocaleDateString('en-IN')}
              </td>
              <td className="py-3 text-right">
                <button
                  onClick={() => toggleMutation.mutate(u._id)}
                  disabled={toggleMutation.isPending}
                  className={`text-xs font-sans font-medium tracking-widest uppercase px-3 py-1.5 transition-colors ${
                    u.isActive
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-stone-400 font-sans mt-4">Total: {data?.total ?? 0} users</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PAGE                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'products',  label: 'Products',  icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'users',     label: 'Users',     icon: Users },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('products');

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-obsidian flex items-center justify-center">
            <LayoutDashboard size={18} className="text-gold-400" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-medium text-obsidian">Admin Panel</h1>
            <p className="text-stone-400 text-xs font-sans">Manage products, users, and analytics</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 mb-8">
          {TABS.map((t) => (
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

        {/* Content */}
        <div className="bg-white border border-stone-100 p-6">
          {tab === 'products'  && <ProductsTab />}
          {tab === 'analytics' && <AnalyticsTab />}
          {tab === 'users'     && <UsersTab />}
        </div>

      </div>
    </div>
  );
}
