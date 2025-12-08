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
  TrendingUp, FileCode, Scale, Activity, Cpu, Code
} from 'lucide-react';
import { statsService } from '../services/statsService';
import type { StatsOverview, ComponentTypeStats, GroupedStat } from '../services/statsService';
import toast from 'react-hot-toast';

// Color palette matching your UI
const COLORS = [
  '#3B82F6', // Blue-500 (Primary)
  '#6366F1', // Indigo-500
  '#8B5CF6', // Violet-500
  '#EC4899', // Pink-500
  '#10B981', // Emerald-500
  '#F59E0B', // Amber-500
  '#EF4444', // Red-500
  '#06B6D4', // Cyan-500
  '#84CC16', // Lime-500
  '#F97316', // Orange-500
];

// Platform-specific colors
const PLATFORM_COLORS: Record<string, string> = {
  'Android': '#3DDC84',
  'Ios': '#007AFF',
  'Windows': '#0078D4',
  'Macos': '#000000',
  'Linux': '#FCC624',
  'Unknown': '#9CA3AF'
};

// Binary type colors
const BINARY_TYPE_COLORS: Record<string, string> = {
  'Mobile': '#3DDC84',
  'Desktop': '#0078D4',
  'Server': '#6366F1',
  'Container': '#06B6D4',
  'Library': '#F59E0B',
  'Unknown': '#9CA3AF'
};

type StatCategory = 'platform' | 'os' | 'binary_type' | 'supplier' | 'manufacturer' | 'components' | 'licenses' | 'languages';

interface ViewButton {
  id: StatCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ChartDataItem {
  name: string;
  count: number;
  total_components?: number;
  [key: string]: string | number | undefined;
}

// Custom tooltip component for better formatting
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-medium text-gray-900">{payload[0].value}</span>
        </p>
        {payload[0].payload.total_components !== undefined && (
          <p className="text-sm text-gray-600">
            Components: <span className="font-medium text-gray-900">
              {payload[0].payload.total_components?.toLocaleString()}
            </span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

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

  // Get data for the active view
  const getActiveData = (): ChartDataItem[] => {
    if (!overview) return [];
    
    let rawData: (GroupedStat | { name: string; count: number })[] = [];
    
    switch (activeView) {
      case 'binary_type':
        rawData = overview.by_binary_type;
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
      case 'languages':
        rawData = componentStats?.by_language || [];
        break;
      default:
        rawData = overview.by_platform;
    }
    
    return rawData.map(item => ({
      name: item.name,
      count: item.count,
      total_components: 'total_components' in item ? item.total_components : undefined
    }));
  };

  // Get color for a data item
  const getItemColor = (name: string, index: number): string => {
    const normalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    
    if (activeView === 'platform') {
      return PLATFORM_COLORS[normalizedName] || COLORS[index % COLORS.length];
    }
    if (activeView === 'binary_type') {
      return BINARY_TYPE_COLORS[normalizedName] || COLORS[index % COLORS.length];
    }
    return COLORS[index % COLORS.length];
  };

  // Truncate long names for labels
  const truncateName = (name: string, maxLength: number = 15): string => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 2) + '...';
  };

  // Custom label renderer for pie chart - external labels to avoid overlap
  const renderCustomLabel = ({ 
    name, 
    percent, 
    cx, 
    cy, 
    midAngle, 
    outerRadius 
  }: { 
    name?: string; 
    percent?: number; 
    cx?: number; 
    cy?: number; 
    midAngle?: number; 
    outerRadius?: number;
  }) => {
    if (!cx || !cy || !midAngle || !outerRadius) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const percentValue = percent ?? 0;
    if (percentValue < 0.03) return null; // Hide labels for very small slices
    
    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {truncateName(name || 'Unknown')}: {(percentValue * 100).toFixed(0)}%
      </text>
    );
  };

  // View toggle buttons configuration
  const viewButtons: ViewButton[] = [
    { id: 'platform', label: 'Platform', icon: Monitor },
    { id: 'os', label: 'Operating System', icon: Layers },
    { id: 'binary_type', label: 'Application Type', icon: Cpu },
    { id: 'supplier', label: 'Supplier', icon: Building2 },
    { id: 'manufacturer', label: 'Manufacturer', icon: Factory },
    { id: 'components', label: 'Component Types', icon: Package },
    { id: 'languages', label: 'Languages', icon: Code },
    { id: 'licenses', label: 'Licenses', icon: Scale },
  ];

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
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
              <div className="bg-indigo-100 rounded-xl p-3">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
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
              <div className="bg-amber-100 rounded-xl p-3">
                <Scale className="w-8 h-8 text-amber-600" />
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
                      ? 'bg-blue-600 text-white shadow-md'
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Distribution by {activeViewLabel}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={activeData.slice(0, 10)} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={115}
                    tick={{ fontSize: 12, fill: '#374151' }}
                    tickFormatter={(value) => truncateName(value, 18)}
                  />
                  <Tooltip content={<CustomTooltip />} />
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
                <PieChartIcon className="w-5 h-5 text-blue-600" />
                Proportion by {activeViewLabel}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                  <Pie
                    data={activeData.filter(d => d.count > 0).slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={renderCustomLabel}
                    paddingAngle={2}
                  >
                    {activeData.filter(d => d.count > 0).slice(0, 8).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getItemColor(entry.name, index)} 
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
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
              <FileCode className="w-5 h-5 text-blue-600" />
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
                    {!['components', 'licenses', 'languages'].includes(activeView) && (
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
                        {!['components', 'licenses', 'languages'].includes(activeView) && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(item.total_components || 0).toLocaleString()}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(parseFloat(percentage), 100)}%`,
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

        {/* Programming Languages Chart (when viewing components) */}
        {activeView === 'components' && componentStats && componentStats.by_language.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" />
              Programming Languages
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={componentStats.by_language.slice(0, 10).map((item) => ({
                  name: item.name,
                  count: item.count
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 11, fill: '#374151' }}
                  interval={0}
                />
                <YAxis stroke="#6B7280" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]}>
                  {componentStats.by_language.slice(0, 10).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};