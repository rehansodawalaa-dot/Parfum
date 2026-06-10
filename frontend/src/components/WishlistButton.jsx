import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import useWishlistStore from '../store/wishlistStore';
import useAuthStore from '../store/authStore';

/**
 * Animated heart button for wishlisting a product.
 * Works in demo mode (localStorage) and with backend.
 */
export default function WishlistButton({ product, className = '', size = 16 }) {
  const { isAuthenticated } = useAuthStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const productId = product?._id || product?.id;
  const wishlisted = isWishlisted(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to save items to your wishlist.', {
        style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' },
      });
      return;
    }

    await toggleWishlist(product);

    if (!wishlisted) {
      toast.success(`${product.name} saved to wishlist`, {
        icon: '❤️',
        style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' },
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={wishlisted ? `Remove ${product?.name} from wishlist` : `Add ${product?.name} to wishlist`}
      className={`group flex items-center justify-center transition-all duration-200 ${className}`}
    >
      <Heart
        size={size}
        className={`transition-all duration-300 ${
          wishlisted
            ? 'fill-red-500 text-red-500 scale-110'
            : 'fill-transparent text-stone-400 group-hover:text-red-400 group-hover:scale-110'
        }`}
      />
    </button>
  );
}
