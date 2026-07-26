import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div className="min-h-screen bg-cream pt-20">
      <SEO
        title="About Us — J Raph Streach"
        description="The story behind J Raph Streach Parfums Paris — our heritage, our founder, and our philosophy."
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#0A0F0D] relative overflow-hidden">
        <div className="absolute inset-0 hero-ambient pointer-events-none" />
        <div
          className="absolute top-0 right-0 w-[50vw] h-[50vh] rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #1A6B4A 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[30vw] h-[30vh] rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C8991E 0%, transparent 70%)' }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Reveal direction="up">
            <p className="section-tag text-[#D4A96A] mb-4">Our Story</p>
            <h1 className="font-display text-5xl md:text-7xl font-light text-cream leading-tight mb-6">
              The Art of<br />
              <em className="not-italic text-gradient-gold">Fragrance</em>
            </h1>
            <div className="accent-line" />
            <p className="font-sans text-cream/60 text-lg leading-relaxed max-w-2xl mx-auto mt-6">
              Born from a passion for the world's finest scents, J Raph Streach Parfums Paris
              brings luxury fragrance to those who appreciate the art of self-expression.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Brand History ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal direction="right">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="J Raph Streach Parfums"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-[#0A0F0D] px-8 py-5">
                  <p className="font-display text-3xl font-medium text-cream">Since 2018</p>
                  <p className="text-xs font-sans tracking-widest uppercase text-cream/50 mt-1">Crafting Luxury</p>
                </div>
              </div>
            </Reveal>

            <Reveal direction="left" delay={80}>
              <p className="section-tag mb-4">Our Heritage</p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-obsidian mb-6 leading-tight">
                A Legacy Built on Scent
              </h2>
              <div className="accent-line-left" />
              <div className="space-y-5 mt-6 font-sans text-stone-600 leading-relaxed">
                <p>
                  J Raph Streach Parfums Paris was founded in 2018 with a singular vision: to make the
                  world's most extraordinary fragrances accessible to discerning connoisseurs across
                  India and beyond.
                </p>
                <p>
                  What began as a personal obsession with rare, hand-crafted perfumes quickly grew into
                  a curated house of olfactory excellence. Every fragrance in our collection is sourced
                  directly from master perfumers in Grasse, Paris, and the Middle East — ensuring
                  uncompromising authenticity.
                </p>
                <p>
                  Today, J Raph Streach stands as a symbol of quiet luxury — for those who understand
                  that the most powerful accessory you can wear is an exceptional scent.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Founder ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0D1F17]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up" className="text-center mb-16">
            <p className="section-tag text-[#D4A96A] mb-3">The Visionary</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-cream">Meet the Founder</h2>
            <div className="accent-line" />
          </Reveal>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal direction="right">
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-4xl font-medium text-cream mb-1">Rehan Sodawala</h3>
                  <p className="text-[#D4A96A] font-sans text-sm tracking-widest uppercase">
                    Founder &amp; Creative Director
                  </p>
                </div>
                <div
                  className="block w-12 h-0.5 rounded"
                  style={{ background: 'linear-gradient(90deg, #1A6B4A, #C8991E)' }}
                />
                <div className="space-y-4 font-sans text-cream/70 leading-relaxed">
                  <p>
                    Rehan Sodawala's love affair with fragrance began at age 16, when a bottle of vintage
                    Chanel No. 5 in his grandmother's dressing table sparked a lifelong obsession with
                    the science and poetry of scent.
                  </p>
                  <p>
                    After studying business in Mumbai and spending years sourcing luxury goods across
                    Europe and the Middle East, Rohan returned to India with a mission: to build a
                    fragrance house that combined global expertise with an intimate, personal touch.
                  </p>
                  <p className="italic text-cream/50">
                    "Every fragrance tells a story. My job is to find the ones worth telling —
                    and bring them to people who feel the same way I do."
                  </p>
                </div>

                <div className="border-t border-cream/10 pt-6 space-y-3">
                  <p className="text-xs font-sans font-medium tracking-widest uppercase text-cream/40 mb-4">
                    Get in Touch
                  </p>
                  <a
                    href="tel:+919867886660"
                    className="flex items-center gap-3 text-cream/70 hover:text-[#D4A96A] transition-colors group"
                  >
                    <span className="w-9 h-9 border border-cream/20 group-hover:border-[#D4A96A] flex items-center justify-center transition-colors text-base flex-shrink-0">
                      📞
                    </span>
                    <span className="font-sans text-sm">+91 98678 86660</span>
                  </a>
                  <a
                    href="mailto:rehansodawala@gmail.com"
                    className="flex items-center gap-3 text-cream/70 hover:text-[#D4A96A] transition-colors group"
                  >
                    <span className="w-9 h-9 border border-cream/20 group-hover:border-[#D4A96A] flex items-center justify-center transition-colors text-base flex-shrink-0">
                      ✉
                    </span>
                    <span className="font-sans text-sm">rehansodawala@gmail.com</span>
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal direction="left" delay={80}>
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3738673/pexels-photo-3738673.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Rehan Sodawala - Founder"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F17]/50 to-transparent" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up" className="text-center mb-16">
            <p className="section-tag mb-3">What We Stand For</p>
            <h2 className="section-title">Our Philosophy</h2>
            <div className="divider-gold" />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '◆',
                title: 'Uncompromising Authenticity',
                desc: "Every fragrance is sourced directly from the world's finest perfume houses. We never compromise on quality or origin.",
              },
              {
                icon: '◈',
                title: 'Curated Excellence',
                desc: 'Our collection is built slowly and intentionally — each addition is personally evaluated and approved by our founder.',
              },
              {
                icon: '◇',
                title: 'Personal Service',
                desc: 'We believe fragrance is deeply personal. Our team is always available to help you find your signature scent.',
              },
            ].map((v, i) => (
              <Reveal key={v.title} direction="up" delay={i * 80}>
                <div className="text-center p-8 border border-stone-100 hover:border-[#1A6B4A]/30 transition-colors duration-300">
                  <div
                    className="w-12 h-12 mx-auto mb-5 flex items-center justify-center text-2xl"
                    style={{ color: '#1A6B4A' }}
                  >
                    {v.icon}
                  </div>
                  <h3 className="font-serif text-lg font-medium text-obsidian mb-3">{v.title}</h3>
                  <p className="font-sans text-sm text-stone-500 leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0F0D] relative overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(26,107,74,0.12) 0%, transparent 70%)' }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Reveal direction="up">
            <p className="section-tag text-[#D4A96A] mb-4">Explore the Collection</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-cream mb-8">
              Find Your Signature Scent
            </h2>
            <Link to="/shop" className="btn-gold">
              Shop All Fragrances
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
