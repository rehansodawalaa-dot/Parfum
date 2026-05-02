/** Format paise or rupees to ₹ display string */
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

/** Discount percentage */
export const discountPercent = (original, current) =>
  original > current ? Math.round(((original - current) / original) * 100) : 0;

/** Truncate text */
export const truncate = (str, n = 80) => (str.length > n ? str.slice(0, n) + '…' : str);

/** Star array for ratings */
export const starArray = (rating) => Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));
