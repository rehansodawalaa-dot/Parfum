import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Navbar          from './components/Navbar';
import Footer          from './components/Footer';
import ProtectedRoute  from './components/ProtectedRoute';
import { AdminRoute }  from './components/ProtectedRoute';
import CursorGlow      from './components/CursorGlow';
import PageTransition  from './components/PageTransition';
import ErrorBoundary   from './components/ErrorBoundary';

import Home          from './pages/Home';
import Shop          from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Login         from './pages/Login';
import Signup        from './pages/Signup';
import Account       from './pages/Account';
import AdminPanel    from './pages/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

// Pages that use their own full-screen layout (no navbar/footer)
const NO_CHROME = ['/login', '/signup'];

function Layout() {
  const { pathname } = useLocation();
  const hideChrome   = NO_CHROME.includes(pathname);

  return (
    <>
      {!hideChrome && <Navbar />}
      <PageTransition>
        <main>
          <Routes>
            {/* Public */}
            <Route path="/"              element={<Home />} />
            <Route path="/shop"          element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart"          element={<Cart />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/signup"        element={<Signup />} />

            {/* Authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account"  element={<Account />} />
            </Route>

            {/* Admin only */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-cream pt-20">
                <div className="text-center" style={{ animation: 'fadeUp 0.6s ease both' }}>
                  <p className="font-display text-9xl font-light text-stone-200 mb-4">404</p>
                  <p className="font-serif text-2xl text-obsidian mb-8">Page not found</p>
                  <a href="/" className="btn-dark">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </PageTransition>
      {!hideChrome && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CursorGlow />
          <Layout />
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              borderRadius: '0',
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
