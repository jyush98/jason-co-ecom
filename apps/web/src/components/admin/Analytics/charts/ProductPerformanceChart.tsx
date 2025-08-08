// components/admin/Analytics/IntegratedProductChart.tsx  
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Package,
  TrendingUp,
  Star,
  Download,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  Trophy
} from 'lucide-react';
import { useProductAnalytics } from '@/lib/hooks/useAnalytics';

interface IntegratedProductChartProps {
  timeRange: string;
  chartType: string;
  sortBy: string;
  onTimeRangeChange: (range: string) => void;
  onChartTypeChange: (type: string) => void;
  onSortChange: (sort: string) => void;
}

export default function IntegratedProductChart({
  timeRange,
  chartType,
  sortBy,
  onTimeRangeChange,
  onChartTypeChange,
  onSortChange
}: IntegratedProductChartProps) {
  const { data: productData, isLoading, refetch } = useProductAnalytics(timeRange, sortBy);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? 
              (entry.dataKey === 'revenue' || entry.dataKey === 'profit' ? 
                `${entry.value.toLocaleString()}` : 
                entry.value.toLocaleString()
              ) : entry.value}
          </p>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Loading product analytics...</span>
          </div>
        </div>
      );
    }

    if (!productData) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400">No product data available</div>
        </div>
      );
    }

    switch (chartType) {
      case 'performance':
        return (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData.topProducts?.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" fill="#FFD700" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                <Bar dataKey="profit" fill="#87CEEB" radius={[4, 4, 0, 0]} name="Profit ($)" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {productData.topProducts?.slice(0, 6).map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{product.name}</h4>
                      <p className="text-slate-400 text-sm">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${product.revenue.toLocaleString()}</p>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        <span className="text-slate-300 text-sm">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Units Sold</p>
                      <p className="text-white font-medium">{product.unitsSold}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Conversion</p>
                      <p className="text-white font-medium">{product.conversionRate}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Stock</p>
                      <p className={`font-medium ${product.inventory < 20 ? 'text-red-400' : 'text-white'}`}>
                        {product.inventory}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Growth</p>
                      <p className="text-green-400 font-medium">+{product.growthRate}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData.categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, revenue }) => `${category}: ${(revenue/1000).toFixed(0)}K`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {productData.categories?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-4">
              {productData.categories?.map((category: any, index: number) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="text-white font-medium">{category.category}</p>
                      <p className="text-slate-400 text-sm">{category.productCount} products</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${(category.revenue/1000).toFixed(0)}K</p>
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                      <span className="text-green-400 text-sm">+{category.growthRate}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'trends':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={productData.salesData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FFD700"
                strokeWidth={3}
                dot={{ fill: '#FFD700', strokeWidth: 2, r: 4 }}
                fill="url(#revenueGradient)"
                name="Revenue ($)"
              />
              <Line
                type="monotone"
                dataKey="units"
                stroke="#87CEEB"
                strokeWidth={3}
                dot={{ fill: '#87CEEB', strokeWidth: 2, r: 4 }}
                name="Units Sold"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Package className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Product Performance</h3>
            <p className="text-slate-400 text-sm">Live product insights from your database</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors">
            <Download className="w-4 h-4 text-slate-300" />
            <span className="text-slate-300 text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {productData?.metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Revenue</p>
                <p className="text-white text-2xl font-bold">${(productData.metrics.totalRevenue / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm">+{productData.metrics.periodComparison.revenue}%</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Units Sold</p>
                <p className="text-white text-2xl font-bold">{productData.metrics.totalUnits.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm">+{productData.metrics.periodComparison.units}%</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Rating</p>
                <p className="text-white text-2xl font-bold">{productData.metrics.averageRating}</p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400 text-sm">{productData.metrics.conversionRate}% conversion</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Products</p>
                <p className="text-white text-2xl font-bold">{productData.metrics.activeProducts}</p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Trophy className="w-4 h-4 text-purple-400 mr-1" />
              <span className="text-purple-400 text-sm">{productData.metrics.topSellingProduct}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 rounded-lg p-4 border border-slate-700"
      >
        {renderChart()}
      </motion.div>
    </motion.div>
  );
}