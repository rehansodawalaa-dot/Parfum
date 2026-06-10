import { useEffect } from 'react';

/**
 * Sets document title and meta tags for each page.
 * Lightweight — no external library needed.
 */
export default function SEO({
  title,
  description = 'J Raph Streach Parfums Paris — The Scent of Opulence. Discover rare, handcrafted fragrances from master perfumers.',
  image = 'https://images.pexels.com/photos/3738673/pexels-photo-3738673.jpeg?auto=compress&cs=tinysrgb&w=1200',
  url,
  type = 'website',
}) {
  const fullTitle = title
    ? `${title} | J Raph Streach Parfums Paris`
    : 'J Raph Streach Parfums Paris — The Scent of Opulence';

  const canonical = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:site_name', 'J Raph Streach Parfums Paris', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);
  }, [fullTitle, description, image, canonical, type]);

  return null;
}
