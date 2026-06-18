/** Format amount to ₹ display string (always shows ₹ symbol, never "INR") */
export const formatPrice = (amount) => {
  // Use narrowSymbol for guaranteed ₹ glyph; fall back to manual prefix if unsupported
  try {
    const formatted = new Intl.NumberFormat('en-IN', {
      style:              'currency',
      currency:           'INR',
      currencyDisplay:    'narrowSymbol',
      maximumFractionDigits: 0,
    }).format(amount);
    // Some environments output "INR 1,000" instead of "₹1,000" — replace if so
    return formatted.replace(/^INR\s?/, '₹');
  } catch {
    // Absolute fallback: manual formatting
    return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }
};

/** Discount percentage */
export const discountPercent = (original, current) =>
  original > current ? Math.round(((original - current) / original) * 100) : 0;

/** Truncate text */
export const truncate = (str, n = 80) => (str.length > n ? str.slice(0, n) + '…' : str);

/** Star array for ratings */
export const starArray = (rating) => Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));
