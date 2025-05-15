import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStock } from '@/contexts/StockContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, TrendingUp, BookMarked, Newspaper } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { trendingStocks, news } = useStock();
  const navigate = useNavigate();

  // Get recent news
  const recentNews = news.slice(0, 3);

  // Mock market overview data
  const marketOverview = [
    { name: 'S&P 500', value: 4582.64, change: +0.98 },
    { name: 'DOW', value: 38563.12, change: +0.45 },
    { name: 'NASDAQ', value: 15690.50, change: +1.25 },
    { name: 'VIX', value: 16.38, change: -5.02 },
  ];

  // Mock weekly performance data for the chart
  const weeklyPerformance = [
    { name: 'Mon', sp500: 4520, nasdaq: 15520, dow: 38200 },
    { name: 'Tue', sp500: 4530, nasdaq: 15580, dow: 38300 },
    { name: 'Wed', sp500: 4540, nasdaq: 15600, dow: 38400 },
    { name: 'Thu', sp500: 4550, nasdaq: 15650, dow: 38450 },
    { name: 'Fri', sp500: 4582, nasdaq: 15690, dow: 38563 },
  ];

  // Sector performance data - Modified to include color property
  const sectorPerformance = [
    { name: 'Technology', value: 4.2, color: "#00FF99" },
    { name: 'Healthcare', value: 1.8, color: "#00FF99" },
    { name: 'Financials', value: 0.9, color: "#00FF99" },
    { name: 'Consumer', value: -0.5, color: "#ff4d4f" },
    { name: 'Energy', value: -1.2, color: "#ff4d4f" },
  ];

  // Handle stock click to navigate to analysis page
  const handleStockClick = (ticker: string) => {
    navigate(`/analysis?symbol=${ticker}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here's your financial overview for today</p>
      </div>

      {/* Top Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/analysis" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Stock Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analyze any stock with our powerful tools and charts.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Analyze Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
        
        <Link to="/portfolio" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-primary" />
                Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View and manage your saved stocks and watchlists.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View Portfolio <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
        
        <Link to="/market" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                Market News
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Stay updated with the latest financial news and headlines.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Read News <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>

      {/* Market Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {marketOverview.map((item, index) => (
            <Card key={index} className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value.toLocaleString()}</div>
                <div className={`text-sm ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change}%
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Performance Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Weekly Market Performance</CardTitle>
            <CardDescription>S&P 500, NASDAQ, and Dow Jones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyPerformance}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sp500" 
                    stroke="#00AAFF" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    name="S&P 500"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="nasdaq" 
                    stroke="#00FF99" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    name="NASDAQ"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="dow" 
                    stroke="#9b87f5" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    name="DOW"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sector Performance */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Sector Performance</CardTitle>
            <CardDescription>Today's market sector performance (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorPerformance}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill="#8884d8"
                    stroke="#8884d8"
                    radius={[4, 4, 0, 0]}
                    name="Performance (%)"
                  >
                    {sectorPerformance.map((entry, index) => (
                      <Bar 
                        key={`cell-${index}`}
                        dataKey="value"
                        fill={entry.value >= 0 ? "#00FF99" : "#ff4d4f"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Stocks and News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Trending Stocks */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle>Trending Stocks</CardTitle>
            <CardDescription>Most active stocks today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingStocks.international.slice(0, 5).map((stock, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between hover:bg-accent/10 p-2 rounded-md cursor-pointer"
                  onClick={() => handleStockClick(stock.ticker)}
                >
                  <div>
                    <div className="font-medium">{stock.ticker}</div>
                    <div className="text-sm text-muted-foreground">{stock.name}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">${stock.price.toFixed(2)}</span>
                    <span className={stock.change >= 0 ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link to="/trends">View All Trending Stocks</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent News */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle>Latest Market News</CardTitle>
            <CardDescription>Recent financial headlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNews.map((item, index) => (
                <div key={index} className="hover:bg-accent/10 p-2 rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium">{item.headline}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                  <div className="mt-1 text-xs text-muted-foreground">Source: {item.source}</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link to="/market">Read More News</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Get Started Button */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-4">Ready to analyze a specific stock?</h2>
        <Link to="/analysis">
          <Button size="lg" className="px-8 py-6 text-lg">
            Start Stock Analysis
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
