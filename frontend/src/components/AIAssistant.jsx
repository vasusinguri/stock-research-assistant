import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, HelpCircle, ShieldAlert, CheckCircle } from 'lucide-react';
import { askAI } from '../services/api';

export default function AIAssistant({ symbol, stockName }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [customInput, setCustomInput] = useState('');
  const [activePromptType, setActivePromptType] = useState('beginner_overview');

  const fetchAIExplanation = async (promptType, customText = null) => {
    setLoading(true);
    setActivePromptType(promptType);
    try {
      const res = await askAI(symbol, promptType, customText);
      setResponse(res);
    } catch (err) {
      console.error('AI Query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial trigger on load
  useEffect(() => {
    if (symbol) {
      fetchAIExplanation('beginner_overview');
    }
  }, [symbol]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    fetchAIExplanation('custom', customInput);
    setCustomInput('');
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #a78bfa)', 
              padding: '10px', 
              borderRadius: 'var(--radius-md)', 
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AI Research Assistant</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Interprets financial ratios & data for <strong>{stockName}</strong> in beginner-friendly language.
            </p>
          </div>
        </div>

        <div className="badge badge-success" style={{ fontSize: '0.8rem' }}>
          <Bot size={14} /> FinResearch AI Engine
        </div>
      </div>

      {/* Preset One-Click Quick Prompts */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { type: 'beginner_overview', label: '💡 Beginner Overview' },
          { type: 'strengths_weaknesses', label: '⚡ Key Strengths & Risks' },
          { type: 'custom_ratios', label: '📊 Explain P/E & Debt Ratios', text: 'Explain why P/E and Debt to Equity matter for this stock.' },
        ].map((btn) => (
          <button
            key={btn.type}
            onClick={() => fetchAIExplanation(btn.text ? 'custom' : btn.type, btn.text)}
            disabled={loading}
            style={{
              background: activePromptType === btn.type ? 'var(--primary-600)' : 'var(--bg-input)',
              color: activePromptType === btn.type ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Custom Investor Question Form */}
      <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '1.75rem' }}>
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={`Ask AI anything about ${stockName}... (e.g. Is this company debt-free?)`}
          style={{
            flex: 1,
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !customInput.trim()}
          style={{
            background: 'var(--primary-600)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '0 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600
          }}
        >
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          Ask
        </button>
      </form>

      {/* AI Explanation Output Area */}
      {loading ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={28} style={{ color: 'var(--primary-400)', animation: 'spin 1.2s linear infinite', marginBottom: '1rem' }} />
          <p style={{ fontWeight: 500 }}>AI is reading financial statements & health score for {stockName}...</p>
        </div>
      ) : response?.explanation ? (
        <div style={{ background: 'var(--bg-input)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {/* Simple Markdown Renderer */}
          <div 
            style={{ 
              color: 'var(--text-primary)', 
              lineHeight: 1.7, 
              fontSize: '0.95rem',
              whiteSpace: 'pre-line'
            }}
          >
            {response.explanation}
          </div>

          {/* Educational Disclaimer Banner */}
          <div 
            style={{ 
              marginTop: '1.5rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldAlert size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>{response.disclaimer}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
