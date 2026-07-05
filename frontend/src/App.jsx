import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Activity, ShieldCheck, Layers, Cpu, Server, 
  Search, ExternalLink, ArrowUpRight, ArrowDownRight, Globe, BarChart3, PieChart as PieChartIcon, Info,
  Percent, Scale, TrendingDown, Users, DollarSign, Award, CheckCircle2, AlertCircle, Sparkles, Bot
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { checkBackendHealth, fetchStockFundamentals } from './services/api';
import StockSearch from './components/StockSearch';
import AIAssistant from './components/AIAssistant';

export default function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState('RELIANCE.NS');
  const [fundamentals, setFundamentals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ai' | 'health' | 'ratios' | 'growth' | 'shareholding' | 'sector'

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{info.name}</h2>
                    <span className="badge badge-success">{info.exchange}</span>
                    {healthScore && (
                      <span className={`badge ${healthScore.score >= 75 ? 'badge-success' : healthScore.score >= 55 ? 'badge-warning' : 'badge-danger'}`}>
                        <Award size={13} /> Health Grade: {healthScore.grade} ({healthScore.score}/100)
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <code style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{info.symbol}</code>
                    {info.sector && <span>• Sector: <strong>{info.sector}</strong></span>}
                    {info.industry && <span>• Industry: <strong>{info.industry}</strong></span>}
                  </div>
                </div>

                {/* Price Display */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₹ {info.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 'N/A'}
                  </div>
                  {info.price_change !== null && info.price_change !== undefined && (
                    <div 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontWeight: 700, 
                        fontSize: '0.95rem',
                        color: info.price_change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                        marginTop: '4px'
                      }}
                    >
                      {info.price_change >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      <span>{info.price_change > 0 ? '+' : ''}{info.price_change} ({info.price_change_percent}%)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '1.75rem', 
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
                        {info.dividend_yield ? `${info.dividend_yield}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {info.summary && (
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={20} style={{ color: 'var(--primary-400)' }} /> Business Model & Operations
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                      {info.summary}
                    </p>
                    {info.website && (
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <a href={info.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-400)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                          <Globe size={16} /> Official Corporate Website <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: AI ASSISTANT */}
            {activeTab === 'ai' && (
              <AIAssistant symbol={info.symbol} stockName={info.name} />
            )}

            {/* TAB: FINANCIAL HEALTH SCORE */}
            {activeTab === 'health' && healthScore && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Algorithm Output</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>Financial Health Score</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{healthScore.summary}</p>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: healthScore.score >= 75 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                      {healthScore.score}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-400)' }}>Grade {healthScore.grade} • {healthScore.status}</div>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>4-Pillar Score Breakdown:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Solvency Risk</span>
                      <span>{healthScore.solvency_score} / 30 pts</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(healthScore.solvency_score / 30) * 100}%`, height: '100%', background: 'var(--accent-green)' }} />
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Profitability & ROE</span>
                      <span>{healthScore.profitability_score} / 30 pts</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(healthScore.profitability_score / 30) * 100}%`, height: '100%', background: 'var(--primary-400)' }} />
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Revenue/Profit Growth</span>
                      <span>{healthScore.growth_score} / 20 pts</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(healthScore.growth_score / 20) * 100}%`, height: '100%', background: '#a78bfa' }} />
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Valuation Fair Value</span>
                      <span>{healthScore.valuation_score} / 20 pts</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(healthScore.valuation_score / 20) * 100}%`, height: '100%', background: 'var(--accent-amber)' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: KEY RATIOS */}
            {activeTab === 'ratios' && ratios && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Solvency & Profitability Ratios</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Debt to Equity</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: ratios.debt_to_equity < 0.5 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                      {ratios.debt_to_equity !== null ? ratios.debt_to_equity : 'N/A'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solvency Status: {ratios.solvency_status}</span>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>ROE (%)</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--accent-green)' }}>
                      {ratios.roe ? `${ratios.roe}%` : 'N/A'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Return on Equity</span>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>ROCE (%)</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--primary-400)' }}>
                      {ratios.roce ? `${ratios.roce}%` : 'N/A'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Return on Capital Employed</span>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Operating Margin (OPM)</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px' }}>
                      {ratios.opm ? `${ratios.opm}%` : 'N/A'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Core business margin</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GROWTH CAGR */}
            {activeTab === 'growth' && growth && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>3-Year Compound Annual Growth (CAGR)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>3-Yr Revenue CAGR</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--primary-400)' }}>
                      {growth.revenue_cagr_3yr !== null ? `${growth.revenue_cagr_3yr}%` : 'N/A'}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>3-Yr Profit CAGR</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--accent-green)' }}>
                      {growth.profit_cagr_3yr !== null ? `${growth.profit_cagr_3yr}%` : 'N/A'}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>YoY Revenue Growth</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '6px' }}>
                      {growth.revenue_growth_yoy !== null ? `${growth.revenue_growth_yoy}%` : 'N/A'}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>YoY Profit Growth</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '6px' }}>
                      {growth.profit_growth_yoy !== null ? `${growth.profit_growth_yoy}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SHAREHOLDING */}
            {activeTab === 'shareholding' && shareholding && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Shareholding Pattern Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={shareholdingChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                        >
                          {shareholdingChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#131b2e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                          formatter={(value) => [`${value}%`, 'Holding']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #3b82f6' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Promoter Holding</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{shareholding.promoter_holding}%</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10b981' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Foreign Institutional (FII)</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)' }}>{shareholding.fii_holding}%</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #a78bfa' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Domestic Institutional (DII)</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa' }}>{shareholding.dii_holding}%</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #f59e0b' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Public & Retail</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{shareholding.public_holding}%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECTOR COMPARISON */}
            {activeTab === 'sector' && sectorComp && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span className="badge badge-success" style={{ marginBottom: '6px' }}>{sectorComp.sector_name} Sector</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Sector Peer Benchmarking</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                    Comparing valuation, ROE profitability, and leverage against {sectorComp.sector_name} sector averages.
                  </p>
                </div>

                <div style={{ height: '320px', width: '100%', marginBottom: '2rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="metric" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ background: '#131b2e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                      <Legend />
                      <Bar dataKey="Company" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="SectorAvg" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Valuation Comparison</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', color: 'var(--primary-400)' }}>
                      {sectorComp.pe_status}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>ROE Performance</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', color: 'var(--accent-green)' }}>
                      {sectorComp.roe_status}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <div className="container">
          AI-Powered Indian Stock Research Assistant • Built for Long-Term Investor Education
        </div>
      </footer>
    </div>
  );
}
