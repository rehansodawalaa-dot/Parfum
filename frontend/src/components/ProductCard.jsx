import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Zap } from 'lucide-react';
import useSettingsStore from '../store/settingsStore';
import { formatPrice, discountPercent } from '../utils/format';
import WishlistButton from './WishlistButton';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const dataSaver = useSettingsStore((s) => s.dataSaverEnabled);
  const discount = discountPercent(product.originalPrice, product.price);

  return (
    <div
      className="card-product group cursor-pointer"
      onMouseEnter={() => !dataSaver && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* ── Image container ── */}
        <div className="relative overflow-hidden bg-stone-50 aspect-[3/4]">

          {/* Primary image */}
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-luxury ${
              hovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />

          {/* Secondary image (crossfade) — disabled in data saver mode */}
          {product.images[1] && !dataSaver && (
            <img
              src={product.images[1]}
              alt=""
              loading="lazy"
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-luxury ${
                hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            />
          )}

          {/* Subtle dark overlay on hover */}
          {!dataSaver && (
            <div className={`absolute inset-0 bg-obsidian transition-opacity duration-500 ${hovered ? 'opacity-20' : 'opacity-0'}`} />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <span className="bg-obsidian text-cream text-[10px] font-sans font-medium tracking-widest uppercase px-2.5 py-1">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="bg-gold-500 text-obsidian text-[10px] font-sans font-bold tracking-widest uppercase px-2.5 py-1">
                -{discount}%
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-white/90 text-obsidian text-[10px] font-sans font-medium tracking-widest uppercase px-2.5 py-1">
                Best Seller
              </span>
            )}
          </div>

          {/* Wishlist button — top right */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton
              product={product}
              className="w-8 h-8 bg-white/90 hover:bg-white border border-stone-100"
              size={14}
            />
          </div>

          {/* Hover action bar — slides up */}
          <div
            className={`absolute bottom-0 left-0 right-0 flex gap-2 p-3 z-10 transition-all duration-400 ease-luxury ${
              hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <Link
              to={`/product/${product.slug}`}
              className="flex-1 btn-dark text-xs py-2.5 px-3 hover:bg-gold-400 hover:text-obsidian"
              aria-label={`Quick shop ${product.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Zap size={13} />
              Quick Shop
            </Link>
            <Link
              to={`/product/${product.slug}`}
              className="btn-outline-gold text-xs py-2.5 px-3 bg-white/90 hover:bg-white"
              aria-label={`View ${product.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Eye size={13} />
            </Link>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="p-4">
          <p className="text-[10px] font-sans font-medium tracking-[0.22em] uppercase text-stone-400 mb-1 transition-colors duration-200 group-hover:text-[#1A6B4A]">
            {product.brand}
          </p>
          <h3 className="font-serif text-base font-medium text-obsidian mb-2 leading-snug transition-colors duration-200 group-hover:text-[#C8991E]">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-semibold text-obsidian">{formatPrice(product.price)}</span>
            {discount > 0 && (
              <span className="font-sans text-sm text-stone-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
