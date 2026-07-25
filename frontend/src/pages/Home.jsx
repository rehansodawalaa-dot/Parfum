import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import useSlideIn from '../hooks/useSlideIn';
import SEO from '../components/SEO';
import { CATEGORIES } from '../data/products';
import api from '../lib/api';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  HERO                                                                        */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
        {/* Amethyst ambient glow â€” top right */}
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


/* --------------------------------------------------------------------------- */
/*  PROMISE BAR                                                                 */
/* --------------------------------------------------------------------------- */
const PROMISES = [
  { icon: "✦", label: "Authentic Fragrances",   sub: "Sourced from master perfumers" },
  { icon: "↩", label: "15-Day Easy Returns",     sub: "Hassle-free, no questions asked" },
  { icon: "🔒", label: "Secure Checkout",         sub: "Encrypted via Razorpay" },
  { icon: "✦", label: "New Collection 2025",      sub: "Curated drops every season" },
];

function PromiseBar() {
  return (
    <section className="bg-[#0A0F0D] border-y border-[#1A6B4A]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#1A6B4A]/20">
          {PROMISES.map((p, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-3 py-5 px-4 sm:px-6 group"
            >
              <span
                className="text-xl flex-shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110"
                style={{ color: "#D4A96A" }}
                aria-hidden="true"
              >
                {p.icon}
              </span>
              <div className="text-center sm:text-left">
                <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-cream leading-snug">
                  {p.label}
                </p>
                <p className="font-sans text-[11px] text-cream/45 mt-0.5 leading-snug">
                  {p.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  TRUST BADGES                                                                */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const BADGES = [
  { label: 'Easy Returns',   sub: '15-day hassle-free returns',  icon: 'â†©' },
  { label: 'Secure Payment', sub: 'Razorpay encrypted checkout', icon: 'ðŸ”’' },
];

function TrustBadges() {
  return (
    <section className="py-12 bg-[#F5F0E8] border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 max-w-xl mx-auto">
          {BADGES.map((b, i) => (
            /* Reveal wraps a plain div â€” no hover state conflict */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  CATEGORIES                                                                  */
/*  Fix: Reveal wraps a neutral <div>; the <Link> inside is NOT wrapped        */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CategoryCard({ cat, delay }) {
  const [ref, style] = useSlideIn(delay);

  return (
    <div ref={ref} style={style}>
      <Link
        to={`/shop?category=${cat.id}`}
        className="group relative overflow-hidden bg-stone-100 aspect-square flex flex-col items-center justify-center text-center p-6 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(26,107,74,0.35)] block"
      >
        {/* Emerald-to-gold gradient overlay â€” slides up on hover */}
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  BEST SELLERS                                                                */
/*  Fix: ProductCard is NOT wrapped in Reveal â€” it has its own hover states    */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AnimatedCard({ product, delay }) {
  const [ref, style] = useSlideIn(delay);
  return (
    <div ref={ref} style={style}>
      <ProductCard product={product} />
    </div>
  );
}

function BestSellers() {
  const { data: apiProducts, isLoading } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => api.get('/products?limit=100').then((r) => r.data.products),
    staleTime: 60_000,
  });
  const bestSellers = (apiProducts || []).filter((p) => p.isBestSeller);

  if (isLoading) return (
    <section className="py-24 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white animate-pulse">
              <div className="aspect-[3/4] bg-stone-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-stone-100 rounded w-2/3" />
                <div className="h-4 bg-stone-100 rounded w-full" />
                <div className="h-4 bg-stone-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (!bestSellers.length) return null;
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
            <AnimatedCard key={p._id || p.id} product={p} delay={i * 90} />
          ))}
        </div>
        <div className="text-center mt-10 md:hidden">
          <Link to="/shop" className="btn-outline-gold">View All Products</Link>
        </div>
      </div>
    </section>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  FEATURE BANNER                                                              */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
              Velvet Oud â€”<br />
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
                <p className="font-display text-2xl font-medium text-[#0A0F0D]">â‚¹18,500</p>
                <p className="text-xs font-sans tracking-widest uppercase text-[#0A0F0D]/70">100ml Â· Limited</p>
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  NEW ARRIVALS                                                                */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function NewArrivals() {
  const { data: apiProducts, isLoading } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => api.get('/products?limit=100').then((r) => r.data.products),
    staleTime: 60_000,
  });
  const newProducts = (apiProducts || []).filter((p) => p.isNew);

  if (isLoading) return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white animate-pulse">
              <div className="aspect-[3/4] bg-stone-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-stone-100 rounded w-2/3" />
                <div className="h-4 bg-stone-100 rounded w-full" />
                <div className="h-4 bg-stone-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (!newProducts.length) return null;
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
            <AnimatedCard key={p._id || p.id} product={p} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  NEWSLETTER                                                                  */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
            Fragrance stories, new arrivals, and exclusive offers â€” curated for the discerning nose.
          </p>
        </Reveal>

        {submitted ? (
          <div
            className="text-gold-400 font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2"
            style={{ animation: 'scaleIn 0.4s ease both' }}
          >
            <span className="text-lg">âœ“</span> Thank you for subscribing
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  PAGE                                                                        */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function Home() {
  return (
    <>
      <SEO />
      <Hero />
      <PromiseBar />
      <TrustBadges />
      <Categories />
      <BestSellers />
      <FeatureBanner />
      <NewArrivals />
      <Newsletter />
    </>
  );
}
