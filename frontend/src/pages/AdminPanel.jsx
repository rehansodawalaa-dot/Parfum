import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Package, Users, BarChart3,
  Plus, Pencil, Trash2, X, Check, AlertTriangle,
  TrendingUp, IndianRupee, UserCheck,
  Star, MessageSquare, Heart, EyeOff, Eye, CheckCircle,
  Clock, Tag, ToggleLeft, ToggleRight, Percent,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { formatPrice } from '../utils/format';
import { PRODUCTS as SAMPLE_PRODUCTS } from '../data/products';
import StarRating from '../components/StarRating';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PRODUCT FORM MODAL — helper sub-components (defined outside modal)         */
/* ─────────────────────────────────────────────────────────────────────────── */
function Field({ label, name, type = 'text', placeholder = '', form, onChange }) {
  return (
    <div>
      <label className="label-luxury">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="input-luxury"
      />
    </div>
  );
}

function SelectField({ label, name, options, form, onChange }) {
  return (
    <div>
      <label className="label-luxury">{label}</label>
      <select
        value={form[name]}
        onChange={(e) => onChange(name, e.target.value)}
        className="input-luxury cursor-pointer"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  IMAGE UPLOADER                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
function ImageUploader({ images, onChange }) {
  // images is a comma-separated string of URLs
  const urls = images ? images.split(',').map((u) => u.trim()).filter(Boolean) : [];
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);
          const { data } = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          return data.url;
        })
      );
      const newUrls = [...urls, ...uploaded];
      onChange(newUrls.join(', '));
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeUrl = (idx) => {
    const newUrls = urls.filter((_, i) => i !== idx);
    onChange(newUrls.join(', '));
  };

  return (
    <div>
      <label className="label-luxury mb-2 block">Product Images</label>

      {/* Preview existing images */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {urls.map((url, idx) => (
            <div key={idx} className="relative group w-20 h-24">
              <img src={url} alt={`product-${idx}`} className="w-full h-full object-cover bg-stone-50 border border-stone-100" />
              <button
                type="button"
                onClick={() => removeUrl(idx)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <label className={`flex items-center gap-3 cursor-pointer border-2 border-dashed border-stone-200 hover:border-gold-400 transition-colors p-4 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
          disabled={uploading}
        />
        <div className="flex items-center gap-3">
          {uploading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-gold-500" />
          ) : (
            <Plus size={18} className="text-stone-400" />
          )}
          <div>
            <p className="text-sm font-sans font-medium text-stone-600">
              {uploading ? 'Uploading…' : 'Click to upload images'}
            </p>
            <p className="text-xs font-sans text-stone-400">PNG, JPG, WEBP up to 5MB each. Multiple files allowed.</p>
          </div>
        </div>
      </label>
    </div>
  );
}

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
            <Field label="Product Name *" name="name" placeholder="Noir Absolu" form={form} onChange={set} />
            <Field label="Slug (auto-generated if blank)" name="slug" placeholder="noir-absolu" form={form} onChange={set} />
            <Field label="Brand *" name="brand" placeholder="Maison Élite" form={form} onChange={set} />
            <Field label="Stock" name="stock" type="number" placeholder="100" form={form} onChange={set} />
            <Field label="Price (₹) *" name="price" type="number" placeholder="8500" form={form} onChange={set} />
            <Field label="Original Price (₹) *" name="originalPrice" type="number" placeholder="10000" form={form} onChange={set} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Category *" name="category" form={form} onChange={set} options={[
              { value: 'men',     label: 'For Him' },
              { value: 'women',   label: 'For Her' },
              { value: 'unisex',  label: 'Unisex' },
              { value: 'premium', label: 'Premium' },
            ]} />
            <SelectField label="Fragrance Type *" name="fragranceType" form={form} onChange={set} options={[
              { value: 'woody',    label: 'Woody' },
              { value: 'floral',   label: 'Floral' },
              { value: 'citrus',   label: 'Citrus' },
              { value: 'oriental', label: 'Oriental' },
              { value: 'fresh',    label: 'Fresh' },
              { value: 'aquatic',  label: 'Aquatic' },
            ]} />
          </div>

          <Field label="Sizes (comma-separated)" name="sizes" placeholder="30ml, 50ml, 100ml" form={form} onChange={set} />

          {/* ── Image uploader ──────────────────────────────────────────── */}
          <ImageUploader images={form.images} onChange={(val) => set('images', val)} />


          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Top Notes" name="notes_top" placeholder="Bergamot, Pepper" form={form} onChange={set} />
            <Field label="Heart Notes" name="notes_middle" placeholder="Oud, Rose" form={form} onChange={set} />
            <Field label="Base Notes" name="notes_base" placeholder="Sandalwood, Musk" form={form} onChange={set} />
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
      queryClient.invalidateQueries({ queryKey: ['products-home'] });
      queryClient.invalidateQueries({ queryKey: ['products-shop'] });
      setModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save product.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      toast.success('Product removed from store.');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-home'] });
      queryClient.invalidateQueries({ queryKey: ['products-shop'] });
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
/*  REVIEWS TAB                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function ReviewsTab() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // all | hidden | pending

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', filter],
    queryFn: async () => {
      try {
        const params = filter === 'hidden' ? '?isVisible=false' : filter === 'pending' ? '?isApproved=false' : '';
        const res = await api.get(`/admin/reviews${params}`);
        return res.data;
      } catch {
        return {
          reviews: [
            { _id: 'demo-1', rating: 5, title: 'Absolutely divine', comment: 'The longevity is incredible.', isVisible: true, isApproved: true, user: { name: 'Priya S.', email: 'priya@example.com' }, product: { name: 'Noir Absolu', slug: 'noir-absolu' }, createdAt: new Date().toISOString() },
            { _id: 'demo-2', rating: 4, title: 'Very good', comment: 'Great for office.', isVisible: true, isApproved: true, user: { name: 'Arjun M.', email: 'arjun@example.com' }, product: { name: 'Velvet Oud', slug: 'velvet-oud' }, createdAt: new Date().toISOString() },
          ],
          total: 2,
        };
      }
    },
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, update }) => api.patch(`/admin/reviews/${id}/moderate`, update),
    onSuccess: () => {
      toast.success('Review updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => toast.error('Failed to update review.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/reviews/${id}`),
    onSuccess: () => {
      toast.success('Review deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => toast.error('Failed to delete review.'),
  });

  if (isLoading) return <div className="text-center py-20 text-stone-400 font-sans">Loading reviews…</div>;

  const reviews = data?.reviews || [];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'all',     label: 'All Reviews' },
          { id: 'hidden',  label: 'Hidden' },
          { id: 'pending', label: 'Pending' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs font-sans font-medium tracking-widest uppercase px-3 py-1.5 transition-colors ${
              filter === f.id ? 'bg-obsidian text-cream' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-stone-400 font-sans self-center">{data?.total || 0} total</span>
      </div>

      {reviews.length === 0 ? (
        <p className="text-center py-12 text-stone-400 font-sans">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className={`border p-5 ${r.isVisible ? 'border-stone-100 bg-white' : 'border-stone-200 bg-stone-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StarRating rating={r.rating} size={12} />
                    <span className="font-sans font-semibold text-sm text-obsidian">{r.title}</span>
                    {!r.isVisible && (
                      <span className="text-[10px] font-sans bg-red-100 text-red-500 px-2 py-0.5 tracking-widest uppercase">Hidden</span>
                    )}
                    {!r.isApproved && (
                      <span className="text-[10px] font-sans bg-yellow-100 text-yellow-600 px-2 py-0.5 tracking-widest uppercase">Pending</span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 font-sans mb-2">{r.comment}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-stone-400 font-sans">
                    <span>By: <strong className="text-obsidian">{r.user?.name}</strong></span>
                    {r.product && <span>Product: <strong className="text-obsidian">{r.product.name}</strong></span>}
                    <span>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => moderateMutation.mutate({ id: r._id, update: { isVisible: !r.isVisible } })}
                    className="w-8 h-8 flex items-center justify-center border border-stone-200 hover:border-stone-400 transition-colors"
                    title={r.isVisible ? 'Hide review' : 'Show review'}
                  >
                    {r.isVisible ? <EyeOff size={13} className="text-stone-400" /> : <Eye size={13} className="text-green-500" />}
                  </button>
                  <button
                    onClick={() => moderateMutation.mutate({ id: r._id, update: { isApproved: !r.isApproved } })}
                    className="w-8 h-8 flex items-center justify-center border border-stone-200 hover:border-gold-400 transition-colors"
                    title={r.isApproved ? 'Unapprove' : 'Approve'}
                  >
                    <CheckCircle size={13} className={r.isApproved ? 'text-green-500' : 'text-stone-300'} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(r._id)}
                    className="w-8 h-8 flex items-center justify-center border border-stone-200 hover:border-red-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} className="text-stone-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SUPPORT TAB                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function SupportTab() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-support', statusFilter],
    queryFn: async () => {
      try {
        const res = await api.get(`/admin/support?status=${statusFilter}&limit=30`);
        return res.data;
      } catch {
        return {
          tickets: [
            { _id: 'demo-t1', ticketNumber: 'TKT-ABC12', customerName: 'Priya Sharma', email: 'priya@example.com', status: 'open', messages: [{ sender: 'customer', text: 'Where is my order?', timestamp: new Date().toISOString() }], createdAt: new Date().toISOString(), lastReplyAt: new Date().toISOString() },
          ],
          total: 1,
        };
      }
    },
    refetchInterval: 15_000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['admin-support-analytics'],
    queryFn: async () => {
      try { return (await api.get('/admin/support/analytics')).data.analytics; }
      catch { return { open: 3, pending: 1, resolved: 14, total: 18, avgResolutionHours: 4 }; }
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ ticketId, text }) =>
      api.post('/admin/support/message', { ticketId, text }),
    onSuccess: (res) => {
      const newMsg = res.data.chatMessage;
      setSelected((prev) => prev
        ? { ...prev, messages: [...(prev.messages || []), newMsg] }
        : prev
      );
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
    },
    onError: () => toast.error('Failed to send reply.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/support/${id}/status`, { status }),
    onSuccess: (_, { status }) => {
      toast.success(`Ticket marked as ${status}.`);
      setSelected((prev) => prev ? { ...prev, status } : prev);
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
    },
  });

  const STATUS_COLOR = {
    open:     'bg-yellow-50 text-yellow-700',
    pending:  'bg-blue-50 text-blue-700',
    resolved: 'bg-green-50 text-green-700',
    closed:   'bg-stone-100 text-stone-500',
  };

  if (isLoading) return <div className="text-center py-20 text-stone-400 font-sans">Loading support tickets…</div>;

  return (
    <div className="space-y-6">
      {/* Metrics */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Open',     value: analytics.open,     color: 'text-yellow-500', icon: MessageSquare },
            { label: 'Pending',  value: analytics.pending,  color: 'text-blue-500',   icon: Clock },
            { label: 'Resolved', value: analytics.resolved, color: 'text-green-500',  icon: CheckCircle },
            { label: 'Avg Response', value: analytics.avgResolutionHours != null ? `${analytics.avgResolutionHours}h` : '—', color: 'text-gold-500', icon: TrendingUp },
          ].map((m) => (
            <div key={m.label} className="bg-stone-50 border border-stone-100 p-4">
              <m.icon size={16} className={`${m.color} mb-2`} />
              <p className="font-sans font-bold text-lg text-obsidian">{m.value}</p>
              <p className="text-xs text-stone-400 font-sans">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['open','pending','resolved','closed'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs font-sans font-medium tracking-widest uppercase px-3 py-1.5 capitalize transition-colors ${
              statusFilter === s ? 'bg-obsidian text-cream' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-4 min-h-[400px]">
        {/* Ticket list */}
        <div className="w-72 flex-shrink-0 space-y-2 overflow-y-auto">
          {(data?.tickets || []).map((t) => (
            <button
              key={t._id}
              onClick={() => setSelected(t)}
              className={`w-full text-left p-3 border transition-colors ${
                selected?._id === t._id
                  ? 'border-gold-300 bg-gold-50'
                  : 'border-stone-100 bg-white hover:border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] text-stone-400">{t.ticketNumber}</span>
                <span className={`text-[10px] font-sans px-1.5 py-0.5 capitalize ${STATUS_COLOR[t.status]}`}>{t.status}</span>
              </div>
              <p className="font-sans font-medium text-sm text-obsidian truncate">{t.customerName}</p>
              <p className="font-sans text-xs text-stone-400 truncate">{t.email}</p>
              <p className="font-sans text-xs text-stone-300 mt-1">
                {new Date(t.lastReplyAt || t.createdAt).toLocaleDateString('en-IN')}
              </p>
            </button>
          ))}
          {(data?.tickets || []).length === 0 && (
            <p className="text-center text-stone-400 text-sm font-sans py-8">No tickets found.</p>
          )}
        </div>

        {/* Chat view */}
        <div className="flex-1 border border-stone-100 flex flex-col bg-white min-h-[400px]">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-stone-300">
              <div className="text-center">
                <MessageSquare size={32} className="mx-auto mb-2" />
                <p className="font-sans text-sm">Select a ticket to view conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Ticket header */}
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-sans font-semibold text-sm text-obsidian">{selected.customerName}</p>
                  <p className="font-sans text-xs text-stone-400">{selected.email} · #{selected.ticketNumber}</p>
                </div>
                <div className="flex gap-2">
                  {selected.status !== 'resolved' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: selected._id, status: 'resolved' })}
                      className="text-xs font-sans font-medium tracking-widest uppercase bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {selected.status === 'open' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: selected._id, status: 'closed' })}
                      className="text-xs font-sans font-medium tracking-widest uppercase bg-stone-100 text-stone-500 hover:bg-stone-200 px-3 py-1.5 transition-colors"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(selected.messages || []).map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 text-sm font-sans ${
                      msg.sender === 'admin'
                        ? 'bg-obsidian text-cream'
                        : 'bg-stone-100 text-obsidian'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-cream/50' : 'text-stone-400'}`}>
                        {msg.sender === 'admin' ? 'Support' : selected.customerName}
                        {' · '}
                        {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              <div className="p-3 border-t border-stone-100 flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (replyText.trim()) replyMutation.mutate({ ticketId: selected._id, text: replyText.trim() });
                    }
                  }}
                  placeholder="Type a reply… (Enter to send)"
                  rows={2}
                  className="flex-1 resize-none bg-stone-50 border border-stone-100 px-3 py-2 text-sm font-sans outline-none focus:border-stone-300 transition-colors"
                  maxLength={2000}
                />
                <button
                  onClick={() => {
                    if (replyText.trim()) replyMutation.mutate({ ticketId: selected._id, text: replyText.trim() });
                  }}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="btn-dark px-3 text-xs disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  WISHLIST ANALYTICS TAB                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function WishlistAnalyticsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-wishlist-analytics'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/wishlist/analytics');
        return res.data.analytics;
      } catch {
        return {
          totalWishlistItems: 342,
          topWishlisted: [
            { name: 'Noir Absolu',    brand: 'Maison Élite', wishlistCount: 48, price: 8500 },
            { name: 'Velvet Oud',     brand: 'Oud Royale',   wishlistCount: 35, price: 12000 },
            { name: 'Rose Éternelle', brand: 'Fleur de Paris',wishlistCount: 29, price: 9500 },
          ],
        };
      }
    },
  });

  if (isLoading) return <div className="text-center py-20 text-stone-400 font-sans">Loading wishlist data…</div>;

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div className="bg-stone-50 border border-stone-100 p-5">
          <Heart size={18} className="text-red-400 fill-red-400 mb-3" />
          <p className="font-sans font-bold text-2xl text-obsidian">{data?.totalWishlistItems || 0}</p>
          <p className="text-xs text-stone-400 font-sans">Total Wishlist Items</p>
        </div>
        <div className="bg-stone-50 border border-stone-100 p-5">
          <TrendingUp size={18} className="text-green-500 mb-3" />
          <p className="font-sans font-bold text-2xl text-obsidian">{data?.topWishlisted?.length || 0}</p>
          <p className="text-xs text-stone-400 font-sans">Products Wishlisted</p>
        </div>
      </div>

      {/* Top wishlisted table */}
      <div className="bg-white border border-stone-100 p-6">
        <h3 className="font-serif text-lg font-medium text-obsidian mb-4">Most Wishlisted Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 text-xs font-sans tracking-widest uppercase">
                <th className="text-left pb-3 pr-4">Product</th>
                <th className="text-right pb-3 pr-4">Price</th>
                <th className="text-right pb-3">Wishlisted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {(data?.topWishlisted || []).map((p, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-sans font-medium text-obsidian">{p.name}</p>
                    <p className="text-xs text-stone-400 font-sans">{p.brand}</p>
                  </td>
                  <td className="py-3 pr-4 text-right font-sans text-obsidian">{formatPrice(p.price)}</td>
                  <td className="py-3 text-right">
                    <span className="font-sans font-semibold text-red-500">{p.wishlistCount}</span>
                    <Heart size={11} className="inline ml-1 text-red-400 fill-red-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  COUPONS TAB                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
const EMPTY_COUPON = {
  code: '', description: '', type: 'percent', value: '',
  minOrderValue: '', maxDiscount: '', usageLimit: '',
  perUserLimit: '1', expiresAt: '',
};

function CouponsTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_COUPON);
  const [editId, setEditId]     = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn:  () => api.get('/admin/coupons').then((r) => r.data.coupons),
  });

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editId
        ? api.patch(`/admin/coupons/${editId}`, payload)
        : api.post('/admin/coupons', payload),
    onSuccess: () => {
      toast.success(editId ? 'Coupon updated.' : 'Coupon created.');
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowForm(false);
      setForm(EMPTY_COUPON);
      setEditId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save coupon.'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/coupons/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
    onError: () => toast.error('Failed to toggle coupon.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      toast.success('Coupon deleted.');
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => toast.error('Failed to delete coupon.'),
  });

  const handleSubmit = () => {
    if (!form.code || !form.type || !form.value) {
      toast.error('Code, type and value are required.');
      return;
    }
    const payload = {
      code:          form.code.toUpperCase().trim(),
      description:   form.description,
      type:          form.type,
      value:         Number(form.value),
      minOrderValue: Number(form.minOrderValue) || 0,
      maxDiscount:   form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit:    form.usageLimit  ? Number(form.usageLimit)  : null,
      perUserLimit:  Number(form.perUserLimit) || 1,
      expiresAt:     form.expiresAt || null,
    };
    saveMutation.mutate(payload);
  };

  const openEdit = (c) => {
    setForm({
      code:          c.code,
      description:   c.description || '',
      type:          c.type,
      value:         String(c.value),
      minOrderValue: String(c.minOrderValue || ''),
      maxDiscount:   c.maxDiscount != null ? String(c.maxDiscount) : '',
      usageLimit:    c.usageLimit  != null ? String(c.usageLimit)  : '',
      perUserLimit:  String(c.perUserLimit ?? 1),
      expiresAt:     c.expiresAt ? c.expiresAt.slice(0, 10) : '',
    });
    setEditId(c._id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-medium text-obsidian">Coupon Management</h2>
          <p className="text-stone-400 text-xs font-sans mt-0.5">Create discount codes for all users or specific accounts</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_COUPON); setEditId(null); setShowForm(true); }}
          className="btn-dark flex items-center gap-2 text-xs"
        >
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-stone-50 border border-stone-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-semibold text-obsidian text-sm">
              {editId ? 'Edit Coupon' : 'Create New Coupon'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-stone-400 hover:text-obsidian">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label-luxury">Code *</label>
              <input name="code" value={form.code} onChange={set}
                placeholder="SAVE20" maxLength={30}
                className="input-luxury uppercase tracking-widest font-mono"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="label-luxury">Type *</label>
              <select name="type" value={form.type} onChange={set} className="input-luxury">
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="label-luxury">
                {form.type === 'percent' ? 'Discount %' : 'Discount ₹'} *
              </label>
              <input name="value" type="number" min="1" value={form.value} onChange={set}
                placeholder={form.type === 'percent' ? '20' : '200'}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="label-luxury">Min Order Value (₹)</label>
              <input name="minOrderValue" type="number" min="0" value={form.minOrderValue} onChange={set}
                placeholder="0 = no minimum" className="input-luxury" />
            </div>
            {form.type === 'percent' && (
              <div>
                <label className="label-luxury">Max Discount Cap (₹)</label>
                <input name="maxDiscount" type="number" min="1" value={form.maxDiscount} onChange={set}
                  placeholder="Leave blank = no cap" className="input-luxury" />
              </div>
            )}
            <div>
              <label className="label-luxury">Total Usage Limit</label>
              <input name="usageLimit" type="number" min="1" value={form.usageLimit} onChange={set}
                placeholder="Leave blank = unlimited" className="input-luxury" />
            </div>
            <div>
              <label className="label-luxury">Per User Limit</label>
              <input name="perUserLimit" type="number" min="1" value={form.perUserLimit} onChange={set}
                placeholder="1" className="input-luxury" />
            </div>
            <div>
              <label className="label-luxury">Expiry Date</label>
              <input name="expiresAt" type="date" value={form.expiresAt} onChange={set} className="input-luxury" />
            </div>
            <div className="sm:col-span-2">
              <label className="label-luxury">Description (shown to users)</label>
              <input name="description" value={form.description} onChange={set}
                placeholder="e.g. 20% off on your first order"
                className="input-luxury" maxLength={100} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSubmit} disabled={saveMutation.isPending} className="btn-dark flex items-center gap-2 text-xs">
              <Check size={13} /> {saveMutation.isPending ? 'Saving…' : editId ? 'Update Coupon' : 'Create Coupon'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 text-xs font-sans font-medium text-stone-500 hover:text-obsidian border border-stone-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-stone-400 font-sans text-sm">Loading coupons…</div>
      ) : !data?.length ? (
        <div className="text-center py-12">
          <Tag size={32} className="text-stone-200 mx-auto mb-3" />
          <p className="font-sans text-stone-400 text-sm">No coupons yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {['Code', 'Type', 'Value', 'Min Order', 'Used / Limit', 'Expiry', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 pr-4 text-xs font-sans font-medium tracking-widest uppercase text-stone-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((c) => {
                const expired  = c.expiresAt && new Date() > new Date(c.expiresAt);
                const limitHit = c.usageLimit !== null && c.usedCount >= c.usageLimit;
                return (
                  <tr key={c._id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="font-mono font-bold text-obsidian tracking-widest">{c.code}</span>
                      {c.description && <p className="text-[10px] text-stone-400 font-sans mt-0.5">{c.description}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 font-sans ${c.type === 'percent' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        {c.type === 'percent' ? <Percent size={10} /> : <IndianRupee size={10} />}
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-sans font-semibold text-obsidian">
                      {c.type === 'percent' ? `${c.value}%` : formatPrice(c.value)}
                      {c.maxDiscount && <span className="text-xs text-stone-400 ml-1">(max {formatPrice(c.maxDiscount)})</span>}
                    </td>
                    <td className="py-3 pr-4 font-sans text-stone-500">{c.minOrderValue > 0 ? formatPrice(c.minOrderValue) : '—'}</td>
                    <td className="py-3 pr-4 font-sans text-stone-500">{c.usedCount} / {c.usageLimit ?? '∞'}</td>
                    <td className="py-3 pr-4 font-sans text-stone-500 text-xs">
                      {c.expiresAt ? (
                        <span className={expired ? 'text-red-500' : ''}>{new Date(c.expiresAt).toLocaleDateString('en-IN')}{expired && ' (expired)'}</span>
                      ) : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-sans font-medium px-2 py-0.5 ${c.isActive && !expired && !limitHit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {!c.isActive ? 'Inactive' : expired ? 'Expired' : limitHit ? 'Exhausted' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-obsidian transition-colors" title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => toggleMutation.mutate(c._id)} className={`w-8 h-8 flex items-center justify-center transition-colors ${c.isActive ? 'text-green-500 hover:text-stone-400' : 'text-stone-300 hover:text-green-500'}`} title={c.isActive ? 'Deactivate' : 'Activate'}>
                          {c.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => { if (window.confirm(`Delete coupon ${c.code}?`)) deleteMutation.mutate(c._id); }} className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
  { id: 'reviews',   label: 'Reviews',   icon: Star },
  { id: 'support',   label: 'Support',   icon: MessageSquare },
  { id: 'wishlist',  label: 'Wishlist',  icon: Heart },
  { id: 'coupons',   label: 'Coupons',   icon: Tag },
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
            <p className="text-stone-400 text-xs font-sans">Manage products, users, analytics, reviews, support, and more</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-stone-200 mb-8">
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
          {tab === 'reviews'   && <ReviewsTab />}
          {tab === 'support'   && <SupportTab />}
          {tab === 'wishlist'  && <WishlistAnalyticsTab />}
          {tab === 'coupons'   && <CouponsTab />}
        </div>

      </div>
    </div>
  );
}
