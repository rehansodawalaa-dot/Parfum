import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useWishlistStore from '../store/wishlistStore';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/format';
import StarRating from '../components/StarRating';
import SEO from '../components/SEO';

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const handleMoveToCart = (product) => {
    addItem(product, product.sizes?.[product.sizes.length - 1] || '100ml');
    removeFromWishlist(product._id || product.id);
    toast.success(`${product.name} moved to cart`, {
      style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' },
    });
  };

  return (
    <>
      <SEO title="My Wishlist" description="Your saved fragrances from J Raph Streach." />
      <div className="min-h-screen bg-cream pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="mb-8">
            <p className="section-tag mb-1">My Account</p>
            <h1 className="font-serif text-3xl font-medium text-obsidian flex items-center gap-3">
              <Heart size={24} className="text-red-400 fill-red-400" />
              Wishlist
            </h1>
            <p className="text-stone-400 text-sm font-sans mt-1">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24">
              <Heart size={52} className="text-stone-200 mx-auto mb-4" />
              <p className="font-serif text-xl text-stone-300 mb-2">Your wishlist is empty</p>
              <p className="text-stone-400 text-sm font-sans mb-8">
                Browse our collection and heart the fragrances you love.
              </p>
              <Link to="/shop" className="btn-dark inline-flex">Explore Fragrances</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((product) => {
                const id = product._id || product.id;
                return (
                  <div key={id} className="bg-white border border-stone-100 group hover:border-stone-200 transition-colors">
                    {/* Image */}
                    <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] bg-stone-50">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-stone-400 mb-1">
                        {product.brand}
                      </p>
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-serif text-base font-medium text-obsidian hover:text-gold-700 transition-colors leading-snug mb-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 mb-3">
                        <StarRating rating={product.rating} size={11} />
                        <span className="text-[11px] text-stone-400">({product.reviewCount || 0})</span>
                      </div>
                      <p className="font-sans font-semibold text-obsidian mb-4">{formatPrice(product.price)}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveToCart(product)}
                          className="flex-1 btn-dark text-xs py-2.5 hover:bg-gold-500 hover:text-obsidian"
                        >
                          <ShoppingBag size={13} />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(id)}
                          className="w-9 h-9 flex items-center justify-center border border-stone-200 hover:border-red-300 hover:text-red-500 text-stone-300 transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
