import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Edit2, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import StarRating from './StarRating';

/* ── Mock reviews for demo mode ─────────────────────────────────────────── */
const DEMO_REVIEWS = [
  {
    _id: 'demo-1',
    user: { name: 'Priya S.' },
    rating: 5,
    title: 'Absolutely divine',
    comment: 'The longevity is incredible — I got compliments all day. The top notes are fresh and the dry-down is warm and sensual. Worth every rupee.',
    createdAt: new Date('2025-04-10').toISOString(),
  },
  {
    _id: 'demo-2',
    user: { name: 'Arjun M.' },
    rating: 4,
    title: 'Very good, subtle sillage',
    comment: 'Great fragrance for office wear. Not too overpowering, subtle but present. Lasts about 6-7 hours on my skin. Would buy again.',
    createdAt: new Date('2025-03-22').toISOString(),
  },
  {
    _id: 'demo-3',
    user: { name: 'Nadia K.' },
    rating: 5,
    title: 'My signature scent',
    comment: 'I\'ve tried many luxury fragrances and this is now my signature. The packaging is beautiful and the scent profile is exactly as described.',
    createdAt: new Date('2025-02-15').toISOString(),
  },
];

/* ── Rating bar component ───────────────────────────────────────────────── */
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-sans text-stone-500 w-4 text-right">{star}</span>
      <Star size={10} className="text-gold-400 fill-gold-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-sans text-stone-400 w-6 text-right">{count}</span>
    </div>
  );
}

