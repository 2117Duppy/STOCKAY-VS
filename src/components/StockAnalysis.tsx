import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStock } from '@/contexts/StockContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, FileDown, Save, PlusCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const StockAnalysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getStockData, searchStocks, saveStock } = useStock();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [chartType, setChartType] = useState('line');
  const [timeFrame, setTimeFrame] = useState('1Y');
  
  // Extract symbol from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const symbol = queryParams.get('symbol');
    
    console.log('Symbol from URL:', symbol);
    
    if (symbol) {
      // Clear any existing selections before adding the new stock
      setSelectedStocks([]);
      
      // Add a slight delay to ensure state is updated
      setTimeout(() => {
        addStockToAnalysis(symbol);
      }, 100);
    } else if (selectedStocks.length === 0) {
      // Default stock for analysis
      addStockToAnalysis('AAPL');
    }
  }, [location.search]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 1) {
      const results = searchStocks(query);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };
  
  const addStockToAnalysis = (ticker: string) => {
    // Validate that we can get data for this stock
    console.log('Adding stock to analysis:', ticker);
    const stockData = getStockData(ticker);
    
    if (!stockData) {
      toast({
        title: "Stock not found",
        description: `Could not find data for ticker: ${ticker}`,
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedStocks.includes(ticker)) {
      setSelectedStocks(prev => [...prev, ticker]);
      toast({
        title: "Stock Added",
        description: `${stockData.name} (${ticker}) has been added to analysis`,
      });
      
      console.log('Updated selected stocks:', [...selectedStocks, ticker]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };
  
  const addStockBySearch = () => {
    if (searchQuery.trim() !== '') {
      addStockToAnalysis(searchQuery.trim().toUpperCase());
    }
  };
  
  const removeStockFromAnalysis = (ticker: string) => {
    setSelectedStocks(selectedStocks.filter(stock => stock !== ticker));
  };
  
  const handleSaveStock = (ticker: string) => {
    saveStock(ticker);
  };
  
  const getFilteredData = (ticker: string) => {
    const stock = getStockData(ticker);
    if (!stock || !stock.history) return [];
    
    const history = stock.history;
    let filteredData;
    
    switch(timeFrame) {
      case '1W':
        filteredData = history.slice(-7);
        break;
      case '1M':
        filteredData = history.slice(-30);
        break;
      case '6M':
        filteredData = history.slice(-180);
        break;
      case '1Y':
        filteredData = history;
        break;
      default:
        filteredData = history;
    }
    
    return filteredData.map(item => ({
      date: item.date,
      [ticker]: item.close
    }));
  };
  
  const renderChart = () => {
    if (selectedStocks.length === 0) return null;
    
    const firstStock = selectedStocks[0];
    const chartData = getFilteredData(firstStock);
    
    // Merge data for multiple stocks
    if (selectedStocks.length > 1) {
      selectedStocks.slice(1).forEach(ticker => {
        const stockData = getFilteredData(ticker);
        stockData.forEach((item, index) => {
          if (index < chartData.length) {
            chartData[index][ticker] = item[ticker];
          }
        });
      });
    }
    
    const renderChartComponent = () => {
      switch(chartType) {
        case 'line':
          return (
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => {
                  if (timeFrame === '1Y') {
                    return value.substring(5, 7); // Just month
                  }
                  return value.substring(5); // Month-day
                }}
              />
              <YAxis />
              <Tooltip />
              {selectedStocks.map((ticker, index) => (
                <Line 
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={getStockColor(index)}
                  strokeWidth={2}
                  dot={false}
                  name={ticker}
                />
              ))}
            </LineChart>
          );
        case 'area':
          return (
            <AreaChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (timeFrame === '1Y') {
                    return value.substring(5, 7); // Just month
                  }
                  return value.substring(5); // Month-day
                }}
              />
              <YAxis />
              <Tooltip />
              {selectedStocks.map((ticker, index) => (
                <Area 
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={getStockColor(index)}
                  fill={`${getStockColor(index)}33`}
                  name={ticker}
                />
              ))}
            </AreaChart>
          );
        case 'bar':
          return (
            <BarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (timeFrame === '1Y') {
                    return value.substring(5, 7); // Just month
                  }
                  return value.substring(5); // Month-day
                }}
              />
              <YAxis />
              <Tooltip />
              {selectedStocks.map((ticker, index) => (
                <Bar 
                  key={ticker}
                  dataKey={ticker}
                  fill={getStockColor(index)}
                  name={ticker}
                />
              ))}
            </BarChart>
          );
        default:
          return (
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              {selectedStocks.map((ticker, index) => (
                <Line 
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={getStockColor(index)}
                  name={ticker}
                />
              ))}
            </LineChart>
          );
      }
    };
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        {renderChartComponent()}
      </ResponsiveContainer>
    );
  };
  
  // Get color for each stock
  const getStockColor = (index: number) => {
    const colors = ['#00AAFF', '#00FF99', '#9b87f5', '#ff4d4f', '#faad14'];
    return colors[index % colors.length];
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Stock Analysis Engine</h1>
      
      {/* Search and Add Stock */}
      <Card className="mb-8 glass-card">
        <CardHeader>
          <CardTitle>Add Stock to Analysis</CardTitle>
          <CardDescription>Search and add stocks to compare performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by company name or ticker symbol..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addStockBySearch();
                    }
                  }}
                />
              </div>
              
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 mt-2 w-full rounded-md border bg-popover p-2 shadow-md">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.ticker}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                      onMouseDown={() => addStockToAnalysis(stock.ticker)}
                    >
                      <div>
                        <div className="font-medium">{stock.ticker}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </div>
                      <div className={stock.change >= 0 ? "text-green-500" : "text-red-500"}>
                        ${stock.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button className="whitespace-nowrap" onClick={addStockBySearch}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </div>
          
          {/* Selected Stocks Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedStocks.map((ticker, index) => {
              const stock = getStockData(ticker);
              if (!stock) return null;
              
              return (
                <div 
                  key={ticker} 
                  className="flex items-center gap-2 py-1 px-3 rounded-full bg-primary/10 text-primary text-sm"
                  style={{ borderColor: getStockColor(index) }}
                >
                  <span>{ticker}</span>
                  <span className={stock.change >= 0 ? "text-green-500" : "text-red-500"}>
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                  <button
                    onClick={() => removeStockFromAnalysis(ticker)}
                    className="ml-1 h-4 w-4 rounded-full hover:bg-primary/20 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {selectedStocks.length > 0 ? (
        <>
          {/* Chart Controls */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('line')}
              >
                Line
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('area')}
              >
                Area
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('bar')}
              >
                Bar
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={timeFrame === '1W' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeFrame('1W')}
              >
                1W
              </Button>
              <Button
                variant={timeFrame === '1M' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeFrame('1M')}
              >
                1M
              </Button>
              <Button
                variant={timeFrame === '6M' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeFrame('6M')}
              >
                6M
              </Button>
              <Button
                variant={timeFrame === '1Y' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeFrame('1Y')}
              >
                1Y
              </Button>
            </div>
          </div>
          
          {/* Chart Card */}
          <Card className="mb-8 glass-card">
            <CardHeader>
              <CardTitle>Stock Price Performance</CardTitle>
              <CardDescription>
                {timeFrame === '1W' ? 'Last Week' : 
                 timeFrame === '1M' ? 'Last Month' : 
                 timeFrame === '6M' ? 'Last 6 Months' : 
                 'Last Year'} Performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {renderChart()}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export Chart
              </Button>
              {selectedStocks.length === 1 && (
                <Button size="sm" onClick={() => handleSaveStock(selectedStocks[0])}>
                  <Save className="h-4 w-4 mr-2" />
                  Save to Portfolio
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Stock Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedStocks.map((ticker, index) => {
              const stock = getStockData(ticker);
              if (!stock) return null;
              
              return (
                <Card key={ticker} className="glass-card">
                  <CardHeader style={{ borderColor: getStockColor(index) }}>
                    <div className="flex justify-between items-center">
                      <CardTitle>{stock.ticker}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleSaveStock(ticker)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>{stock.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold">${stock.price.toFixed(2)}</div>
                        <div className={`${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Market Cap</div>
                        <div>{stock.marketCap}</div>
                      </div>
                    </div>
                    
                    <Tabs defaultValue="overview">
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="stats">Key Stats</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Volume</span>
                            <span className="font-medium">{stock.volume}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">P/E Ratio</span>
                            <span className="font-medium">{stock.peRatio?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">52 Week High</span>
                            <span className="font-medium">${stock.yearHigh?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">52 Week Low</span>
                            <span className="font-medium">${stock.yearLow?.toFixed(2)}</span>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="stats">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Beta</span>
                            <span className="font-medium">1.23</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dividend Yield</span>
                            <span className="font-medium">0.56%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">EPS</span>
                            <span className="font-medium">$6.42</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Shares Outstanding</span>
                            <span className="font-medium">14.2B</span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <div className="py-12 text-center">
          <h3 className="text-xl mb-4">No stocks selected for analysis</h3>
          <p className="text-muted-foreground mb-6">Search for a stock to start analyzing its performance.</p>
        </div>
      )}
    </div>
  );
};

export default StockAnalysis;
