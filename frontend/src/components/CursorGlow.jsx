import { useEffect, useRef } from 'react';

/**
 * Subtle gold radial glow that follows the cursor on desktop.
 * Purely decorative — pointer-events: none.
 */
export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    // Only on pointer-fine devices (mouse)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let raf;
    let tx = -500, ty = -500; // start off-screen
    let cx = -500, cy = -500;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      cx = lerp(cx, tx, 0.1);
      cy = lerp(cy, ty, 0.1);
      el.style.left = `${cx}px`;
      el.style.top  = `${cy}px`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
