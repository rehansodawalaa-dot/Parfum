import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const SIZES = [
  { size: '30ml', icon: '🟡', duration: '3–4 months', sprays: '~300', best: 'Travel & trial' },
  { size: '50ml', icon: '🟠', duration: '5–7 months', sprays: '~500', best: 'Daily use' },
  { size: '100ml', icon: '🔴', duration: '10–14 months', sprays: '~1000', best: 'Signature scent' },
];

const TIPS = [
  { title: 'Pulse Points', body: 'Apply to wrists, neck, behind ears, and inner elbows — areas where blood vessels are close to the skin and emit heat, amplifying the scent.' },
  { title: 'Don\'t Rub', body: 'Rubbing breaks down the top notes quickly. Spray and let it settle naturally.' },
  { title: 'Layer for Longevity', body: 'Use a matching body lotion or unscented moisturiser before spraying. Fragrance clings better to hydrated skin.' },
  { title: 'How Many Sprays?', body: '2–4 sprays is the ideal amount. More is not always better — a well-made EDP should project at 2 sprays.' },
  { title: 'When to Apply', body: 'Apply immediately after showering on towel-dried skin. This is when pores are open and absorption is best.' },
];

export default function SizeGuide() {
  return (
    <>
      <SEO title="Size Guide" />
      <div className="min-h-screen bg-cream pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-14">
            <p className="section-tag mb-3">Guide</p>
            <h1 className="section-title">Size Guide</h1>
            <div className="divider-gold" />
            <p className="font-sans text-stone-500 text-sm mt-4 max-w-xl mx-auto">
              Choosing the right bottle size depends on how often you wear a fragrance and whether it's your signature scent or something occasional.
            </p>
          </div>

          {/* Size comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
            {SIZES.map((s) => (
              <div key={s.size} className="bg-white border border-stone-100 p-6 text-center">
                <div className="text-4xl mb-3">{s.icon}</div>
                <p className="font-serif text-2xl font-medium text-obsidian mb-1">{s.size}</p>
                <p className="text-xs font-sans font-medium tracking-widest uppercase text-stone-400 mb-4">{s.best}</p>
                <div className="space-y-1.5 text-sm font-sans text-stone-500">
                  <p>~{s.sprays} sprays</p>
                  <p>Lasts {s.duration}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Application tips */}
          <h2 className="font-serif text-xl font-medium text-obsidian mb-6 pb-3 border-b border-stone-200">
            How to Wear Fragrance
          </h2>
          <div className="space-y-6 mb-12">
            {TIPS.map((tip) => (
              <div key={tip.title} className="flex gap-4">
                <div className="w-1 flex-shrink-0 bg-gold-400 rounded-full self-stretch" />
                <div>
                  <p className="font-sans font-semibold text-obsidian text-sm mb-1">{tip.title}</p>
                  <p className="font-sans text-stone-500 text-sm leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/shop" className="btn-dark inline-flex">
              Shop Fragrances
            </Link>
          </div>
          <div className="text-center mt-6">
            <Link to="/" className="text-xs font-sans font-medium tracking-widest uppercase text-stone-400 hover:text-obsidian transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
