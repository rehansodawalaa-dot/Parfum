import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import { formatPrice, discountPercent } from '../utils/format';
import StarRating from './StarRating';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const discount = discountPercent(product.originalPrice, product.price);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes[product.sizes.length - 1]);
    toast.success(`${product.name} added to cart`, {
      style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' },
      iconTheme: { primary: '#d4a843', secondary: '#0a0a0a' },
    });
  };

  return (
    <div
      className="card-product group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
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

          {/* Secondary image (crossfade) */}
          {product.images[1] && (
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
          <div className={`absolute inset-0 bg-obsidian transition-opacity duration-500 ${hovered ? 'opacity-20' : 'opacity-0'}`} />

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

          {/* Hover action bar — slides up */}
          <div
            className={`absolute bottom-0 left-0 right-0 flex gap-2 p-3 z-10 transition-all duration-400 ease-luxury ${
              hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <button
              onClick={handleAddToCart}
              className="flex-1 btn-dark text-xs py-2.5 px-3 hover:bg-gold-500 hover:text-obsidian"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={13} />
              Add to Cart
            </button>
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
          <p className="text-[10px] font-sans font-medium tracking-[0.22em] uppercase text-stone-400 mb-1 transition-colors duration-200 group-hover:text-gold-600">
            {product.brand}
          </p>
          <h3 className="font-serif text-base font-medium text-obsidian mb-2 leading-snug transition-colors duration-200 group-hover:text-gold-700">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <StarRating rating={product.rating} size={12} />
            <span className="text-[11px] text-stone-400">({product.reviewCount})</span>
          </div>
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
