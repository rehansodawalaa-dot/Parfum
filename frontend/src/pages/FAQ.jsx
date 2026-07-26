import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';

const FAQS = [
  {
    category: 'Orders & Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept UPI, all major credit/debit cards (Visa, Mastercard, RuPay), net banking, wallets, and Cash on Delivery.' },
      { q: 'Can I modify or cancel my order?', a: 'Orders can be cancelled within 1 hour of placement by contacting support. Once the order is packed or shipped, it cannot be modified.' },
      { q: 'Is Cash on Delivery available?', a: 'Yes! COD is available on all orders. Please keep the exact amount ready at the time of delivery.' },
      { q: 'Will I receive an order confirmation?', a: 'Yes — a confirmation email is sent immediately after your order is placed, along with your order number.' },
    ],
  },
  {
    category: 'Products & Authenticity',
    items: [
      { q: 'Are the fragrances 100% authentic?', a: 'Absolutely. Every fragrance we sell is sourced directly from verified distributors and master perfumers. We do not sell replicas or imitations.' },
      { q: 'What concentration are the fragrances?', a: 'We offer Eau de Parfum (EDP) and Parfum concentrations, which offer the best longevity — typically 6–12 hours.' },
      { q: 'Do the fragrances come with a box?', a: 'Yes, all fragrances are shipped in their original branded packaging.' },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery: 3–7 business days. Express delivery: 1–2 business days (available at select pin codes).' },
      { q: 'Do you offer free shipping?', a: 'Yes — orders above ₹3,000 qualify for free shipping. A flat ₹299 fee applies below that.' },
      { q: 'Can I track my order?', a: "Yes. Once shipped, you'll receive a tracking number via email and SMS. You can also track orders from your account page." },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is the return window?', a: '15 days from the date of delivery for unused, sealed products.' },
      { q: 'How do I return a product?', a: "Email support@jraphstreach.com with your order number. We'll arrange a free pickup." },
      { q: 'How long do refunds take?', a: '5–7 business days after the returned item is received and inspected.' },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="font-sans text-sm font-medium text-obsidian">{q}</span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="font-sans text-sm text-stone-500 leading-relaxed pb-4">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <>
      <SEO title="FAQ" />
      <div className="min-h-screen bg-cream pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-14">
            <p className="section-tag mb-3">Help</p>
            <h1 className="section-title">Frequently Asked Questions</h1>
            <div className="divider-gold" />
          </div>

          <div className="space-y-10">
            {FAQS.map((cat) => (
              <div key={cat.category}>
                <h2 className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-stone-400 mb-2">
                  {cat.category}
                </h2>
                <div>
                  {cat.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0A0F0D] p-6 text-center mt-12">
            <p className="font-sans text-cream/70 text-sm mb-3">Didn't find your answer?</p>
            <a href="mailto:support@jraphstreach.com" className="btn-gold text-xs inline-flex">
              Email Us
            </a>
          </div>

          <div className="text-center mt-8">
            <Link to="/shop" className="text-xs font-sans font-medium tracking-widest uppercase text-stone-400 hover:text-obsidian transition-colors">
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
