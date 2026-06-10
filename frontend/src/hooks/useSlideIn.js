import useInView from './useInView';

const EASING   = 'cubic-bezier(0.16, 1, 0.3, 1)';
const DURATION = 600;

/**
 * Returns [ref, style] — apply style directly to the wrapper element.
 * Keeps hover states on children completely unaffected.
 */
export default function useSlideIn(delay = 0) {
  const [ref, visible] = useInView(0);

  const style = {
    opacity:    visible ? 1 : 0,
    transform:  visible ? 'none' : 'translateY(16px)',
    transition: visible
      ? `opacity ${DURATION}ms ${EASING} ${delay}ms,
         transform ${DURATION}ms ${EASING} ${delay}ms`
      : 'none',
    willChange: visible ? 'auto' : 'opacity, transform',
  };

  return [ref, style];
}
