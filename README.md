# AI-Powered Indian Stock Research Assistant 📈🇮🇳

An educational, fundamental analysis web application designed for Indian retail investors, beginner developers, and college students. Provides deep business metrics, a weighted **Financial Health Score (0-100)**, interactive **Recharts visual charts**, **Sector Peer Benchmarks**, and a fact-grounded **AI Research Assistant**.

---

## 🏗️ Project Architecture

```
Stock Research Assistant/
├── backend/                  # FastAPI Application (Python)
│   ├── app/
│   │   ├── ai/               # AI Module (Gemini Integration & Fallback Engine)
│   │   │   ├── base.py       # Abstract Base Class for LLM providers
│   │   │   ├── gemini_service.py # Gemini API & Fact-Grounded Fallback Engine
│   │   │   └── prompts.py    # Structured Financial Prompts
│   │   ├── api/              # API Route Handlers
│   │   │   └── v1/           # Version 1 API Endpoints (health, stocks, ai)
│   │   ├── core/             # App Config & Pydantic Settings
│   │   ├── data/             # Provider-Agnostic Data Abstraction Layer
│   │   │   ├── base.py       # BaseStockDataProvider Interface
│   │   │   ├── indian_stocks_db.py # Curated NSE/BSE Stock Registry
│   │   │   └── yfinance_provider.py # Yahoo Finance Adapter (.NS/.BO symbols)
│   │   ├── engine/           # Pure Python Business Analysis Domain Engine
│   │   │   ├── metrics.py    # Solvency, ROE, ROCE, OPM, 3-Yr CAGR calculations
│   │   │   ├── health_score.py # Weighted 4-Pillar Financial Health Score (0-100)
│   │   │   └── sector_compare.py # Sector Peer Benchmarking Engine
│   │   └── main.py           # FastAPI ASGI Entrypoint & CORS Middleware
│   ├── requirements.txt      # Backend Python dependencies
│   └── .env.example          # Environment variables template
│
├── frontend/                 # React Web Application (Vite + JavaScript)
│   ├── src/
│   │   ├── components/       # UI Components (StockSearch, AIAssistant)
│   │   ├── services/         # API HTTP Client (api.js)
│   │   ├── styles/           # CSS Design Tokens & Dark Theme (index.css)
│   │   ├── App.jsx           # Main Dashboard Workspace & Recharts Integration
│   │   └── main.jsx          # React DOM entry point
│   ├── package.json          # Node dependencies (React, Vite, Recharts, Lucide)
│   └── vite.config.js        # Vite build & API proxy setup
│
├── run_app.bat               # 🚀 Master Double-Click App Launcher
├── run_backend.bat           # 🐍 FastAPI Backend Batch Launcher
├── run_frontend.bat          # ⚛️ React Frontend Batch Launcher
└── README.md                 # Complete Documentation
```

---

## ⚡ Quick Start Options

### Option A: One-Click Launcher (Recommended)
Double-click `run_app.bat` in Windows Explorer. This automatically launches both the FastAPI Backend API (Port 8000) and React Web App (Port 5173) in separate command windows.

---

### Option B: Running via PowerShell / Command Prompt

#### Terminal 1: Backend API
```powershell
# Using Python Launcher (Recommended on Windows)
py -3 -m uvicorn app.main:app --reload --port 8000 --app-dir backend

# OR navigating to backend folder:
cd backend
py -3 -m uvicorn app.main:app --reload --port 8000
```
> **Backend API Docs**: `http://localhost:8000/docs`

#### Terminal 2: Frontend Web App
```powershell
# Prepend Node.js to PATH if running in a newly opened terminal:
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
cd frontend
npm run dev
```
> **Web Application**: `http://localhost:5173`

---

## 🔧 Troubleshooting & Environment Notes

### 1. `Python was not found...` Error on Windows
- **Cause**: Windows default `python.exe` in `WindowsApps` is a Microsoft Store redirect stub.
- **Fix**: Use `py -3 -m uvicorn app.main:app --reload` or double-click `run_backend.bat`.

### 2. `npm: The term 'npm' is not recognized...` Error
- **Cause**: Terminal session opened prior to Node.js installation doesn't have Node on its active session PATH.
- **Fix**: Run `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH` in PowerShell before `npm run dev`, or double-click `run_frontend.bat`.

---

## 🔌 API Endpoints Summary

- `GET /api/v1/health` - System operational status & version check.
- `GET /api/v1/stocks/search?q={query}` - Indian stock autocomplete search (NSE/BSE).
- `GET /api/v1/stocks/{symbol}` - Stock profile, price, and basic valuation.
- `GET /api/v1/stocks/{symbol}/fundamentals` - Complete DTO (Solvency Ratios, 3-Yr CAGR Growth, Shareholding, Health Score out of 100, Sector Benchmarks).
- `POST /api/v1/ai/explain` - Fact-grounded educational AI analysis interpreting structured fundamentals.

---

## 📜 Educational Disclaimer
This application is strictly for **educational and research purposes**. It does not provide buy, sell, or trading recommendations.
