import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const TIME_RANGES = {
  '1W': 7,
  '1M': 30,
  '6M': 182,
  '1Y': 365,
};

const chartColors = [
  '#FF0000', // red
  '#00BFFF', // deep sky blue
  '#32CD32', // lime green
  '#FFA500', // orange
  '#9370DB', // medium purple
  '#00CED1', // dark turquoise
  '#FFC0CB', // pink
];


type StockSummary = {
  symbol: string;
  shortName?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  dividendYield?: number;
  peRatio?: number;
};

export default function StockAnalysis() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [stockData, setStockData] = useState<Record<string, { date: string; price: number }[]>>({});
  const [stockSummaries, setStockSummaries] = useState<Record<string, StockSummary>>({});
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '6M' | '1Y'>('1Y');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const STOCK_SYMBOLS = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA',
    'RELIANCE.NSE', 'TATAMOTORS.NSE', 'INFY.NSE', 'HDFCBANK.NSE', 'ICICIBANK.NSE',
  ];

  useEffect(() => {
    if (!input) {
      setSuggestions([]);
      return;
    }
    const filtered = STOCK_SYMBOLS.filter(sym =>
      sym.toLowerCase().startsWith(input.toLowerCase()) && !symbols.includes(sym)
    ).slice(0, 10);
    setSuggestions(filtered);
  }, [input, symbols]);

  const parseTimeSeries = (timeSeries: Record<string, any>) => {
    return Object.entries(timeSeries)
      .map(([date, values]) => ({
        date,
        price: parseFloat(values['4. close']),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filterByTimeRange = (data: { date: string; price: number }[], days: number) => {
    if (!data.length) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter(d => new Date(d.date) >= cutoff);
  };

  const combineChartData = (symbols: string[], stockData: Record<string, { date: string; price: number }[]>, days: number) => {
    if (symbols.length === 0) return [];

    const allDatesSet = new Set<string>();
    symbols.forEach(sym => {
      const filtered = filterByTimeRange(stockData[sym] || [], days);
      filtered.forEach(d => allDatesSet.add(d.date));
    });

    if (allDatesSet.size === 0) return [];

    const allDates = Array.from(allDatesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return allDates.map(date => {
      const row: any = { date };
      symbols.forEach(sym => {
        const filtered = filterByTimeRange(stockData[sym] || [], days);
        const point = filtered.find(d => d.date === date);
        row[sym] = point ? point.price : null;
      });
      return row;
    });
  };

  const fetchStockData = async (symbol: string) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/stock?symbol=${symbol}`);
      const timeSeries = response.data?.['Time Series (Daily)'];
      if (!timeSeries) throw new Error(`No data for ${symbol}`);

      return parseTimeSeries(timeSeries);
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
      return [];
    }
  };

  const fetchStockSummary = async (symbol: string) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/stock/summary?symbol=${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching summary for ${symbol}:`, error);
      return null;
    }
  };

  useEffect(() => {
    if (symbols.length === 0) {
      setStockData({});
      setStockSummaries({});
      return;
    }
    setLoading(true);

    Promise.all(symbols.map(sym => fetchStockData(sym))).then(results => {
      const dataMap: Record<string, any[]> = {};
      symbols.forEach((sym, i) => {
        dataMap[sym] = results[i];
      });
      setStockData(dataMap);
      setLoading(false);
    });

    Promise.all(symbols.map(sym => fetchStockSummary(sym))).then(results => {
      const summaryMap: Record<string, StockSummary> = {};
      symbols.forEach((sym, i) => {
        if (results[i]) summaryMap[sym] = results[i];
      });
      setStockSummaries(summaryMap);
    });
  }, [symbols]);

  const handleAddSymbol = (symbol?: string) => {
    const sym = (symbol ?? input).trim().toUpperCase();
    if (sym && !symbols.includes(sym)) {
      setSymbols(prev => [...prev, sym]);
      setInput('');
      setSuggestions([]);
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    setSymbols(prev => prev.filter(s => s !== symbol));
    setStockData(prev => {
      const copy = { ...prev };
      delete copy[symbol];
      return copy;
    });
    setStockSummaries(prev => {
      const copy = { ...prev };
      delete copy[symbol];
      return copy;
    });
  };

  const saveToPortfolio = (symbol: string) => {
    const existing = JSON.parse(localStorage.getItem('portfolio') || '[]');
    if (!existing.includes(symbol)) {
      localStorage.setItem('portfolio', JSON.stringify([...existing, symbol]));
      alert(`${symbol} saved to portfolio!`);
    } else {
      alert(`${symbol} is already in portfolio`);
    }
  };

  const StockReportCard = ({ summary }: { summary: StockSummary }) => {
    if (!summary) return null;
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 m-3 max-w-sm flex flex-col">
        <h2 className="text-2xl font-semibold mb-2">{summary.shortName ?? summary.symbol} ({summary.symbol})</h2>
        <p className="text-xl font-bold">
          ${summary.price?.toFixed(2)}{' '}
          <span className={`font-semibold ${summary.change && summary.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {summary.change && (summary.change >= 0 ? '▲' : '▼')} {summary.change?.toFixed(2)} ({summary.changePercent?.toFixed(2)}%)
          </span>
        </p>
        <div className="mt-4 text-sm space-y-1 text-gray-600 dark:text-gray-300">
          {summary.marketCap && <p>Market Cap: ${(summary.marketCap / 1e9).toFixed(2)} B</p>}
          {summary.fiftyTwoWeekHigh && <p>52 Week High: ${summary.fiftyTwoWeekHigh.toFixed(2)}</p>}
          {summary.fiftyTwoWeekLow && <p>52 Week Low: ${summary.fiftyTwoWeekLow.toFixed(2)}</p>}
          {summary.dividendYield && <p>Dividend Yield: {(summary.dividendYield * 100).toFixed(2)}%</p>}
          {summary.peRatio && <p>P/E Ratio: {summary.peRatio.toFixed(2)}</p>}
        </div>
        <button
          className="mt-auto bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
          onClick={() => saveToPortfolio(summary.symbol)}
        >
          Save to Portfolio
        </button>
      </div>
    );
  };

  // DEBUG LOGS: Remove these after troubleshooting
  console.log('Symbols:', symbols);
  console.log('Stock Data:', stockData);
  console.log('Combined Chart Data:', combineChartData(symbols, stockData, TIME_RANGES[timeRange]));
  console.log('Stock Summaries:', stockSummaries);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen text-black dark:text-white transition-colors max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Stock Price Performance</h1>

      <div className="relative w-72 mb-4">
        <input
          type="text"
          placeholder="Enter stock symbol (e.g. MSFT or RELIANCE.NSE)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAddSymbol();
          }}
          className="w-full border rounded-md px-4 py-2 dark:bg-gray-800 dark:text-white"
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md mt-1 w-full max-h-48 overflow-auto shadow-lg"
          >
            {suggestions.map(sug => (
              <div
                key={sug}
                onClick={() => handleAddSymbol(sug)}
                className="cursor-pointer px-4 py-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500"
              >
                {sug}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {symbols.map(sym => (
          <div
            key={sym}
            className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
          >
            {sym}
            <button
              onClick={() => handleRemoveSymbol(sym)}
              className="text-red-500 font-bold hover:text-red-700"
              title={`Remove ${sym}`}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        {Object.keys(TIME_RANGES).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range as keyof typeof TIME_RANGES)}
            className={`px-3 py-1 rounded border ${
              timeRange === range ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="w-full h-[450px] bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4">
        {loading ? (
          <p className="text-center">Loading stock data...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combineChartData(symbols, stockData, TIME_RANGES[timeRange])}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888833" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#888', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#888' }}
                minTickGap={20}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#888', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#888' }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#222', borderRadius: 8, border: 'none' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              {symbols.map((symbol, idx) => (
                <Line
                  key={symbol}
                  type="monotone"
                  dataKey={symbol}
                  stroke={chartColors[idx % chartColors.length]}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                  animationDuration={800}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center">
        {symbols.map(sym => (
          <StockReportCard key={sym} summary={stockSummaries[sym]} />
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => alert('Export functionality coming soon!')}
          className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded"
        >
          Export Chart
        </button>
      </div>
    </div>
  );
}
