import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import Reveal from '../components/Reveal';
import useSlideIn from '../hooks/useSlideIn';
import SEO from '../components/SEO';
import { PRODUCTS, TESTIMONIALS, CATEGORIES } from '../data/products';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HERO                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function Hero() {
  const bgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${window.scrollY * 0.25}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-obsidian">
      {/* Parallax background */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={bgRef}
          src="https://images.pexels.com/photos/3738673/pexels-photo-3738673.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt=""
          onLoad={() => setLoaded(true)}
          style={{ willChange: 'transform' }}
          className={`absolute w-full h-[120%] -top-[10%] object-cover transition-opacity duration-1000 ${
            loaded ? 'opacity-35' : 'opacity-0'
          }`}
        />
        {/* Fallback gradient so hero is never blank */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F0D] via-[#0D1F17] to-[#071409]" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
        {/* Amethyst ambient glow — top right */}
        <div className="absolute inset-0 hero-ambient" />
        {/* Subtle gold bottom-left bloom */}
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] rounded-full opacity-10 blur-3xl pointer-events-none" style={{background:'radial-gradient(circle, #C8991E 0%, transparent 70%)'}} />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="max-w-xl">
          <p
            className="section-tag text-gold-400 mb-5"
            style={{ animation: 'fadeRight 0.7s ease 0.2s both' }}
          >
            New Collection 2025
          </p>

          <h1
            className="font-display text-5xl sm:text-6xl md:text-8xl font-light text-cream leading-[1.0] mb-6 tracking-tight"
            style={{ animation: 'heroText 1.1s cubic-bezier(0.25,0.46,0.45,0.94) 0.4s both' }}
          >
            The Art<br />
            of{' '}
            <em className="not-italic text-gradient-gold">Scent</em>
          </h1>

          {/* Gold line draws in */}
          <div
            className="w-16 h-px bg-gold-gradient origin-left mb-6"
            style={{ animation: 'heroLine 0.8s ease 0.9s both' }}
          />

          <p
            className="font-sans text-base md:text-lg text-cream/60 leading-relaxed mb-10 max-w-md"
            style={{ animation: 'fadeUp 0.7s ease 1s both' }}
          >
            Discover fragrances that define who you are. Crafted by master perfumers, worn by those who know.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4"
            style={{ animation: 'fadeUp 0.7s ease 1.15s both' }}
          >
            <Link to="/shop" className="btn-gold group">
              Explore Collection
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/shop?category=premium"
              className="btn-outline-gold border-cream/30 text-cream hover:bg-cream hover:text-obsidian"
            >
              Premium Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/30"
        style={{ animation: 'fadeIn 0.6s ease 2s both' }}
      >
        <span className="text-[10px] tracking-[0.35em] uppercase font-sans">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-cream/40 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MARQUEE                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  'Free Shipping Above ₹3,000', '✦',
  'Authentic Fragrances', '✦',
  '15-Day Easy Returns', '✦',
  'Secure Razorpay Checkout', '✦',
  'Master Perfumers', '✦',
  'New Collection 2025', '✦',
];

function MarqueeStrip() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="bg-[#0D1F17] py-3 overflow-hidden border-y border-gold-800/20">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="text-[11px] font-sans font-medium tracking-[0.25em] uppercase text-gold-400/90 px-6 whitespace-nowrap">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TRUST BADGES                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
const BADGES = [
  { label: 'Easy Returns',   sub: '15-day hassle-free returns',  icon: '↩' },
  { label: 'Secure Payment', sub: 'Razorpay encrypted checkout', icon: '🔒' },
];

function TrustBadges() {
  return (
    <section className="py-12 bg-[#F5F0E8] border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 max-w-xl mx-auto">
          {BADGES.map((b, i) => (
            /* Reveal wraps a plain div — no hover state conflict */
            <Reveal key={b.label} direction="up" delay={i * 70}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="font-sans font-semibold text-[#0A0F0D] text-sm">{b.label}</p>
                  <p className="font-sans text-xs text-stone-400">{b.sub}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CATEGORIES                                                                  */
/*  Fix: Reveal wraps a neutral <div>; the <Link> inside is NOT wrapped        */
/* ─────────────────────────────────────────────────────────────────────────── */
function CategoryCard({ cat, delay }) {
  const [ref, style] = useSlideIn(delay);

  return (
    <div ref={ref} style={style}>
      <Link
        to={`/shop?category=${cat.id}`}
        className="group relative overflow-hidden bg-stone-100 aspect-square flex flex-col items-center justify-center text-center p-6 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(26,107,74,0.35)] block"
      >
        {/* Emerald-to-gold gradient overlay — slides up on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A6B4A] via-[#2a9c6e] to-[#C8991E] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Subtle shimmer layer on top of gold */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <span className="relative z-10 text-4xl mb-3 transition-transform duration-500 group-hover:scale-125 block drop-shadow-sm">
          {cat.emoji}
        </span>
        <h3 className="relative z-10 font-serif text-lg font-medium text-obsidian group-hover:text-white transition-colors duration-300">
          {cat.label}
        </h3>
        <p className="relative z-10 text-xs text-stone-500 group-hover:text-white/80 transition-colors duration-300 mt-1 font-sans">
          {cat.description}
        </p>
        <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <ArrowRight size={16} className="text-white/90" />
        </div>
      </Link>
    </div>
  );
}

function Categories() {
  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal direction="up" className="text-center mb-14">
          <p className="section-tag mb-3">Shop by Category</p>
          <h2 className="section-title">Find Your Signature</h2>
          <div className="divider-gold" />
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  BEST SELLERS                                                                */
/*  Fix: ProductCard is NOT wrapped in Reveal — it has its own hover states    */
/* ─────────────────────────────────────────────────────────────────────────── */
function AnimatedCard({ product, delay }) {
  const [ref, style] = useSlideIn(delay);
  return (
    <div ref={ref} style={style}>
      <ProductCard product={product} />
    </div>
  );
}

function BestSellers() {
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller);
  return (
    <section className="py-24 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-14">
          <Reveal direction="right">
            <p className="section-tag mb-3">Curated for You</p>
            <h2 className="section-title">Best Sellers</h2>
            <div className="divider-gold mx-0" />
          </Reveal>
          <Reveal direction="left" className="hidden md:block">
            <Link to="/shop" className="flex items-center gap-2 text-xs font-sans font-medium tracking-widest uppercase text-stone-500 hover:text-gold-600 transition-colors group">
              View All
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.map((p, i) => (
            <AnimatedCard key={p.id} product={p} delay={i * 90} />
          ))}
        </div>
        <div className="text-center mt-10 md:hidden">
          <Link to="/shop" className="btn-outline-gold">View All Products</Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FEATURE BANNER                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function FeatureBanner() {
  return (
    <section className="py-24 bg-[#0A0F0D] overflow-hidden relative">
      {/* Emerald ambient glow */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] rounded-full opacity-15 blur-3xl pointer-events-none" style={{background:'radial-gradient(circle, #1A6B4A 0%, transparent 70%)'}} />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vh] rounded-full opacity-10 blur-3xl pointer-events-none" style={{background:'radial-gradient(circle, #C8991E 0%, transparent 70%)'}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <Reveal direction="right">
            <p className="section-tag text-gold-400 mb-4">Premium Collection</p>
            <h2 className="font-display text-4xl md:text-6xl font-light text-cream leading-tight mb-6">
              Velvet Oud —<br />
              <em className="not-italic text-gradient-gold">Rare. Timeless.</em>
            </h2>
            <p className="text-cream/50 text-base leading-relaxed mb-8 max-w-md font-sans">
              Crafted from Cambodian agarwood aged over a decade. Only 500 bottles produced annually. Each numbered by hand.
            </p>
            <Link to="/product/velvet-oud" className="btn-gold group">
              Discover Velvet Oud
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <Reveal direction="left" delay={120}>
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto overflow-hidden group">
                <img
                  src="https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Velvet Oud"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 px-6 py-4" style={{background:'linear-gradient(135deg, #C8991E 0%, #EFC84A 100%)'}}>
                <p className="font-display text-2xl font-medium text-[#0A0F0D]">₹18,500</p>
                <p className="text-xs font-sans tracking-widest uppercase text-[#0A0F0D]/70">100ml · Limited</p>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 border border-[#1A6B4A]/30 rounded-full animate-spin-slow pointer-events-none" />
              <div className="absolute -top-8 -right-8 w-36 h-36 border border-gold-500/10 rounded-full animate-spin-slow pointer-events-none" style={{animationDirection:'reverse',animationDuration:'12s'}} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  NEW ARRIVALS                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
function NewArrivals() {
  const newProducts = PRODUCTS.filter((p) => p.isNew);
  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal direction="up" className="text-center mb-14">
          <p className="section-tag mb-3">Just Arrived</p>
          <h2 className="section-title">New Arrivals</h2>
          <div className="divider-gold" />
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newProducts.map((p, i) => (
            <AnimatedCard key={p.id} product={p} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TESTIMONIALS                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
function Testimonials() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const total = TESTIMONIALS.length;

  const go = (next) => {
    setDir(next > active ? 1 : -1);
    setActive(next);
  };

  useEffect(() => {
    const t = setInterval(() => go((active + 1) % total), 5000);
    return () => clearInterval(t);
  }, [active]);

  return (
    <section id="about" className="py-24 bg-[#F5F0E8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal direction="up">
          <p className="section-tag mb-3">What Our Customers Say</p>
          <h2 className="section-title mb-4">Stories of Scent</h2>
          <div className="divider-gold" />
        </Reveal>

        <div className="mt-14 relative" style={{ minHeight: 240 }}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.id}
              className="absolute inset-0 flex flex-col items-center px-4"
              style={{
                opacity:       i === active ? 1 : 0,
                transform:     i === active ? 'translateY(0)' : `translateY(${dir * 18}px)`,
                transition:    'opacity 0.5s ease, transform 0.5s ease',
                pointerEvents: i === active ? 'auto' : 'none',
              }}
            >
              <StarRating rating={t.rating} size={18} />
              <blockquote className="font-serif text-xl md:text-2xl font-light text-obsidian leading-relaxed mt-6 mb-8 italic max-w-2xl">
                "{t.text}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-sans font-semibold text-sm" style={{background:'linear-gradient(135deg,#1A6B4A,#C8991E)',color:'#fff'}}>
                  {t.avatar}
                </div>
                <div className="text-left">
                  <p className="font-sans font-medium text-obsidian text-sm">{t.name}</p>
                  <p className="font-sans text-xs text-stone-400">{t.location} · {t.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => go((active - 1 + total) % total)}
            className="w-10 h-10 border border-stone-200 flex items-center justify-center hover:border-gold-500 hover:bg-gold-50 transition-all duration-200"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2 items-center">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                style={{ transition: 'all 0.3s ease', background: i === active ? 'linear-gradient(90deg,#1A6B4A,#C8991E)' : undefined }}
                className={`rounded-full ${i === active ? 'w-6 h-2' : 'w-2 h-2 bg-stone-200 hover:bg-stone-300'}`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => go((active + 1) % total)}
            className="w-10 h-10 border border-stone-200 flex items-center justify-center hover:border-gold-500 hover:bg-gold-50 transition-all duration-200"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  NEWSLETTER                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-24 bg-[#0A0F0D] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{background:'radial-gradient(circle, rgba(26,107,74,0.12) 0%, transparent 70%)'}} />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{background:'radial-gradient(circle, rgba(200,153,30,0.08) 0%, transparent 70%)'}} />

      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <Reveal direction="up">
          <p className="section-tag text-gold-400 mb-3">Stay Connected</p>
          <h2 className="font-display text-3xl md:text-5xl font-light text-cream mb-4">
            The J Raph Streach Journal
          </h2>
          <p className="text-cream/50 text-sm mb-10 font-sans leading-relaxed">
            Fragrance stories, new arrivals, and exclusive offers — curated for the discerning nose.
          </p>
        </Reveal>

        {submitted ? (
          <div
            className="text-gold-400 font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2"
            style={{ animation: 'scaleIn 0.4s ease both' }}
          >
            <span className="text-lg">✓</span> Thank you for subscribing
          </div>
        ) : (
          <Reveal direction="up" delay={100}>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-white/5 border border-cream/20 px-4 py-3 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-gold-500 transition-all duration-300"
              />
              <button type="submit" className="btn-gold whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PAGE                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <SEO />
      <Hero />
      <MarqueeStrip />
      <TrustBadges />
      <Categories />
      <BestSellers />
      <FeatureBanner />
      <NewArrivals />
      <Testimonials />
      <Newsletter />
    </>
  );
}
