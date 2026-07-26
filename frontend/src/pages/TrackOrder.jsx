import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import SEO from '../components/SEO';
import useAuthStore from '../store/authStore';

export default function TrackOrder() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <SEO title="Track Order" />
      <div className="min-h-screen bg-cream pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 bg-stone-100 flex items-center justify-center mx-auto mb-6">
            <Package size={28} className="text-stone-400" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-obsidian mb-3">Track Your Order</h1>
          <p className="font-sans text-stone-500 text-sm mb-8 leading-relaxed">
            {isAuthenticated
              ? 'View the status and tracking details of all your orders from your account page.'
              : 'Log in to view your order history and track your deliveries in real time.'}
          </p>

          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/account" className="btn-dark flex items-center justify-center gap-2">
                <Package size={15} /> View My Orders
              </Link>
              <Link to="/shop" className="btn-outline-gold">Continue Shopping</Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login" className="btn-dark">Log In</Link>
              <Link to="/signup" className="btn-outline-gold">Create Account</Link>
            </div>
          )}

          <p className="font-sans text-xs text-stone-400 mt-8">
            Need help? Email us at{' '}
            <a href="mailto:support@jraphstreach.com" className="underline hover:text-obsidian">
              support@jraphstreach.com
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
