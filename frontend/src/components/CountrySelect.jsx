import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRIES } from '../data/countries';

/**
 * Searchable country dropdown with flag display.
 */
export default function CountrySelect({ value, onChange, error, required = false }) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');
  const containerRef          = useRef(null);

  const selected = COUNTRIES.find((c) => c.name === value || c.code === value) || null;

  const filtered = search
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (country) => {
    onChange(country.name);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`input-luxury w-full flex items-center justify-between gap-2 text-left ${
          error ? 'border-red-400' : ''
        } ${!selected ? 'text-stone-400' : 'text-obsidian'}`}
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span className="text-lg leading-none">{selected.flag}</span>
              <span>{selected.name}</span>
            </>
          ) : (
            <span>Select country{required ? ' *' : ''}</span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={`text-stone-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-stone-200 shadow-xl max-h-64 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-stone-100 flex items-center gap-2">
            <Search size={13} className="text-stone-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries…"
              className="flex-1 text-sm font-sans text-obsidian outline-none bg-transparent placeholder:text-stone-400"
              autoFocus
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="text-center py-4 text-stone-400 text-sm font-sans">No results</p>
            ) : (
              filtered.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full text-left px-3 py-2.5 text-sm font-sans flex items-center gap-2.5 hover:bg-stone-50 transition-colors ${
                    selected?.code === country.code ? 'bg-gold-50 text-gold-700' : 'text-obsidian'
                  }`}
                >
                  <span className="text-base leading-none">{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="ml-auto text-stone-400 text-xs">{country.dial}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
