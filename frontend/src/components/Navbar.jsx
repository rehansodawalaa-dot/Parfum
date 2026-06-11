import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User, Heart } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useWishlistStore from '../store/wishlistStore';

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [cartBump,  setCartBump]  = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const items     = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const { isAuthenticated, logout } = useAuthStore();
  const user = useAuthStore((s) => s.user);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const isHome = location.pathname === '/';

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Cart badge bump animation */
  useEffect(() => {
    if (totalItems > prevCount) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 400);
      return () => clearTimeout(t);
    }
    setPrevCount(totalItems);
  }, [totalItems]);

  /* Close mobile menu on route change */
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const navLinks = [
    { label: 'Shop',        href: '/shop' },
    { label: 'Collections', href: '/shop?category=premium' },
    { label: 'About',       href: '/#about', scroll: true },
  ];

  const isTransparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-luxury ${
          isTransparent
            ? 'bg-transparent text-ivory h-20'
            : 'navbar-glass text-soft-black h-16'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">

            {/* Logo */}
            <Link
              to="/"
              className="font-display text-xl md:text-2xl font-medium tracking-[0.18em] uppercase transition-opacity duration-200 hover:opacity-70"
            >
              J Raph Streach
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => {
                const linkClass = "relative text-xs font-sans font-medium tracking-[0.22em] uppercase opacity-70 hover:opacity-100 transition-opacity duration-200 group";
                const underline = <span className="absolute -bottom-0.5 left-0 w-0 h-px transition-all duration-300 group-hover:w-full" style={{background:'linear-gradient(90deg,var(--color-luxury-gold),var(--color-amethyst))'}} />;

                if (l.scroll) {
                  return (
                    <button
                      key={l.label}
                      onClick={() => {
                        if (location.pathname !== '/') {
                          navigate('/');
                          setTimeout(() => {
                            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                          }, 300);
                        } else {
                          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={linkClass}
                    >
                      {l.label}
                      {underline}
                    </button>
                  );
                }
                return (
                  <Link key={l.label} to={l.href} className={linkClass}>
                    {l.label}
                    {underline}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-5">
              <button
                aria-label="Search"
                onClick={() => navigate('/shop')}
                className="opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-110 hidden md:block"
              >
                <Search size={17} />
              </button>

              {isAuthenticated ? (
                <div className="relative group hidden md:block">
                  <button
                    aria-label="Account"
                    className="opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-110"
                  >
                    <User size={17} />
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-3 w-48 glass shadow-luxury opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all duration-200 overflow-hidden">
                    {user?.role === 'admin' ? (
                      <Link to="/admin" className="block px-4 py-3 text-xs tracking-widest uppercase hover:bg-[#1A6B4A]/10 hover:text-[#1A6B4A] transition-colors" style={{color:'var(--color-soft-black)'}}>
                        Admin Panel
                      </Link>
                    ) : (
                      <Link to="/account" className="block px-4 py-3 text-xs tracking-widest uppercase hover:bg-[#1A6B4A]/10 hover:text-[#1A6B4A] transition-colors" style={{color:'var(--color-soft-black)'}}>
                        My Account
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-xs tracking-widest uppercase transition-colors text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-110 hidden md:block"
                >
                  <User size={17} />
                </Link>
              )}

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="relative opacity-70 hover:opacity-100 transition-all duration-200 hover:scale-110"
                  aria-label={`Wishlist (${wishlistCount} items)`}
                >
                  <Heart size={20} className={wishlistCount > 0 ? 'fill-[#D4A96A] text-[#D4A96A]' : ''} style={wishlistCount > 0 ? {fill:'var(--color-rose-gold)',color:'var(--color-rose-gold)'} : {}} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{background:'var(--color-amethyst)', color:'#fff'}}>
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative opacity-70 hover:opacity-100 transition-all duration-200 hover:scale-110"
                aria-label={`Cart (${totalItems} items)`}
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-2 -right-2 bg-gold-500 text-obsidian text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-200 ${
                      cartBump ? 'scale-150' : 'scale-100'
                    }`}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile hamburger */}
              <button
                className="md:hidden opacity-70 hover:opacity-100 transition-all duration-200 relative w-6 h-6 flex items-center justify-center"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <span
                  className={`absolute transition-all duration-300 ${menuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
                >
                  <X size={22} />
                </span>
                <span
                  className={`absolute transition-all duration-300 ${menuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}
                >
                  <Menu size={22} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ease-luxury ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-72 flex flex-col pt-20 px-8 shadow-2xl transition-transform duration-500 ease-luxury ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{background:'#F5F0E8'}}
        >
          <nav className="flex flex-col gap-0 mt-4">
            {navLinks.map((l, i) => {
              const cls = "font-display text-2xl font-medium text-obsidian border-b border-stone-100 py-5 hover:text-[#1A6B4A] hover:pl-2 transition-all duration-200";
              if (l.scroll) {
                return (
                  <button
                    key={l.label}
                    onClick={() => {
                      setMenuOpen(false);
                      if (location.pathname !== '/') {
                        navigate('/');
                        setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 300);
                      } else {
                        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`text-left ${cls}`}
                    style={{ transitionDelay: menuOpen ? `${i * 50}ms` : '0ms' }}
                  >
                    {l.label}
                  </button>
                );
              }
              return (
                <Link
                  key={l.label}
                  to={l.href}
                  className={cls}
                  style={{ transitionDelay: menuOpen ? `${i * 50}ms` : '0ms' }}
                >
                  {l.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' ? (
                  <Link to="/admin" className="font-display text-2xl font-medium text-obsidian border-b border-stone-100 py-5 hover:text-[#1A6B4A] hover:pl-2 transition-all duration-200">
                    Admin Panel
                  </Link>
                ) : (
                  <Link to="/account" className="font-display text-2xl font-medium text-obsidian border-b border-stone-100 py-5 hover:text-[#1A6B4A] hover:pl-2 transition-all duration-200">
                    My Account
                  </Link>
                )}
                <button onClick={logout} className="text-left font-display text-2xl font-medium text-red-400 py-5 hover:text-red-600 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="font-display text-2xl font-medium text-obsidian border-b border-stone-100 py-5 hover:text-[#1A6B4A] hover:pl-2 transition-all duration-200">
                Login
              </Link>
            )}
          </nav>

          {/* Bottom social strip */}
          <div className="mt-auto pb-8">
            <p className="text-xs font-sans tracking-widest uppercase text-stone-400 mb-3">Follow Us</p>
            <div className="flex gap-3">
              {['IG', 'TW', 'FB'].map((s) => (
                <a key={s} href="#" className="w-9 h-9 border border-stone-200 flex items-center justify-center text-xs font-sans font-medium text-stone-500 hover:border-[#1A6B4A] hover:text-[#1A6B4A] transition-all duration-200">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