/* ── Write / Edit review form ───────────────────────────────────────────── */
function ReviewForm({ productId, existingReview, deliveredOrders, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    rating:  existingReview?.rating || 5,
    title:   existingReview?.title  || '',
    comment: existingReview?.comment || '',
    orderId: existingReview?.order  || (deliveredOrders?.[0]?._id || ''),
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      existingReview
        ? api.put(`/reviews/${existingReview._id}`, payload)
        : api.post('/reviews', { ...payload, productId }),
    onSuccess: () => {
      toast.success(existingReview ? 'Review updated.' : 'Review posted!', {
        style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' },
      });
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit review.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.orderId && !existingReview) {
      toast.error('No eligible order found. Only verified purchasers can review.');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-stone-50 border border-stone-100 p-6 space-y-4 mb-6">
      <h3 className="font-serif text-lg font-medium text-obsidian">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      {/* Star picker */}
      <div>
        <p className="label-luxury mb-1">Rating *</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setForm({ ...form, rating: star })}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={`transition-colors ${
                  star <= form.rating ? 'fill-gold-400 text-gold-400' : 'fill-stone-200 text-stone-200'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label-luxury">Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Sum up your experience"
          maxLength={120}
          className="input-luxury"
          required
        />
      </div>

      <div>
        <label className="label-luxury">Your Review *</label>
        <textarea
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          rows={4}
          placeholder="Share your thoughts on this fragrance…"
          maxLength={2000}
          className="input-luxury resize-none"
          required
        />
        <p className="text-right text-xs text-stone-400 font-sans mt-1">
          {form.comment.length}/2000
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="btn-outline-gold flex-1 text-xs py-2.5">
          Cancel
        </button>
        <button type="submit" disabled={mutation.isPending} className="btn-dark flex-1 text-xs py-2.5">
          {mutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-cream" />
              Posting…
            </span>
          ) : (existingReview ? 'Update Review' : 'Post Review')}
        </button>
      </div>
    </form>
  );
}

/* ── Main ReviewSection ─────────────────────────────────────────────────── */
export default function ReviewSection({ product }) {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient  = useQueryClient();
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const productId = product?._id || product?.id;

  // Fetch reviews
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId || productId?.startsWith('demo-') || String(productId).length < 24) {
        return { reviews: DEMO_REVIEWS, total: DEMO_REVIEWS.length, distribution: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 } };
      }
      try {
        const res = await api.get(`/reviews/${productId}`);
        return res.data;
      } catch {
        return { reviews: DEMO_REVIEWS, total: DEMO_REVIEWS.length, distribution: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 } };
      }
    },
    staleTime: 60_000,
  });

  // Fetch user's delivered orders for this product
  const { data: ordersData } = useQuery({
    queryKey: ['my-orders-for-review', user?.id],
    queryFn: () => api.get('/orders/my').then((r) =>
      r.data.orders.filter((o) => o.status === 'delivered' && o.items.some((i) => (i.product?._id || i.product) === productId))
    ),
    enabled: isAuthenticated && !!productId && !user?.id?.startsWith('demo-'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/reviews/${id}`),
    onSuccess: () => {
      toast.success('Review deleted.');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
    onError: () => toast.error('Failed to delete review.'),
  });

  const reviews     = data?.reviews || [];
  const distribution = data?.distribution || {};
  const total       = data?.total || 0;
  const avgRating   = total > 0
    ? (Object.entries(distribution).reduce((sum, [star, cnt]) => sum + Number(star) * cnt, 0) / total).toFixed(1)
    : product?.rating?.toFixed(1) || '0.0';

  const myReview = reviews.find(
    (r) => r.user?._id === user?.id || r.user?._id === user?._id
  );

  const deliveredOrders = ordersData || [];
  const canReview = isAuthenticated && deliveredOrders.length > 0 && !myReview;

  return (
    <section className="mt-16 pt-10 border-t border-stone-100">
      <h2 className="font-serif text-2xl font-medium text-obsidian mb-8">
        Customer Reviews
        {total > 0 && (
          <span className="ml-3 font-sans text-sm font-normal text-stone-400">({total} reviews)</span>
        )}
      </h2>

      {/* Summary row */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 mb-10 bg-white border border-stone-100 p-6">
          {/* Average */}
          <div className="text-center sm:border-r sm:border-stone-100 sm:pr-8 sm:min-w-[120px]">
            <p className="font-display text-5xl font-light text-obsidian">{avgRating}</p>
            <StarRating rating={Number(avgRating)} size={14} className="justify-center my-1" />
            <p className="text-xs text-stone-400 font-sans">{total} review{total !== 1 ? 's' : ''}</p>
          </div>
          {/* Distribution */}
          <div className="flex-1 space-y-1.5 justify-center flex flex-col">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar key={star} star={star} count={distribution[star] || 0} total={total} />
            ))}
          </div>
        </div>
      )}

      {/* Review form */}
      {(showForm || editTarget) && (
        <ReviewForm
          productId={productId}
          existingReview={editTarget}
          deliveredOrders={deliveredOrders}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}

      {/* CTA */}
      {!showForm && !editTarget && (
        <div className="mb-8">
          {canReview && (
            <button onClick={() => setShowForm(true)} className="btn-dark text-xs py-2.5 px-5">
              Write a Review
            </button>
          )}
          {isAuthenticated && myReview && (
            <div className="flex items-center gap-2 text-xs text-stone-400 font-sans">
              <CheckCircle size={14} className="text-green-500" />
              You have reviewed this product.
            </div>
          )}
          {!isAuthenticated && (
            <p className="text-sm text-stone-400 font-sans">
              <a href="/login" className="text-gold-600 hover:underline">Log in</a> after purchasing to leave a review.
            </p>
          )}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-28 skeleton rounded" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-stone-400 font-sans text-sm py-8">No reviews yet. Be the first to review this fragrance.</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => {
            const isOwn = review.user?._id === user?.id || review.user?._id === user?._id;
            return (
              <div key={review._id} className="bg-white border border-stone-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <StarRating rating={review.rating} size={13} />
                    <p className="font-sans font-semibold text-obsidian text-sm mt-1">{review.title}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isOwn && (
                      <>
                        <button
                          onClick={() => setEditTarget(review)}
                          className="w-7 h-7 flex items-center justify-center text-stone-300 hover:text-gold-600 transition-colors"
                          aria-label="Edit review"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(review._id)}
                          className="w-7 h-7 flex items-center justify-center text-stone-300 hover:text-red-500 transition-colors"
                          aria-label="Delete review"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-stone-600 font-sans leading-relaxed">{review.comment}</p>
                <p className="text-xs text-stone-400 font-sans mt-3">
                  {review.user?.name || 'Verified Buyer'}
                  {' · '}
                  {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
