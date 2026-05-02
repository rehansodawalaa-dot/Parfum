import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const passwordRules = [
  { label: 'At least 8 characters',          test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',            test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',            test: (p) => /[a-z]/.test(p) },
  { label: 'One number',                      test: (p) => /\d/.test(p) },
];

export default function Signup() {
  const navigate   = useNavigate();
  const { signup } = useAuthStore();

  const [form, setForm]         = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) e.password = 'Password must contain an uppercase letter';
    if (!/\d/.test(form.password)) e.password = 'Password must contain a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Parfum.', {
        style: { background: '#0a0a0a', color: '#faf8f4', border: '1px solid #d4a843' },
      });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left — decorative */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/2253833/pexels-photo-2253833.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-obsidian/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
          <p className="font-display text-4xl font-light text-cream mb-4">
            Join Parfum
          </p>
          <p className="text-cream/60 font-sans text-sm leading-relaxed max-w-xs">
            Create an account to track orders, save favourites, and access exclusive member pricing.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-2xl font-medium tracking-[0.15em] uppercase text-obsidian block mb-10">
            Parfum
          </Link>

          <h1 className="font-serif text-2xl font-medium text-obsidian mb-1">Create Account</h1>
          <p className="text-stone-400 text-sm font-sans mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-600 hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="name" className="label-luxury">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`input-luxury ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Jane Doe"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1 font-sans">{errors.name}</p>}
            </div>

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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`input-luxury pr-11 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-obsidian transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1 font-sans">{errors.password}</p>}

              {/* Password strength indicators */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map((r) => (
                    <div key={r.label} className="flex items-center gap-1.5">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${r.test(form.password) ? 'bg-green-500' : 'bg-stone-200'}`}>
                        {r.test(form.password) && <Check size={8} className="text-white" />}
                      </div>
                      <span className={`text-[11px] font-sans ${r.test(form.password) ? 'text-green-600' : 'text-stone-400'}`}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-dark w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-cream" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 font-sans mt-8">
            By creating an account you agree to our{' '}
            <a href="#" className="underline hover:text-obsidian">Terms</a> and{' '}
            <a href="#" className="underline hover:text-obsidian">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
