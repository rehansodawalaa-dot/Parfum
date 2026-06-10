import { useEffect, useRef, useState } from 'react';

/**
 * Fires as soon as the element's top edge enters the viewport.
 * rootMargin "0px 0px 0px 0px" = trigger exactly at viewport edge.
 * A small positive bottom margin pre-triggers slightly before visible = no lag.
 */
export default function useInView(threshold = 0, rootMargin = '0px 0px 40px 0px') {
  const ref     = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already in viewport on mount, show immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 40) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}
