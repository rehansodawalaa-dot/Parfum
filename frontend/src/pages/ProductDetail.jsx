import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ZoomIn, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import useSlideIn from '../hooks/useSlideIn';
import StarRating from '../components/StarRating';
import { PRODUCTS } from '../data/products';
import { formatPrice, discountPercent } from '../utils/format';

function AnimatedCard({ product, delay }) {
  const [ref, style] = useSlideIn(delay);
  return (
    <div ref={ref} style={style}>
      <ProductCard product={product} />
    </div>
  );
}

/* ── Image Gallery ────────────────────────────────────────────────────────── */
function Gallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 transition-colors ${
              i === active ? 'border-gold-500' : 'border-transparent'
            }`}
          >
            <img src={img} alt={`${name} view ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        className="relative flex-1 aspect-square bg-stone-50 overflow-hidden cursor-zoom-in group"
        onClick={() => setZoomed(true)}
      >
        <img
          src={images[active]}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-white/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={16} className="text-obsidian" />
        </div>
      </div>

      {/* Lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <img src={images[active]} alt={name} className="max-w-full max-h-full object-contain" />
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setZoomed(false)}
            aria-label="Close zoom"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Fragrance Notes ──────────────────────────────────────────────────────── */
function FragranceNotes({ notes }) {
  const tiers = [
    { label: 'Top Notes',    key: 'top',    desc: 'First impression, 0–30 min', color: 'bg-amber-50 border-amber-200' },
    { label: 'Heart Notes',  key: 'middle', desc: 'The soul, 30 min–4 hrs',     color: 'bg-rose-50 border-rose-200' },
    { label: 'Base Notes',   key: 'base',   desc: 'The lasting memory, 4+ hrs', color: 'bg-stone-50 border-stone-200' },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {tiers.map((t) => (
        <div key={t.key} className={`border p-4 ${t.color}`}>
          <p className="text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-stone-500 mb-1">
            {t.label}
          </p>
          <p className="text-[10px] text-stone-400 mb-3 font-sans">{t.desc}</p>
          <ul className="space-y-1">
            {notes[t.key].map((n) => (
              <li key={n} className="text-xs font-sans text-obsidian">{n}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ── Reviews ──────────────────────────────────────────────────────────────── */
const SAMPLE_REVIEWS = [
  { id: 1, name: 'Priya S.', rating: 5, date: 'March 2025', text: 'Absolutely stunning. The longevity is incredible — I still get compliments 10 hours later.' },
  { id: 2, name: 'Arjun M.', rating: 5, date: 'February 2025', text: 'Worth every rupee. The packaging is exquisite and the fragrance is even better.' },
  { id: 3, name: 'Kavya N.', rating: 4, date: 'January 2025', text: 'Beautiful scent, very sophisticated. Slightly strong for daytime but perfect for evenings.' },
];

function Reviews({ rating, reviewCount }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6 p-5 bg-stone-50">
        <div className="text-center">
          <p className="font-display text-5xl font-light text-obsidian">{rating}</p>
          <StarRating rating={rating} size={16} />
          <p className="text-xs text-stone-400 mt-1 font-sans">{reviewCount} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-stone-400 w-2 font-sans">{star}</span>
                <div className="flex-1 h-1.5 bg-stone-200">
                  <div className="h-full bg-gold-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-stone-400 w-6 font-sans">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        {SAMPLE_REVIEWS.map((r) => (
          <div key={r.id} className="border-b border-stone-100 pb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center text-xs font-semibold text-gold-700 font-sans">
                  {r.name[0]}
                </div>
                <span className="font-sans font-medium text-sm text-obsidian">{r.name}</span>
              </div>
              <span className="text-xs text-stone-400 font-sans">{r.date}</span>
            </div>
            <StarRating rating={r.rating} size={13} />
            <p className="text-sm text-stone-600 mt-2 leading-relaxed font-sans">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function ProductDetail() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const addItem     = useCartStore((s) => s.addItem);

  const product = PRODUCTS.find((p) => p.slug === slug);

  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[product.sizes.length - 1] || '');
  const [qty, setQty]                   = useState(1);
  const [activeTab, setActiveTab]       = useState('description');

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="font-serif text-2xl text-stone-300 mb-4">Product not found</p>
          <Link to="/shop" className="btn-dark">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const discount  = discountPercent(product.originalPrice, product.price);
  const related   = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product, selectedSize);
    toast.success(`${product.name} added to cart`, {
      style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' },
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-sans text-stone-400 mb-8">
          <Link to="/" className="hover:text-gold-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold-600 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-obsidian">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Gallery */}
          <Reveal direction="right">
            <Gallery images={product.images} name={product.name} />
          </Reveal>

          {/* Info */}
          <Reveal direction="left" delay={80}>
            <p className="text-[10px] font-sans font-medium tracking-[0.25em] uppercase text-stone-400 mb-2">
              {product.brand}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-obsidian mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={product.rating} size={15} showNumber />
              <span className="text-xs text-stone-400 font-sans">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-sans text-2xl font-semibold text-obsidian">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="font-sans text-base text-stone-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="bg-gold-100 text-gold-700 text-xs font-bold px-2 py-0.5 font-sans">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <p className="label-luxury mb-2">Size</p>
              <div className="flex gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 text-xs font-sans font-medium border transition-colors ${
                      selectedSize === s
                        ? 'bg-obsidian text-cream border-obsidian'
                        : 'border-stone-200 text-stone-600 hover:border-obsidian'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="label-luxury mb-2">Quantity</p>
              <div className="flex items-center gap-0 border border-stone-200 w-fit">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-sans text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button onClick={handleAddToCart} className="btn-outline-gold flex-1">
                <ShoppingBag size={16} />
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-dark flex-1">
                Buy Now
              </button>
            </div>

            {/* Trust */}
            <div className="border-t border-stone-100 pt-5 space-y-2">
              {['Free shipping on orders above ₹3,000', 'Authentic guarantee — 100% genuine', '15-day easy returns'].map((t) => (
                <p key={t} className="text-xs font-sans text-stone-500 flex items-center gap-2">
                  <span className="text-gold-500">✓</span> {t}
                </p>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex border-b border-stone-200 mb-8">
            {[
              { id: 'description', label: 'Description' },
              { id: 'notes',       label: 'Fragrance Notes' },
              { id: 'brand',       label: 'Brand Story' },
              { id: 'reviews',     label: `Reviews (${product.reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-xs font-sans font-medium tracking-widest uppercase border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-obsidian text-obsidian'
                    : 'border-transparent text-stone-400 hover:text-obsidian'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-3xl">
            {activeTab === 'description' && (
              <p className="font-sans text-base text-stone-600 leading-relaxed">{product.description}</p>
            )}
            {activeTab === 'notes' && <FragranceNotes notes={product.notes} />}
            {activeTab === 'brand' && (
              <p className="font-sans text-base text-stone-600 leading-relaxed">{product.brandStory}</p>
            )}
            {activeTab === 'reviews' && (
              <Reviews rating={product.rating} reviewCount={product.reviewCount} />
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <Reveal direction="up" className="flex items-end justify-between mb-8">
              <div>
                <p className="section-tag mb-2">You May Also Like</p>
                <h2 className="font-serif text-2xl font-medium text-obsidian">Related Fragrances</h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <AnimatedCard key={p.id} product={p} delay={i * 80} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
