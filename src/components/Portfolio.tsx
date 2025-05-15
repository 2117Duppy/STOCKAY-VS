
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '@/contexts/StockContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookmarkCheck, FileDown, Trash2, Plus, ExternalLink } from 'lucide-react';

const Portfolio: React.FC = () => {
  const { stockData, news, portfolio, unsaveStock } = useStock();
  const navigate = useNavigate();
  
  // Filter saved stocks and news based on user's portfolio
  const savedStocks = portfolio.savedStocks
    .map(ticker => stockData[ticker])
    .filter(Boolean);
    
  const likedNews = news.filter(item => portfolio.likedNews.includes(item.id));
  
  // Generate mock portfolio allocation data
  const allocationData = savedStocks.map(stock => ({
    name: stock.ticker,
    value: stock.price * (Math.floor(Math.random() * 10) + 1) // Random shares count
  }));
  
  const totalValue = allocationData.reduce((sum, item) => sum + item.value, 0);
  
  // Generate mock chart data for each stock
  const generateChartData = (changePercent: number) => {
    const isPositive = changePercent >= 0;
    
    return Array.from({ length: 20 }, (_, i) => {
      let value;
      if (isPositive) {
        value = 100 + (i * changePercent / 3) + (Math.random() * changePercent / 2);
      } else {
        value = 100 + (i * changePercent / 3) + (Math.random() * Math.abs(changePercent) / 2);
      }
      return { value };
    });
  };
  
  // Colors for the pie chart
  const COLORS = ['#00AAFF', '#00FF99', '#9b87f5', '#ff4d4f', '#faad14', '#8967e8'];
  
  // Handle viewing a stock analysis
  const handleViewStock = (ticker: string) => {
    navigate(`/analysis?symbol=${ticker}`);
  };
  
  // Handle removing a stock from portfolio
  const handleRemoveStock = (ticker: string) => {
    unsaveStock(ticker);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-2">
        <BookmarkCheck className="text-primary h-6 w-6" />
        <h1 className="text-3xl font-bold">Portfolio Management</h1>
      </div>
      <p className="text-muted-foreground mb-8">Track, manage, and analyze your investment portfolio</p>
      
      <Tabs defaultValue="portfolio">
        <TabsList className="mb-8">
          <TabsTrigger value="portfolio">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="saved-stocks">Saved Stocks</TabsTrigger>
          <TabsTrigger value="liked-news">Liked News</TabsTrigger>
        </TabsList>
        
        {/* Portfolio Overview Tab */}
        <TabsContent value="portfolio">
          {savedStocks.length > 0 ? (
            <>
              {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Portfolio Value Card */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Portfolio Summary</CardTitle>
                    <CardDescription>Overview of your tracked investments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="text-muted-foreground text-sm">Total Portfolio Value</div>
                      <div className="text-3xl font-bold">
                        ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-muted-foreground text-sm">Stocks Tracked</div>
                        <div className="text-xl font-medium">{savedStocks.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-sm">Daily Change</div>
                        <div className={`text-xl font-medium ${
                          savedStocks.reduce((sum, stock) => sum + stock.change, 0) >= 0 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {savedStocks.reduce((sum, stock) => sum + stock.change, 0) >= 0 ? '+' : ''}
                          {savedStocks.reduce((sum, stock) => sum + stock.changePercent, 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <FileDown className="h-4 w-4 mr-2" />
                      Export Portfolio
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Portfolio Allocation */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Portfolio Allocation</CardTitle>
                    <CardDescription>Distribution of your investments</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="h-[200px] w-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name }) => name}
                          >
                            {allocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                  <CardFooter className="block">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {allocationData.map((item, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div
                            className="w-3 h-3 rounded-full mr-1"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {item.name}: {((item.value / totalValue) * 100).toFixed(1)}%
                        </div>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Portfolio Performance */}
              <Card className="glass-card mb-8">
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Historical performance of your portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {/* Mock portfolio performance chart */}
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={Array.from({ length: 30 }, (_, i) => {
                        return {
                          date: new Date(Date.now() - (30 - i) * 86400000).toLocaleDateString(),
                          value: 10000 + (i * 50) + (Math.sin(i / 5) * 200) + (Math.random() * 100)
                        };
                      })}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#00AAFF"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recommended Actions */}
              <Card className="glass-card mb-8">
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                  <CardDescription>Suggestions to optimize your portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="p-3 bg-primary/10 rounded-lg flex items-start">
                      <div className="mr-4 mt-1 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Consider diversifying more</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your portfolio is heavily weighted in technology stocks. Consider adding stocks from other sectors for better diversification.
                        </p>
                      </div>
                    </li>
                    <li className="p-3 bg-accent/10 rounded-lg flex items-start">
                      <div className="mr-4 mt-1 text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Set up price alerts</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Stay informed about significant price movements by setting up price alerts for your tracked stocks.
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="py-12 text-center">
              <h3 className="text-xl mb-4">No stocks saved in your portfolio</h3>
              <p className="text-muted-foreground mb-6">Start by saving stocks from the Analysis or Trends page.</p>
              <Button onClick={() => navigate('/analysis')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Stocks to Portfolio
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Saved Stocks Tab */}
        <TabsContent value="saved-stocks">
          {savedStocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedStocks.map((stock) => {
                const chartData = generateChartData(stock.changePercent);
                
                return (
                  <Card key={stock.ticker} className="glass-card stock-card">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle>{stock.ticker}</CardTitle>
                          <CardDescription>{stock.name}</CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStock(stock.ticker);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex justify-between mb-2">
                        <div>
                          <div className="text-2xl font-bold">${stock.price.toFixed(2)}</div>
                          <div className={`${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-12 my-3">
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
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleViewStock(stock.ticker)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Analysis
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <h3 className="text-xl mb-4">No stocks saved yet</h3>
              <p className="text-muted-foreground mb-6">Start by saving stocks from the Analysis or Trends page.</p>
              <Button onClick={() => navigate('/analysis')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Stocks to Portfolio
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Liked News Tab */}
        <TabsContent value="liked-news">
          {likedNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {likedNews.map((item) => (
                <Card key={item.id} className="glass-card overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg">{item.headline}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{item.summary}</p>
                    <div className="text-sm text-muted-foreground">Source: {item.source}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <h3 className="text-xl mb-4">No liked news articles</h3>
              <p className="text-muted-foreground mb-6">Start by liking news articles from the Market page.</p>
              <Button onClick={() => navigate('/market')}>
                Browse Market News
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Portfolio;
