import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import useSlideIn from '../hooks/useSlideIn';
import api from '../lib/api';

const CATEGORIES = ['men', 'women', 'unisex', 'premium'];

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'newest',     label: 'Newest' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
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
        <ChevronDown size={14} className={`text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2.5 w-full text-left group select-none min-h-[44px] py-1"
    >
      <div
        className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors duration-150 ${
          checked ? 'border-[#1A6B4A]' : 'border-stone-300 group-hover:border-obsidian'
        }`}
        style={checked ? { background: 'linear-gradient(135deg,#1A6B4A,#0D1F17)' } : {}}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
            <path d="M1 3.5L3.5 6L8 1" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm font-sans text-stone-600 capitalize leading-none">{label}</span>
    </button>
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Category comes from the URL — read it directly every render
  const categoryParam = searchParams.get('category') || '';

  // These filters live purely in local state
  const [selectedFragrances, setSelectedFragrances] = useState([]);
  const [selectedBrands, setSelectedBrands]         = useState([]);
  const [sort, setSort]                             = useState('featured');
  const [search, setSearch]                         = useState('');
  const [mobileFilters, setMobileFilters]           = useState(false);

  // Toggle category in the URL
  const toggleCategory = (cat) => {
    if (categoryParam === cat) {
      // Already selected — deselect
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  // Toggle fragrance type in local state
  const toggleFragrance = (val) => {
    setSelectedFragrances((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  // Toggle brand in local state
  const toggleBrand = (val) => {
    setSelectedBrands((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const clearAll = () => {
    setSearchParams({});
    setSelectedFragrances([]);
    setSelectedBrands([]);
  };

  // Fetch all products
  const { data, isLoading } = useQuery({
    queryKey: ['products-shop'],
    queryFn: () => api.get('/products?limit=200').then((r) => r.data.products),
    staleTime: 60_000,
  });

  const allProducts = data || [];

  // Dynamic filter options from real products
  const brands         = useMemo(() => [...new Set(allProducts.map((p) => p.brand))].sort(), [allProducts]);
  const fragranceTypes = useMemo(() => [...new Set(allProducts.map((p) => p.fragranceType))].sort(), [allProducts]);

  // Apply all filters
  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }

    if (categoryParam) {
      result = result.filter(
        (p) => (p.category || '').toLowerCase().trim() === categoryParam.toLowerCase().trim()
      );
    }

    if (selectedFragrances.length) {
      result = result.filter((p) =>
        selectedFragrances.includes((p.fragranceType || '').toLowerCase().trim())
      );
    }

    if (selectedBrands.length) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    switch (sort) {
      case 'rating':     result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'newest':     result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      default: break;
    }
    return result;
  }, [allProducts, categoryParam, selectedFragrances, selectedBrands, sort, search]);

  const activeFilterCount =
    (categoryParam ? 1 : 0) + selectedFragrances.length + selectedBrands.length;

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Page header */}
      <div className="bg-[#F5F0E8] border-b border-stone-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-tag mb-2">Our Collection</p>
          <h1 className="section-title">
            {categoryParam === 'men'     ? 'For Him'
            : categoryParam === 'women'  ? 'For Her'
            : categoryParam === 'unisex' ? 'Unisex'
            : categoryParam === 'premium'? 'Premium'
            : 'All Fragrances'}
          </h1>
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
              className="input-luxury w-full sm:w-64 py-2"
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
            <Sidebar
              categoryParam={categoryParam}
              toggleCategory={toggleCategory}
              selectedFragrances={selectedFragrances}
              toggleFragrance={toggleFragrance}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              clearAll={clearAll}
              brands={brands}
              fragranceTypes={fragranceTypes}
            />
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white border border-stone-100 animate-pulse">
                    <div className="aspect-[3/4] bg-stone-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-stone-100 rounded w-2/3" />
                      <div className="h-4 bg-stone-100 rounded w-full" />
                      <div className="h-4 bg-stone-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-serif text-2xl text-stone-300 mb-3">No fragrances found</p>
                <p className="text-sm text-stone-400 font-sans">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((p, i) => (
                  <AnimatedCard key={p._id || p.id} product={p} delay={Math.min(i % 8, 7) * 50} />
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
          <div className="relative ml-auto w-80 bg-white h-full max-w-full overflow-y-auto p-6">
            <Sidebar
              categoryParam={categoryParam}
              toggleCategory={toggleCategory}
              selectedFragrances={selectedFragrances}
              toggleFragrance={toggleFragrance}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              clearAll={clearAll}
              brands={brands}
              fragranceTypes={fragranceTypes}
              onClose={() => setMobileFilters(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sidebar ── */
function Sidebar({
  categoryParam, toggleCategory,
  selectedFragrances, toggleFragrance,
  selectedBrands, toggleBrand,
  clearAll, brands, fragranceTypes, onClose,
}) {
  return (
    <div className="w-full">
      {onClose && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-lg">Filters</h3>
          <button onClick={onClose} aria-label="Close filters"><X size={20} /></button>
        </div>
      )}

      <FilterSection title="Category">
        <div className="space-y-1">
          {CATEGORIES.map((c) => (
            <CheckItem
              key={c}
              label={c === 'men' ? 'For Him' : c === 'women' ? 'For Her' : c}
              checked={categoryParam === c}
              onChange={() => toggleCategory(c)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Fragrance Type">
        <div className="space-y-1">
          {fragranceTypes.map((t) => (
            <CheckItem
              key={t}
              label={t}
              checked={selectedFragrances.includes(t)}
              onChange={() => toggleFragrance(t)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Brand">
        <div className="space-y-1">
          {brands.map((b) => (
            <CheckItem
              key={b}
              label={b}
              checked={selectedBrands.includes(b)}
              onChange={() => toggleBrand(b)}
            />
          ))}
        </div>
      </FilterSection>

      <button
        onClick={clearAll}
        className="text-xs font-sans font-medium tracking-widest uppercase text-stone-400 hover:text-red-500 transition-colors mt-2"
      >
        Clear All Filters
      </button>
    </div>
  );
}
