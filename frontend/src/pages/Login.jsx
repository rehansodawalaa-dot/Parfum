import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuthStore();
  const from      = location.state?.from || '/';

  const [form, setForm]           = useState({ email: '', password: '' });
  const [errors, setErrors]       = useState({});
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const validate = () => {
    const e = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success('Welcome back!', {
        style: { background: '#0A0F0D', color: '#F5F0E8', border: '1px solid #C8991E' },
      });
      // Redirect admin to admin panel, users to account or intended page
      if (data.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from === '/' ? '/account' : from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left — decorative */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(10,15,13,0.75) 0%, rgba(26,107,74,0.35) 100%)'}} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
          <p className="font-display text-4xl font-light text-cream mb-4">
            Welcome Back
          </p>
          <p className="text-cream/60 font-sans text-sm leading-relaxed max-w-xs">
            Sign in to access your orders, wishlist, and exclusive member offers.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-2xl font-medium tracking-[0.15em] uppercase text-obsidian block mb-10">
            J Raph Streach
          </Link>

          <h1 className="font-serif text-2xl font-medium text-obsidian mb-1">Sign In</h1>
          <p className="text-stone-400 text-sm font-sans mb-6">
            Don't have an account?{' '}
            <Link to="/signup" className="hover:underline" style={{color:'#C8991E'}}>Create one</Link>
          </p>

          {/* Demo credentials banner */}
          <div className="border p-4 mb-6 space-y-2" style={{background:'rgba(200,153,30,0.06)', borderColor:'rgba(200,153,30,0.25)'}}>
            <p className="text-xs font-sans font-semibold tracking-widest uppercase mb-2" style={{color:'#a07820'}}>Demo Accounts</p>
            <div
              className="flex items-center justify-between cursor-pointer px-2 py-3 rounded transition-colors hover:bg-gold-100 min-h-[44px]"
              onClick={() => setForm({ email: 'user@jraphstreach.com', password: 'User@1234' })}
            >
              <div>
                <p className="text-xs font-sans font-medium text-obsidian">👤 User Account</p>
                <p className="text-[11px] font-mono text-stone-500">user@jraphstreach.com · User@1234</p>
              </div>
              <span className="text-[10px] font-sans font-medium" style={{color:'#C8991E'}}>Click to fill</span>
            </div>
            <div
              className="flex items-center justify-between cursor-pointer px-2 py-3 rounded transition-colors hover:bg-gold-100 min-h-[44px]"
              onClick={() => setForm({ email: 'admin@jraphstreach.com', password: 'Admin@1234' })}
            >
              <div>
                <p className="text-xs font-sans font-medium text-obsidian">🔑 Admin Account</p>
                <p className="text-[11px] font-mono text-stone-500">admin@jraphstreach.com · Admin@1234</p>
              </div>
              <span className="text-[10px] font-sans font-medium" style={{color:'#C8991E'}}>Click to fill</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="label-luxury">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`input-luxury ${errors.email ? 'border-red-400' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1 font-sans">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label-luxury">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`input-luxury pr-11 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-0 top-0 w-11 h-full flex items-center justify-center text-stone-400 hover:text-obsidian transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1 font-sans">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-dark w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-cream" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 font-sans mt-8">
            By signing in you agree to our{' '}
            <a href="#" className="underline hover:text-obsidian">Terms</a> and{' '}
            <a href="#" className="underline hover:text-obsidian">Privacy Policy</a>.
          </p>

          {/* Create account CTA */}
          <div className="mt-8 border border-stone-100 p-5 text-center">
            <p className="font-serif text-base font-medium text-obsidian mb-1">New to J Raph Streach?</p>
            <p className="text-xs text-stone-400 font-sans mb-4">Join us for exclusive access and member-only pricing.</p>
            <Link to="/signup" className="btn-rose w-full text-xs py-2.5">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
