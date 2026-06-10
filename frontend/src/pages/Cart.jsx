import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/format';

const TAX_RATE = 0.18; // 18% GST

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const tax      = Math.round(subtotal * TAX_RATE);
  const shipping = subtotal >= 3000 ? 0 : 299;
  const total    = subtotal + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
        <div className="text-center max-w-sm px-4">
          <ShoppingBag size={56} className="text-stone-200 mx-auto mb-6" />
          <h2 className="font-serif text-2xl font-medium text-obsidian mb-3">Your cart is empty</h2>
          <p className="text-stone-400 text-sm font-sans mb-8">
            Discover our collection of fine fragrances and find your signature scent.
          </p>
          <Link to="/shop" className="btn-dark">
            Explore Fragrances <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-medium text-obsidian">
            Shopping Cart <span className="text-stone-300 text-xl">({items.reduce((s, i) => s + i.quantity, 0)})</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-xs font-sans font-medium tracking-widest uppercase text-stone-400 hover:text-red-500 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, size, quantity }) => (
              <div
                key={`${product.id}-${size}`}
                className="bg-white border border-stone-100 p-4 flex gap-4"
              >
                {/* Image */}
                <Link to={`/product/${product.slug}`} className="flex-shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-20 h-24 md:w-24 md:h-28 object-cover bg-stone-50"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-stone-400 mb-0.5">
                        {product.brand}
                      </p>
                      <Link
                        to={`/product/${product.slug}`}
                        className="font-serif text-base font-medium text-obsidian hover:text-gold-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-stone-400 font-sans mt-0.5">{size}</p>
                    </div>
                    <button
                      onClick={() => removeItem(product.id, size)}
                      className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0"
                      aria-label={`Remove ${product.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Qty */}
                    <div className="flex items-center border border-stone-200">
                      <button
                        onClick={() => updateQuantity(product.id, size, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-sans font-medium">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, size, quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 transition-colors"
                        aria-label="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    {/* Price */}
                    <p className="font-sans font-semibold text-obsidian">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-100 p-6 sticky top-24">
              <h2 className="font-serif text-xl font-medium text-obsidian mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-obsidian">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-stone-500">GST (18%)</span>
                  <span className="text-obsidian">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-stone-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-obsidian'}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-stone-400 font-sans">
                    Add {formatPrice(3000 - subtotal)} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-stone-100 pt-4 mb-6">
                <div className="flex justify-between font-sans font-semibold text-obsidian">
                  <span>Total</span>
                  <span className="text-lg">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-stone-400 mt-1 font-sans">Inclusive of all taxes</p>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-dark w-full mb-3"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              <Link to="/shop" className="block text-center text-xs font-sans font-medium tracking-widest uppercase text-stone-400 hover:text-obsidian transition-colors">
                Continue Shopping
              </Link>

              {/* Trust */}
              <div className="mt-6 pt-5 border-t border-stone-100 space-y-2">
                {['Secure checkout via Razorpay', 'Free returns within 15 days', '100% authentic products'].map((t) => (
                  <p key={t} className="text-xs font-sans text-stone-400 flex items-center gap-2">
                    <span className="text-gold-500">✓</span> {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
