import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart2, PieChart as PieChartIcon, Package, 
  Layers, Monitor, Building2, Factory, Loader2,
  TrendingUp, FileCode, Scale, Activity
} from 'lucide-react';
import { statsService } from '../services/statsService';
import type { StatsOverview, ComponentTypeStats, GroupedStat } from '../services/statsService';
import toast from 'react-hot-toast';

// Color palette for charts
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5CF6', '#22C55E', '#EAB308'
];

// Platform-specific colors
const PLATFORM_COLORS: Record<string, string> = {
  'android': '#3DDC84',
  'ios': '#007AFF',
  'windows': '#0078D4',
  'macos': '#000000',
  'linux': '#FCC624',
  'unknown': '#9CA3AF'
};

type StatCategory = 'platform' | 'os' | 'category' | 'supplier' | 'manufacturer' | 'components' | 'licenses';

interface ViewButton {
  id: StatCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Chart data type for recharts compatibility
interface ChartDataItem {
  name: string;
  count: number;
  total_components?: number;
  [key: string]: string | number | undefined;
}

export const StatisticsPage: React.FC = () => {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [componentStats, setComponentStats] = useState<ComponentTypeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<StatCategory>('platform');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [overviewData, componentData] = await Promise.all([
        statsService.getOverview(),
        statsService.getComponentTypes()
      ]);
      setOverview(overviewData);
      setComponentStats(componentData);
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get data for the active view and convert to chart-compatible format
  const getActiveData = (): ChartDataItem[] => {
    if (!overview) return [];
    
    let rawData: (GroupedStat | { name: string; count: number })[] = [];
    
    switch (activeView) {
      case 'category':
        rawData = overview.by_category;
        break;
      case 'os':
        rawData = overview.by_operating_system;
        break;
      case 'supplier':
        rawData = overview.by_supplier;
        break;
      case 'manufacturer':
        rawData = overview.by_manufacturer;
        break;
      case 'platform':
        rawData = overview.by_platform;
        break;
      case 'components':
        rawData = componentStats?.by_type || [];
        break;
      case 'licenses':
        rawData = componentStats?.by_license || [];
        break;
      default:
        rawData = overview.by_platform;
    }
    
    // Convert to chart-compatible format with index signature
    return rawData.map(item => ({
      name: item.name,
      count: item.count,
      total_components: 'total_components' in item ? item.total_components : undefined
    }));
  };

  // Get color for a data item
  const getItemColor = (name: string, index: number): string => {
    if (activeView === 'platform') {
      return PLATFORM_COLORS[name.toLowerCase()] || COLORS[index % COLORS.length];
    }
    return COLORS[index % COLORS.length];
  };

  // Custom label renderer for pie chart
  const renderCustomLabel = ({ name, percent }: { name?: string; percent?: number }) => {
    const nameValue = name ?? 'Unknown';
    const percentValue = percent ?? 0;
    return `${nameValue}: ${(percentValue * 100).toFixed(0)}%`;
  };

  // View toggle buttons configuration
  const viewButtons: ViewButton[] = [
    { id: 'platform', label: 'Platform', icon: Monitor },
    { id: 'os', label: 'Operating System', icon: Layers },
    { id: 'category', label: 'Category', icon: BarChart2 },
    { id: 'supplier', label: 'Supplier', icon: Building2 },
    { id: 'manufacturer', label: 'Manufacturer', icon: Factory },
    { id: 'components', label: 'Component Types', icon: Package },
    { id: 'licenses', label: 'Licenses', icon: Scale },
  ];

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeData = getActiveData();
  const activeViewLabel = viewButtons.find(b => b.id === activeView)?.label || '';

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SBOM Statistics
          </h1>
          <p className="text-gray-600">
            Analyze your software bill of materials across different categories
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">
                  {overview?.total_applications || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overview?.total_completed || 0} completed
                </p>
              </div>
              <div className="bg-blue-100 rounded-xl p-3">
                <Layers className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Components</p>
                <p className="text-3xl font-bold text-gray-900">
                  {overview?.total_components?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-xl p-3">
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Components/App</p>
                <p className="text-3xl font-bold text-gray-900">
                  {overview?.avg_components_per_app || 0}
                </p>
              </div>
              <div className="bg-purple-100 rounded-xl p-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Licenses</p>
                <p className="text-3xl font-bold text-gray-900">
                  {componentStats?.by_license?.length || 0}
                </p>
              </div>
              <div className="bg-orange-100 rounded-xl p-3">
                <Scale className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3">View statistics by:</p>
          <div className="flex flex-wrap gap-2">
            {viewButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  onClick={() => setActiveView(btn.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                    ${activeView === btn.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        {activeData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary-600" />
                Distribution by {activeViewLabel}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={activeData.slice(0, 10)} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={95}
                    tick={{ fontSize: 12, fill: '#374151' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [value, 'Count']}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 4, 4, 0]}
                  >
                    {activeData.slice(0, 10).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getItemColor(entry.name, index)} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary-600" />
                Proportion by {activeViewLabel}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={activeData.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={renderCustomLabel}
                  >
                    {activeData.slice(0, 8).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getItemColor(entry.name, index)} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              Upload some applications to see statistics for {activeViewLabel.toLowerCase()}.
            </p>
          </div>
        )}

        {/* Data Table */}
        {activeData.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-primary-600" />
              Detailed Breakdown - {activeViewLabel}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeViewLabel}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    {(activeView !== 'components' && activeView !== 'licenses') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Components
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeData.map((item, index) => {
                    const total = activeData.reduce((sum, i) => sum + i.count, 0);
                    const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                              style={{ backgroundColor: getItemColor(item.name, index) }}
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {item.count.toLocaleString()}
                        </td>
                        {(activeView !== 'components' && activeView !== 'licenses') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(item.total_components || 0).toLocaleString()}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: getItemColor(item.name, index)
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 font-medium w-12">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Summary row */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Showing {activeData.length} {activeViewLabel.toLowerCase()}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                Total: {activeData.reduce((sum, i) => sum + i.count, 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Component Language Distribution (when viewing components) */}
        {activeView === 'components' && componentStats && componentStats.by_language.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-primary-600" />
              Programming Languages
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={componentStats.by_language.slice(0, 10).map(item => ({
                name: item.name,
                count: item.count
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 11, fill: '#374151' }}
                />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};