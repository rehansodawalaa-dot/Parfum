import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import useSlideIn from '../hooks/useSlideIn';
import { PRODUCTS } from '../data/products';

const BRANDS         = [...new Set(PRODUCTS.map((p) => p.brand))];
const FRAGRANCE_TYPES = [...new Set(PRODUCTS.map((p) => p.fragranceType))];
const CATEGORIES     = ['men', 'women', 'unisex', 'premium'];

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'newest',     label: 'Newest' },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-100 pb-5 mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-xs font-sans font-medium tracking-[0.2em] uppercase text-obsidian">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && children}
    </div>
  );
}

function Filters({ filters, setFilters, onClose }) {
  const toggle = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const CheckItem = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        className={`w-4 h-4 border flex items-center justify-center transition-colors ${
          checked ? 'bg-obsidian border-obsidian' : 'border-stone-300 group-hover:border-obsidian'
        }`}
      >
        {checked && <span className="text-cream text-[10px]">✓</span>}
      </div>
      <span className="text-sm font-sans text-stone-600 capitalize">{label}</span>
    </label>
  );

  return (
    <div className="w-full">
      {onClose && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-lg">Filters</h3>
          <button onClick={onClose} aria-label="Close filters"><X size={20} /></button>
        </div>
      )}

      <FilterSection title="Category">
        <div className="space-y-2.5">
          {CATEGORIES.map((c) => (
            <CheckItem
              key={c}
              label={c === 'men' ? 'For Him' : c === 'women' ? 'For Her' : c}
              checked={filters.categories.includes(c)}
              onChange={() => toggle('categories', c)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Fragrance Type">
        <div className="space-y-2.5">
          {FRAGRANCE_TYPES.map((t) => (
            <CheckItem
              key={t}
              label={t}
              checked={filters.fragranceTypes.includes(t)}
              onChange={() => toggle('fragranceTypes', t)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Brand">
        <div className="space-y-2.5">
          {BRANDS.map((b) => (
            <CheckItem
              key={b}
              label={b}
              checked={filters.brands.includes(b)}
              onChange={() => toggle('brands', b)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-3">
          {[
            { label: 'Under ₹5,000',       min: 0,     max: 5000 },
            { label: '₹5,000 – ₹10,000',   min: 5000,  max: 10000 },
            { label: '₹10,000 – ₹15,000',  min: 10000, max: 15000 },
            { label: 'Above ₹15,000',       min: 15000, max: Infinity },
          ].map((r) => (
            <CheckItem
              key={r.label}
              label={r.label}
              checked={filters.priceMin === r.min && filters.priceMax === r.max}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  priceMin: prev.priceMin === r.min && prev.priceMax === r.max ? 0 : r.min,
                  priceMax: prev.priceMin === r.min && prev.priceMax === r.max ? Infinity : r.max,
                }))
              }
            />
          ))}
        </div>
      </FilterSection>

      <button
        onClick={() =>
          setFilters({ categories: [], fragranceTypes: [], brands: [], priceMin: 0, priceMax: Infinity })
        }
        className="text-xs font-sans font-medium tracking-widest uppercase text-stone-400 hover:text-red-500 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}

function AnimatedCard({ product, delay }) {
  const [ref, style] = useSlideIn(delay);
  return (
    <div ref={ref} style={style}>
      <ProductCard product={product} />
    </div>
  );
}

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [filters, setFilters] = useState({
    categories:    initialCategory ? [initialCategory] : [],
    fragranceTypes: [],
    brands:        [],
    priceMin:      0,
    priceMax:      Infinity,
  });
  const [sort, setSort]           = useState('featured');
  const [mobileFilters, setMobileFilters] = useState(false);
  const [search, setSearch]       = useState('');

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    if (filters.categories.length)
      result = result.filter((p) => filters.categories.includes(p.category));
    if (filters.fragranceTypes.length)
      result = result.filter((p) => filters.fragranceTypes.includes(p.fragranceType));
    if (filters.brands.length)
      result = result.filter((p) => filters.brands.includes(p.brand));
    result = result.filter((p) => p.price >= filters.priceMin && p.price <= filters.priceMax);

    switch (sort) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
      case 'newest':     result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: break;
    }
    return result;
  }, [filters, sort, search]);

  const activeFilterCount =
    filters.categories.length + filters.fragranceTypes.length + filters.brands.length +
    (filters.priceMin > 0 || filters.priceMax < Infinity ? 1 : 0);

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Page header */}
      <div className="bg-white border-b border-stone-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-tag mb-2">Our Collection</p>
          <h1 className="section-title">All Fragrances</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 border border-stone-200 px-4 py-2 text-xs font-sans font-medium tracking-widest uppercase hover:border-obsidian transition-colors"
            >
              <SlidersHorizontal size={14} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <input
              type="search"
              placeholder="Search fragrances…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-luxury w-48 sm:w-64 py-2"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400 font-sans">{filtered.length} products</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-luxury w-auto py-2 text-xs cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <Filters filters={filters} setFilters={setFilters} />
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-serif text-2xl text-stone-300 mb-3">No fragrances found</p>
                <p className="text-sm text-stone-400 font-sans">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((p, i) => (
                  <AnimatedCard key={p.id} product={p} delay={Math.min(i % 8, 7) * 50} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="relative ml-auto w-80 bg-white h-full overflow-y-auto p-6">
            <Filters filters={filters} setFilters={setFilters} onClose={() => setMobileFilters(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
