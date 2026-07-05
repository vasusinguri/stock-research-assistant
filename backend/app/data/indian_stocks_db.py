"""
Curated registry of prominent Indian listed companies on NSE/BSE.
Provides instant autocomplete search resolution for Indian retail investors.
"""

INDIAN_STOCKS_REGISTRY = [
    # Information Technology
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services Ltd.", "exchange": "NSE", "sector": "Technology", "industry": "IT Services"},
    {"symbol": "INFY.NS", "name": "Infosys Ltd.", "exchange": "NSE", "sector": "Technology", "industry": "IT Services"},
    {"symbol": "HCLTECH.NS", "name": "HCL Technologies Ltd.", "exchange": "NSE", "sector": "Technology", "industry": "IT Services"},
    {"symbol": "WIPRO.NS", "name": "Wipro Ltd.", "exchange": "NSE", "sector": "Technology", "industry": "IT Services"},
    {"symbol": "TECHM.NS", "name": "Tech Mahindra Ltd.", "exchange": "NSE", "sector": "Technology", "industry": "IT Services"},
    {"symbol": "LTIM.NS", "name": "LTIMindtree Ltd.", "exchange": "NSE", "sector": "Technology", "industry": "IT Services"},

    # Banking & Financial Services
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd.", "exchange": "NSE", "sector": "Financial Services", "industry": "Private Bank"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Ltd.", "exchange": "NSE", "sector": "Financial Services", "industry": "Private Bank"},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "exchange": "NSE", "sector": "Financial Services", "industry": "Public Bank"},
    {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank Ltd.", "exchange": "NSE", "sector": "Financial Services", "industry": "Private Bank"},
    {"symbol": "AXISBANK.NS", "name": "Axis Bank Ltd.", "exchange": "NSE", "sector": "Financial Services", "industry": "Private Bank"},
    {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance Ltd.", "exchange": "NSE", "sector": "Financial Services", "industry": "NBFC"},
    {"symbol": "BAJAJFINSV.NS", "name": "Bajaj Finserv Ltd.", "exchange": "NSE", "sector": "Financial Services", "industry": "Financial Holding"},

    # Energy & Oil/Gas
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd.", "exchange": "NSE", "sector": "Energy", "industry": "Oil, Gas & Petroleum"},
    {"symbol": "ONGC.NS", "name": "Oil & Natural Gas Corporation Ltd.", "exchange": "NSE", "sector": "Energy", "industry": "Oil Exploration"},
    {"symbol": "NTPC.NS", "name": "NTPC Ltd.", "exchange": "NSE", "sector": "Utilities", "industry": "Power Generation"},
    {"symbol": "POWERGRID.NS", "name": "Power Grid Corporation of India Ltd.", "exchange": "NSE", "sector": "Utilities", "industry": "Power Transmission"},
    {"symbol": "BPCL.NS", "name": "Bharat Petroleum Corporation Ltd.", "exchange": "NSE", "sector": "Energy", "industry": "Oil Refining"},
    {"symbol": "IOC.NS", "name": "Indian Oil Corporation Ltd.", "exchange": "NSE", "sector": "Energy", "industry": "Oil Refining"},
    {"symbol": "ADANIGREEN.NS", "name": "Adani Green Energy Ltd.", "exchange": "NSE", "sector": "Utilities", "industry": "Renewable Energy"},

    # FMCG & Consumer Goods
    {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever Ltd.", "exchange": "NSE", "sector": "Consumer Goods", "industry": "FMCG"},
    {"symbol": "ITC.NS", "name": "ITC Ltd.", "exchange": "NSE", "sector": "Consumer Goods", "industry": "FMCG & Cigarettes"},
    {"symbol": "NESTLEIND.NS", "name": "Nestle India Ltd.", "exchange": "NSE", "sector": "Consumer Goods", "industry": "Packaged Foods"},
    {"symbol": "BRITANNIA.NS", "name": "Britannia Industries Ltd.", "exchange": "NSE", "sector": "Consumer Goods", "industry": "Food Products"},
    {"symbol": "TATACONSUM.NS", "name": "Tata Consumer Products Ltd.", "exchange": "NSE", "sector": "Consumer Goods", "industry": "Beverages & Foods"},

    # Automotive
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors Ltd.", "exchange": "NSE", "sector": "Automobile", "industry": "Commercial & Passenger Vehicles"},
    {"symbol": "M&M.NS", "name": "Mahindra & Mahindra Ltd.", "exchange": "NSE", "sector": "Automobile", "industry": "SUVs & Tractors"},
    {"symbol": "MARUTI.NS", "name": "Maruti Suzuki India Ltd.", "exchange": "NSE", "sector": "Automobile", "industry": "Passenger Cars"},
    {"symbol": "BAJAJ-AUTO.NS", "name": "Bajaj Auto Ltd.", "exchange": "NSE", "sector": "Automobile", "industry": "Two & Three Wheelers"},
    {"symbol": "HEROMOTOCO.NS", "name": "Hero MotoCorp Ltd.", "exchange": "NSE", "sector": "Automobile", "industry": "Two Wheelers"},
    {"symbol": "EICHERMOT.NS", "name": "Eicher Motors Ltd.", "exchange": "NSE", "sector": "Automobile", "industry": "Motorcycles (Royal Enfield)"},

    # Telecom, Infrastructure & Metals
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel Ltd.", "exchange": "NSE", "sector": "Telecommunication", "industry": "Telecom Services"},
    {"symbol": "LT.NS", "name": "Larsen & Toubro Ltd.", "exchange": "NSE", "sector": "Infrastructure", "industry": "Engineering & Construction"},
    {"symbol": "TATASTEEL.NS", "name": "Tata Steel Ltd.", "exchange": "NSE", "sector": "Metals", "industry": "Steel Manufacturing"},
    {"symbol": "JSWSTEEL.NS", "name": "JSW Steel Ltd.", "exchange": "NSE", "sector": "Metals", "industry": "Steel Manufacturing"},
    {"symbol": "HINDALCO.NS", "name": "Hindalco Industries Ltd.", "exchange": "NSE", "sector": "Metals", "industry": "Aluminum & Copper"},
    {"symbol": "COALINDIA.NS", "name": "Coal India Ltd.", "exchange": "NSE", "sector": "Mining", "industry": "Coal Mining"},

    # Pharmaceuticals & Healthcare
    {"symbol": "SUNPHARMA.NS", "name": "Sun Pharmaceutical Industries Ltd.", "exchange": "NSE", "sector": "Healthcare", "industry": "Pharmaceuticals"},
    {"symbol": "DRREDDY.NS", "name": "Dr. Reddy's Laboratories Ltd.", "exchange": "NSE", "sector": "Healthcare", "industry": "Pharmaceuticals"},
    {"symbol": "CIPLA.NS", "name": "Cipla Ltd.", "exchange": "NSE", "sector": "Healthcare", "industry": "Pharmaceuticals"},
    {"symbol": "APOLLOHOSP.NS", "name": "Apollo Hospitals Enterprise Ltd.", "exchange": "NSE", "sector": "Healthcare", "industry": "Hospitals & Healthcare"},
    {"symbol": "DIVISLAB.NS", "name": "Divi's Laboratories Ltd.", "exchange": "NSE", "sector": "Healthcare", "industry": "Active Pharma Ingredients"},

    # Retail & Miscellaneous
    {"symbol": "TITAN.NS", "name": "Titan Company Ltd.", "exchange": "NSE", "sector": "Consumer Durables", "industry": "Jewellery & Watches"},
    {"symbol": "ASIANPAINT.NS", "name": "Asian Paints Ltd.", "exchange": "NSE", "sector": "Consumer Goods", "industry": "Paints"},
    {"symbol": "ULTRACEMCO.NS", "name": "UltraTech Cement Ltd.", "exchange": "NSE", "sector": "Materials", "industry": "Cement"},
    {"symbol": "BEL.NS", "name": "Bharat Electronics Ltd.", "exchange": "NSE", "sector": "Defence", "industry": "Defence Electronics"},
    {"symbol": "HAL.NS", "name": "Hindustan Aeronautics Ltd.", "exchange": "NSE", "sector": "Defence", "industry": "Aerospace & Defence"},
    {"symbol": "TRENT.NS", "name": "Trent Ltd.", "exchange": "NSE", "sector": "Consumer Services", "industry": "Retail & Fashion"},
    {"symbol": "ZOMATO.NS", "name": "Zomato Ltd.", "exchange": "NSE", "sector": "Consumer Services", "industry": "Online Food Delivery"}
]
