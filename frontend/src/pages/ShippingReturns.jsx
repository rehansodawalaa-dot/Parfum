import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const SECTIONS = [
  {
    title: 'Shipping Policy',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 3–7 business days. Express delivery (1–2 business days) is available at checkout for select pin codes.' },
      { q: 'Is shipping free?', a: 'Yes — orders above ₹3,000 ship free. A flat ₹299 shipping fee applies to orders below that.' },
      { q: 'Do you ship pan-India?', a: 'We deliver to all serviceable pin codes across India. Enter your pin code at checkout to confirm availability.' },
      { q: 'Will I get a tracking number?', a: 'Yes. Once your order ships, you will receive an email and SMS with your tracking number and carrier details.' },
    ],
  },
  {
    title: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: 'We offer hassle-free returns within 15 days of delivery. The product must be unused, in its original sealed packaging.' },
      { q: 'How do I initiate a return?', a: 'Email us at support@jraphstreach.com with your order number and reason for return. Our team will arrange a pickup within 2 business days.' },
      { q: 'When will I get my refund?', a: 'Refunds are processed within 5–7 business days after we receive and inspect the returned item. The amount is credited to your original payment method.' },
      { q: 'Are there any non-returnable items?', a: 'Opened or used fragrances, gift sets that have been unsealed, and items purchased during final-sale events cannot be returned.' },
    ],
  },
];

export default function ShippingReturns() {
  return (
    <>
      <SEO title="Shipping & Returns" />
      <div className="min-h-screen bg-cream pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-14">
            <p className="section-tag mb-3">Policies</p>
            <h1 className="section-title">Shipping &amp; Returns</h1>
            <div className="divider-gold" />
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-12">
              <h2 className="font-serif text-xl font-medium text-obsidian mb-6 pb-3 border-b border-stone-200">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.items.map((item) => (
                  <div key={item.q}>
                    <p className="font-sans font-semibold text-obsidian text-sm mb-1">{item.q}</p>
                    <p className="font-sans text-stone-500 text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-[#0A0F0D] p-6 text-center mt-10">
            <p className="font-sans text-cream/70 text-sm mb-3">Still have questions?</p>
            <a
              href="mailto:support@jraphstreach.com"
              className="btn-gold text-xs inline-flex"
            >
              Contact Support
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
