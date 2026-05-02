import useInView from '../hooks/useInView';

/**
 * Smooth scroll-reveal wrapper.
 *
 * Key decisions for silky animation:
 * - Small translate (16px) — large values feel heavy/laggy
 * - cubic-bezier(0.16, 1, 0.3, 1) — "expo out" — fast start, gentle settle
 * - willChange only while animating, removed after to free GPU layer
 * - duration 600ms — long enough to feel premium, short enough to feel snappy
 */
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const DURATION = 600;

const HIDDEN = {
  up:    'translateY(16px)',
  down:  'translateY(-12px)',
  left:  'translateX(16px)',
  right: 'translateX(-16px)',
  scale: 'scale(0.95)',
  none:  'none',
};

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
  as: Tag = 'div',
}) {
  const [ref, visible] = useInView(0);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'none' : HIDDEN[direction],
        transition: visible
          ? `opacity ${DURATION}ms ${EASING} ${delay}ms,
             transform ${DURATION}ms ${EASING} ${delay}ms`
          : 'none',
        willChange: visible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}
