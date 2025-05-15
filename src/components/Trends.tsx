
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '@/contexts/StockContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const Trends: React.FC = () => {
  const { trendingStocks } = useStock();
  const navigate = useNavigate();
  
  // Mock chart data
  const generateChartData = (changePercent: number) => {
    const isPositive = changePercent >= 0;
    
    return Array.from({ length: 20 }, (_, i) => {
      // Create a slightly random trending line based on change percentage
      let value;
      if (isPositive) {
        value = 100 + (i * changePercent / 3) + (Math.random() * changePercent / 2);
      } else {
        value = 100 + (i * changePercent / 3) + (Math.random() * Math.abs(changePercent) / 2);
      }
      return { value };
    });
  };
  
  const handleStockClick = (ticker: string) => {
    // This is the fix - make sure we're passing the correct ticker to the analysis page
    navigate(`/analysis?symbol=${ticker}`);
  };
  
  const renderStockCards = (stocks: any[]) => {
    return (
      <ScrollArea className="w-full">
        <div className="flex space-x-6 pb-6">
          {stocks.map((stock, index) => {
            const chartData = generateChartData(stock.changePercent);
            
            return (
              <Card 
                key={`${stock.ticker}-${index}`}
                className="w-72 glass-card transition-all duration-300 stock-card"
                onClick={() => handleStockClick(stock.ticker)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{stock.ticker}</CardTitle>
                      <CardDescription className="text-sm truncate max-w-[180px]">{stock.name}</CardDescription>
                    </div>
                    <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold mb-2">${stock.price.toFixed(2)}</div>
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Line 
                          type="monotone"
                          dataKey="value"
                          stroke={stock.change >= 0 ? '#00FF99' : '#ff4d4f'}
                          dot={false}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full">View Analysis</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="text-primary h-6 w-6" />
        <h1 className="text-3xl font-bold">Trending Stocks</h1>
      </div>
      <p className="text-muted-foreground mb-8">Track current market movements and popular stocks</p>
      
      {/* Indian Market Trends */}
      <div className="mb-12">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">🇮🇳 Indian Market</CardTitle>
                <CardDescription>Trending stocks in the Indian stock market</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderStockCards(trendingStocks.indian)}
          </CardContent>
        </Card>
      </div>
      
      {/* International Market Trends */}
      <div className="mb-12">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">🌎 International Market</CardTitle>
                <CardDescription>Trending stocks in global markets</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderStockCards(trendingStocks.international)}
          </CardContent>
        </Card>
      </div>
      
      {/* Sector Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Sector Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sectors.map((sector) => (
            <Card key={sector.name} className="glass-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{sector.name}</h3>
                  <div className={`text-sm ${sector.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {sector.change >= 0 ? '+' : ''}{sector.change}%
                  </div>
                </div>
                <div className="h-10 mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateChartData(sector.change)}>
                      <Line 
                        type="monotone"
                        dataKey="value"
                        stroke={sector.change >= 0 ? '#00FF99' : '#ff4d4f'}
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground mt-2">{sector.topStock}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Market Movers */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Today's Market Movers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Gainers */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Top Gainers</CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
              <div className="space-y-4">
                {topGainers.map((stock, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-2 hover:bg-accent/10 rounded-md cursor-pointer"
                    onClick={() => handleStockClick(stock.ticker)}
                  >
                    <div>
                      <div className="font-medium">{stock.ticker}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div>${stock.price.toFixed(2)}</div>
                      <div className="text-green-500 text-sm">+{stock.changePercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Top Losers */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Top Losers</CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
              <div className="space-y-4">
                {topLosers.map((stock, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-2 hover:bg-accent/10 rounded-md cursor-pointer"
                    onClick={() => handleStockClick(stock.ticker)}
                  >
                    <div>
                      <div className="font-medium">{stock.ticker}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div>${stock.price.toFixed(2)}</div>
                      <div className="text-red-500 text-sm">{stock.changePercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Mock sector data
const sectors = [
  { name: 'Technology', change: 2.4, topStock: 'Top: NVDA (+4.2%)' },
  { name: 'Healthcare', change: 1.2, topStock: 'Top: JNJ (+2.1%)' },
  { name: 'Finance', change: -0.8, topStock: 'Top: BAC (-0.3%)' },
  { name: 'Energy', change: -1.5, topStock: 'Top: XOM (-1.0%)' },
];

// Mock top gainers data
const topGainers = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 418.76, changePercent: 5.2 },
  { ticker: 'AMD', name: 'Advanced Micro Devices, Inc.', price: 108.92, changePercent: 4.7 },
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 196.42, changePercent: 3.8 },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 182.63, changePercent: 2.5 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', price: 337.21, changePercent: 2.1 },
];

// Mock top losers data
const topLosers = [
  { ticker: 'KO', name: 'The Coca-Cola Company', price: 58.24, changePercent: -3.8 },
  { ticker: 'T', name: 'AT&T Inc.', price: 17.82, changePercent: -3.2 },
  { ticker: 'CVX', name: 'Chevron Corporation', price: 152.24, changePercent: -2.9 },
  { ticker: 'PFE', name: 'Pfizer Inc.', price: 27.48, changePercent: -2.7 },
  { ticker: 'VZ', name: 'Verizon Communications Inc.', price: 39.65, changePercent: -2.2 },
];

export default Trends;
