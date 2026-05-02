import { Link } from 'react-router-dom';
import { Zap, Shield, BarChart3, Globe, Check, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <Zap className="text-indigo-400" size={24} />,
    title: 'Lightning Fast',
    desc: 'Built on modern infrastructure that scales with your business from day one.',
  },
  {
    icon: <Shield className="text-indigo-400" size={24} />,
    title: 'Enterprise Security',
    desc: 'JWT auth, bcrypt hashing, rate limiting, and webhook signature verification.',
  },
  {
    icon: <BarChart3 className="text-indigo-400" size={24} />,
    title: 'Real-time Analytics',
    desc: 'Track revenue, user growth, and plan conversions from your admin panel.',
  },
  {
    icon: <Globe className="text-indigo-400" size={24} />,
    title: 'UPI & Card Payments',
    desc: 'Powered by Razorpay — supports UPI, cards, net banking, and wallets.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    features: ['Up to 100 requests/day', 'Community support', 'Basic analytics', '1 project'],
    cta: 'Get Started',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '₹499',
    period: '/month',
    features: ['Up to 10,000 requests/day', 'Email support', 'Advanced analytics', '5 projects', 'API access'],
    cta: 'Start Starter',
    href: '/signup',
    highlight: true,
    plan: 'starter',
  },
  {
    name: 'Pro',
    price: '₹999',
    period: '/month',
    features: ['Unlimited requests', 'Priority support', 'Full analytics suite', 'Unlimited projects', 'API access', 'Custom integrations'],
    cta: 'Go Pro',
    href: '/signup',
    highlight: false,
    plan: 'pro',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-24 px-4 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🚀 Now with UPI support
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Build, Launch &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Scale
            </span>{' '}
            Faster
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            LaunchKit gives you authentication, payments, and analytics out of the box — so you can focus on what makes your product unique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary flex items-center justify-center gap-2">
              Start for free <ArrowRight size={18} />
            </Link>
            <a href="#pricing" className="btn-outline flex items-center justify-center gap-2">
              View pricing
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            Everything you need to ship
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
            Stop reinventing the wheel. LaunchKit handles the boring parts so you can build the interesting ones.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-indigo-500/50 transition-colors">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-400 text-center mb-16">
            No hidden fees. Cancel anytime. Powered by Razorpay.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card relative flex flex-col ${
                  plan.highlight
                    ? 'border-indigo-500 ring-1 ring-indigo-500'
                    : ''
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-white font-bold text-xl mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check size={16} className="text-indigo-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.href}
                  state={plan.plan ? { plan: plan.plan } : undefined}
                  className={plan.highlight ? 'btn-primary text-center' : 'btn-outline text-center'}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} LaunchKit. All rights reserved.</p>
        <p className="mt-2">
          Payments secured by{' '}
          <a
            href="https://razorpay.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            Razorpay
          </a>
          . Compliant with RBI guidelines.
        </p>
      </footer>
    </div>
  );
}
