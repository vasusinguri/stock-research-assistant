import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Building2, TrendingUp } from 'lucide-react';
import { searchStocks } from '../services/api';

export default function StockSearch({ onSelectStock }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);

  // Debounced search trigger (300ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchStocks(query);
        setResults(res);
        setIsOpen(res.length > 0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (stock) => {
    setQuery(stock.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelectStock(stock);
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '0 1rem',
          boxShadow: isOpen ? '0 0 0 2px var(--primary-glow), 0 8px 24px rgba(0,0,0,0.4)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          placeholder="Search Indian stocks (e.g. Reliance, TCS, INFY, Tata Motors...)"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            padding: '1rem 0.75rem',
            fontSize: '1rem',
            fontFamily: 'var(--font-sans)'
          }}
        />

        {loading ? (
          <Loader2 size={18} style={{ color: 'var(--primary-400)', animation: 'spin 1s linear infinite' }} />
        ) : query ? (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Results Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
            maxHeight: '360px',
            overflowY: 'auto',
            zIndex: 200
          }}
        >
          {results.map((stock, idx) => (
            <div
              key={stock.symbol}
              onClick={() => handleSelect(stock)}
              onMouseEnter={() => setSelectedIndex(idx)}
              style={{
                padding: '0.875rem 1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: idx < results.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                background: idx === selectedIndex ? 'var(--bg-card-hover)' : 'transparent',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{ 
                    background: 'var(--bg-input)', 
                    padding: '8px', 
                    borderRadius: 'var(--radius-sm)', 
                    color: 'var(--primary-400)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {stock.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>{stock.sector || 'General Sector'}</span>
                    {stock.industry && <span>• {stock.industry}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                  {stock.exchange}
                </span>
                <code style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 600 }}>
                  {stock.symbol}
                </code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
