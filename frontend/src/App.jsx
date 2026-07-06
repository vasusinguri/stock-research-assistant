import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, Activity, ShieldCheck, Layers, Cpu, Server, 
  Search, ExternalLink, ArrowUpRight, ArrowDownRight, Globe, BarChart3, PieChart as PieChartIcon, Info,
  Percent, Scale, TrendingDown, Users, DollarSign, Award, CheckCircle2, AlertCircle, Sparkles, Bot, Zap, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { checkBackendHealth, fetchStockFundamentals, fetchLiveStockPrice } from './services/api';
import StockSearch from './components/StockSearch';
import AIAssistant from './components/AIAssistant';

export default function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState('RELIANCE.NS');
  const [fundamentals, setFundamentals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ai' | 'health' | 'ratios' | 'growth' | 'shareholding' | 'sector'
  
  // High-Frequency Real-Time Price Polling & Fluctuation States (INDmoney Style)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [priceFlash, setPriceFlash] = useState(null); // 'up' | 'down' | null
  const [lastRefreshedTime, setLastRefreshedTime] = useState(null);
  
  // Smooth Interpolated Price Counter State
  const [animatedPrice, setAnimatedPrice] = useState(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    checkBackendHealth()
      .then(setHealthStatus)
      .catch((err) => console.error('Health check failed', err));
  }, []);

  const loadStockData = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStockFundamentals(symbol);
      setFundamentals(data);
      if (data?.info?.current_price) {
        setAnimatedPrice(data.info.current_price);
      }
      setLastRefreshedTime(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      setError(`Failed to load fundamental analysis for ${symbol}. Please verify ticker and retry.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStockSymbol) {
      loadStockData(selectedStockSymbol);
    }
  }, [selectedStockSymbol]);

  // Smooth Price Number Interpolation Counter Function
  const animatePriceTransition = (startPrice, endPrice) => {
    if (!startPrice || !endPrice || startPrice === endPrice) {
      setAnimatedPrice(endPrice);
      return;
    }

    const duration = 400; // 400 milliseconds smooth transition
    const startTime = performance.now();

    const updateFrame = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

      const currentVal = startPrice + (endPrice - startPrice) * easeProgress;
      setAnimatedPrice(currentVal);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(updateFrame);
      } else {
        setAnimatedPrice(endPrice);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(updateFrame);
  };

  // High-Frequency 2-Second Genuine Real-Time Price Streaming Loop
  useEffect(() => {
    if (!selectedStockSymbol || !autoRefresh) return;

    const intervalId = setInterval(async () => {
      try {
        const latestInfo = await fetchLiveStockPrice(selectedStockSymbol);
        if (latestInfo && latestInfo.current_price) {
          setFundamentals((prev) => {
            if (!prev || !prev.info) return prev;
            const oldPrice = prev.info.current_price;
            const newPrice = latestInfo.current_price;

            if (oldPrice && newPrice !== oldPrice) {
              animatePriceTransition(oldPrice, newPrice);
              if (newPrice > oldPrice) {
                setPriceFlash('up');
              } else if (newPrice < oldPrice) {
                setPriceFlash('down');
              }
              setTimeout(() => setPriceFlash(null), 1200);
            } else if (!animatedPrice) {
              setAnimatedPrice(newPrice);
            }

            return {
              ...prev,
              info: {
                ...prev.info,
                current_price: latestInfo.current_price,
                previous_close: latestInfo.previous_close,
                price_change: latestInfo.price_change,
                price_change_percent: latestInfo.price_change_percent,
                day_high: latestInfo.day_high || prev.info.day_high,
                day_low: latestInfo.day_low || prev.info.day_low,
                is_market_open: latestInfo.is_market_open,
                market_state: latestInfo.market_state,
                last_updated: latestInfo.last_updated,
              }
            };
          });
          setLastRefreshedTime(new Date().toLocaleTimeString('en-IN'));
        }
      } catch (err) {
        console.error('High-frequency live stream error:', err);
      }
    }, 2000); // 2-second genuine live stream polling interval

    return () => clearInterval(intervalId);
  }, [selectedStockSymbol, autoRefresh, animatedPrice]);

  const formatIndianMarketCap = (marketCap) => {
    if (!marketCap) return 'N/A';
    const crores = marketCap / 10000000;
    return `₹ ${crores.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
  };

  const info = fundamentals?.info;
  const ratios = fundamentals?.ratios;
  const growth = fundamentals?.growth;
  const shareholding = fundamentals?.shareholding;
  const healthScore = fundamentals?.health_score;
  const sectorComp = fundamentals?.sector_comparison;

  const displayCurrentPrice = animatedPrice !== null ? animatedPrice : info?.current_price;

  // Intraday Range Calculation
  const dayLow = info?.day_low || (info?.current_price ? info.current_price * 0.985 : null);
  const dayHigh = info?.day_high || (info?.current_price ? info.current_price * 1.015 : null);
  const dayRangeProgress = (displayCurrentPrice && dayLow && dayHigh && dayHigh > dayLow)
    ? Math.min(100, Math.max(0, ((displayCurrentPrice - dayLow) / (dayHigh - dayLow)) * 100))
    : 50;

  const shareholdingChartData = shareholding ? [
    { name: 'Promoter Holding', value: shareholding.promoter_holding || 0, color: '#3b82f6' },
    { name: 'FII Holding', value: shareholding.fii_holding || 0, color: '#10b981' },
    { name: 'DII Holding', value: shareholding.dii_holding || 0, color: '#a78bfa' },
    { name: 'Public & Retail', value: shareholding.public_holding || 0, color: '#f59e0b' },
  ].filter(item => item.value > 0) : [];

  const sectorChartData = sectorComp ? [
    { metric: 'P/E Ratio', Company: sectorComp.stock_pe || 0, SectorAvg: sectorComp.sector_pe },
    { metric: 'Return on Equity (ROE %)', Company: sectorComp.stock_roe || 0, SectorAvg: sectorComp.sector_roe },
    { metric: 'Debt to Equity x10', Company: (sectorComp.stock_de || 0) * 10, SectorAvg: sectorComp.sector_de * 10 },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <header className="navbar">
        <div className="container navbar-inner">
          <a href="#" className="brand">
            <div className="brand-icon">
              <TrendingUp size={22} />
            </div>
            <span>FinResearch AI <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: 600 }}>[IN]</span></span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {info && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {info.is_market_open ? (
                  <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    🔴 LIVE STREAMING | Market Open (NSE/BSE)
                  </span>
                ) : (
                  <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                    ⚪ Market Closed (IST)
                  </span>
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className={`status-dot ${healthStatus?.status === 'healthy' ? 'online' : 'offline'}`} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: healthStatus?.status === 'healthy' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {healthStatus?.status === 'healthy' ? 'System Operational' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container" style={{ padding: '2.5rem 1.5rem', flex: 1 }}>
        {/* Header Title */}
        <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
          <div className="badge badge-success" style={{ marginBottom: '0.75rem' }}>
            <ShieldCheck size={14} /> Fundamental Analysis • Long-Term Investor Framework
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Indian Stock <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Research Assistant</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Evaluate business fundamentals, solvency health score, profitability, growth CAGR, and AI explanations for NSE & BSE stocks.
          </p>

          <StockSearch onSelectStock={(stock) => setSelectedStockSymbol(stock.symbol)} />
        </section>

        {/* Selected Stock Content Workspace */}
        {loading ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '960px', margin: '0 auto' }}>
            <Activity size={32} style={{ color: 'var(--primary-400)', animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Executing Financial Health Engine for {selectedStockSymbol}...</p>
          </div>
        ) : error ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-red)', maxWidth: '960px', margin: '0 auto' }}>
            <Info size={32} style={{ marginBottom: '0.5rem' }} />
            <p>{error}</p>
          </div>
        ) : info ? (
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Stock Header Card */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{info.name}</h2>
                    <span className="badge badge-success">{info.exchange}</span>
                    {healthScore && (
                      <span className={`badge ${healthScore.score >= 75 ? 'badge-success' : healthScore.score >= 55 ? 'badge-warning' : 'badge-danger'}`}>
                        <Award size={13} /> Health Grade: {healthScore.grade} ({healthScore.score}/100)
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                    <code style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{info.symbol}</code>
                    {info.sector && <span>• Sector: <strong>{info.sector}</strong></span>}
                    {info.industry && <span>• Industry: <strong>{info.industry}</strong></span>}
                  </div>
                </div>

                {/* INDmoney-Style High-Frequency Live Price Display & Tick Motion Animation */}
                <div style={{ textAlign: 'right' }}>
                  <div 
                    style={{ 
                      fontSize: '2.1rem', 
                      fontWeight: 800, 
                      color: priceFlash === 'up' ? '#10b981' : priceFlash === 'down' ? '#ef4444' : 'var(--text-primary)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: priceFlash === 'up' ? 'rgba(16, 185, 129, 0.25)' : priceFlash === 'down' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid',
                      borderColor: priceFlash === 'up' ? '#10b981' : priceFlash === 'down' ? '#ef4444' : 'var(--border-subtle)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: priceFlash === 'up' ? '0 0 16px rgba(16, 185, 129, 0.4)' : priceFlash === 'down' ? '0 0 16px rgba(239, 68, 68, 0.4)' : 'none'
                    }}
                  >
                    ₹ {displayCurrentPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                  </div>

                  {info.price_change !== null && info.price_change !== undefined && (
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end',
                        gap: '4px', 
                        fontWeight: 700, 
                        fontSize: '1rem',
                        color: info.price_change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                        marginTop: '6px'
                      }}
                    >
                      {info.price_change >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      <span>{info.price_change > 0 ? '+' : ''}{info.price_change} ({info.price_change_percent}%)</span>
                    </div>
                  )}

                  {/* Real-time Streaming Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      style={{
                        background: autoRefresh ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                        color: autoRefresh ? 'var(--accent-green)' : 'var(--text-muted)',
                        border: '1px solid',
                        borderColor: autoRefresh ? 'var(--accent-green)' : 'var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.2s ease'
                      }}
                      title="Toggle 2-second live price streaming"
                    >
                      <Zap size={13} style={{ fill: autoRefresh ? 'var(--accent-green)' : 'none' }} /> 
                      {autoRefresh ? 'LIVE Streaming 2s' : 'Stream Paused'}
                    </button>
                    {lastRefreshedTime && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Tick: {lastRefreshedTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Intraday Price Range Bar */}
              {dayLow && dayHigh && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>Day Low: <strong>₹ {dayLow.toLocaleString('en-IN')}</strong></span>
                    <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>Intraday Market Position</span>
                    <span>Day High: <strong>₹ {dayHigh.toLocaleString('en-IN')}</strong></span>
                  </div>
                  <div style={{ position: 'relative', width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        position: 'absolute', 
                        left: 0, 
                        top: 0, 
                        bottom: 0, 
                        width: `${dayRangeProgress}%`, 
                        background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '1.25rem', 
                  paddingTop: '1.25rem', 
                  borderTop: '1px solid var(--border-subtle)',
                  overflowX: 'auto'
                }}
              >
                {[
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'ai', label: 'AI Assistant', icon: Sparkles },
                  { id: 'health', label: 'Health Score', icon: Award },
                  { id: 'ratios', label: 'Key Ratios', icon: Scale },
                  { id: 'growth', label: 'Growth CAGR', icon: TrendingUp },
                  { id: 'shareholding', label: 'Shareholding', icon: PieChartIcon },
                  { id: 'sector', label: 'Sector Comparison', icon: BarChart3 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        background: isActive ? 'var(--primary-600)' : 'var(--bg-input)',
                        color: isActive ? 'white' : 'var(--text-secondary)',
                        border: '1px solid',
                        borderColor: isActive ? 'var(--primary-500)' : 'var(--border-subtle)',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={16} /> {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                    Valuation & Market Summary
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Market Cap</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '6px' }}>
                        {formatIndianMarketCap(info.market_cap)}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>P/E Ratio</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '6px', color: 'var(--primary-400)' }}>
                        {info.pe_ratio ? info.pe_ratio.toFixed(2) : 'N/A'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>P/B Ratio</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '6px' }}>
                        {info.pb_ratio ? info.pb_ratio.toFixed(2) : 'N/A'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Dividend Yield</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '6px', color: 'var(--accent-green)' }}>
                        {info.dividend_yield ? `${info.dividend_yield.toFixed(2)} %` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>52-Week High</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '6px', color: 'var(--accent-green)' }}>
                        ₹ {info.fifty_two_week_high?.toLocaleString('en-IN') || 'N/A'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>52-Week Low</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '6px', color: 'var(--accent-red)' }}>
                        ₹ {info.fifty_two_week_low?.toLocaleString('en-IN') || 'N/A'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Previous Close</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '6px' }}>
                        ₹ {info.previous_close?.toLocaleString('en-IN') || 'N/A'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Currency</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '6px', color: 'var(--primary-400)' }}>
                        {info.currency}
                      </div>
                    </div>
                  </div>
                </div>

                {info.summary && (
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                      Business Profile & Summary
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                      {info.summary}
                    </p>
                    {info.website && (
                      <div style={{ marginTop: '1.25rem' }}>
                        <a 
                          href={info.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="button button-outline"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
                        >
                          <Globe size={14} /> Official Corporate Website <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: AI ASSISTANT */}
            {activeTab === 'ai' && (
              <AIAssistant symbol={info.symbol} companyName={info.name} />
            )}

            {/* TAB: HEALTH SCORE */}
            {activeTab === 'health' && healthScore && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div 
                    style={{ 
                      width: '90px', 
                      height: '90px', 
                      borderRadius: '50%', 
                      background: healthScore.score >= 75 ? 'rgba(16, 185, 129, 0.15)' : healthScore.score >= 55 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: '3px solid',
                      borderColor: healthScore.score >= 75 ? 'var(--accent-green)' : healthScore.score >= 55 ? 'var(--accent-amber)' : 'var(--accent-red)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{healthScore.score}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>out of 100</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                      Financial Health Grade: <span style={{ color: 'var(--primary-400)' }}>{healthScore.grade}</span> ({healthScore.status})
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.95rem' }}>
                      {healthScore.summary}
                    </p>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>4-Pillar Score Breakdown:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>1. Solvency & Debt Health</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{healthScore.solvency_score} / 30</span>
                    </div>
                    <div style={{ width: '100%', background: 'var(--bg-card)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(healthScore.solvency_score / 30) * 100}%`, background: 'var(--primary-500)', height: '100%' }} />
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>2. Profitability (ROE/ROCE)</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{healthScore.profitability_score} / 30</span>
                    </div>
                    <div style={{ width: '100%', background: 'var(--bg-card)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(healthScore.profitability_score / 30) * 100}%`, background: 'var(--accent-green)', height: '100%' }} />
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>3. 3-Year CAGR Growth</span>
                      <span style={{ fontWeight: 700, color: '#a78bfa' }}>{healthScore.growth_score} / 25</span>
                    </div>
                    <div style={{ width: '100%', background: 'var(--bg-card)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(healthScore.growth_score / 25) * 100}%`, background: '#a78bfa', height: '100%' }} />
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>4. Valuation (P/E & P/B)</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{healthScore.valuation_score} / 15</span>
                    </div>
                    <div style={{ width: '100%', background: 'var(--bg-card)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(healthScore.valuation_score / 15) * 100}%`, background: 'var(--accent-amber)', height: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: KEY RATIOS */}
            {activeTab === 'ratios' && ratios && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Solvency & Profitability Metrics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Debt to Equity</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '6px', color: (ratios.debt_to_equity || 0) < 0.5 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                      {ratios.debt_to_equity !== null ? ratios.debt_to_equity.toFixed(2) : 'N/A'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      {(ratios.debt_to_equity || 0) < 0.5 ? '✓ Low Financial Leverage' : 'Moderate Leverage'}
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Return on Equity (ROE)</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '6px', color: 'var(--accent-green)' }}>
                      {ratios.roe !== null ? `${ratios.roe.toFixed(2)} %` : 'N/A'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Target: &gt; 15%
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>ROCE</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '6px', color: 'var(--primary-400)' }}>
                      {ratios.roce !== null ? `${ratios.roce.toFixed(2)} %` : 'N/A'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Target: &gt; 15%
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Operating Margin (OPM)</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '6px' }}>
                      {ratios.opm !== null ? `${ratios.opm.toFixed(2)} %` : 'N/A'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Core Operating Efficiency
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GROWTH CAGR */}
            {activeTab === 'growth' && growth && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Multi-Year Growth & Compounding Performance
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>3-Year Revenue CAGR</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '6px', color: 'var(--primary-400)' }}>
                      {growth.revenue_cagr_3yr !== null ? `${growth.revenue_cagr_3yr.toFixed(2)} %` : 'N/A'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Long-term Topline Expansion
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>3-Year Net Profit CAGR</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '6px', color: 'var(--accent-green)' }}>
                      {growth.profit_cagr_3yr !== null ? `${growth.profit_cagr_3yr.toFixed(2)} %` : 'N/A'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Long-term Bottomline Expansion
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>YoY Revenue Growth</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '6px' }}>
                      {growth.revenue_growth_yoy !== null ? `${growth.revenue_growth_yoy.toFixed(2)} %` : 'N/A'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>YoY Net Profit Growth</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '6px' }}>
                      {growth.profit_growth_yoy !== null ? `${growth.profit_growth_yoy.toFixed(2)} %` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SHAREHOLDING PATTERN */}
            {activeTab === 'shareholding' && shareholding && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Institutional & Promoter Shareholding Pattern
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={shareholdingChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {shareholdingChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Holding']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Promoter Holding</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>{shareholding.promoter_holding ? `${shareholding.promoter_holding}%` : 'N/A'}</span>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Foreign Institutional (FII)</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{shareholding.fii_holding ? `${shareholding.fii_holding}%` : 'N/A'}</span>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Domestic Institutional (DII)</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a78bfa' }}>{shareholding.dii_holding ? `${shareholding.dii_holding}%` : 'N/A'}</span>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Public & Retail</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{shareholding.public_holding ? `${shareholding.public_holding}%` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECTOR COMPARISON */}
            {activeTab === 'sector' && sectorComp && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Peer Benchmarking: {info.name} vs {sectorComp.sector_name} Sector Average
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Compare company valuation, return on equity, and debt profile relative to industry peer averages.
                </p>

                <div style={{ height: '300px', marginBottom: '1.5rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="metric" stroke="var(--text-secondary)" />
                      <YAxis stroke="var(--text-secondary)" />
                      <Tooltip formatter={(value) => [value.toFixed(2), 'Value']} />
                      <Legend />
                      <Bar dataKey="Company" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="SectorAvg" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '1.5rem 0', marginTop: '3rem', background: 'var(--bg-card)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div>
            © {new Date().getFullYear()} FinResearch AI • Designed for Indian Stock Fundamental Analysis
          </div>
          <div>
            Built with FastAPI, React, Recharts & Gemini AI
          </div>
        </div>
      </footer>
    </div>
  );
}
