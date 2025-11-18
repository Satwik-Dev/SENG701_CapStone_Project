import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  GitCompare, 
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Filter,
  TrendingUp,
  TrendingDown,
  Search,
  Layout,
  List,
  ShieldAlert
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { comparisonService } from '../services/comparisonService';
import type { Application } from '../types/application';
import type { ComparisonResult, ComponentDifference } from '../types/comparison';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'differences' | 'common';
type ViewMode = 'table' | 'side-by-side';

export const ComparePage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp1, setSelectedApp1] = useState<string>('');
  const [selectedApp2, setSelectedApp2] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLicenseAnalysis, setShowLicenseAnalysis] = useState(false);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationService.getApplications({
          page: 1,
          limit: 100,
          status: 'completed'
        });
        setApplications(data.items);
      } catch (error) {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleCompare = async () => {
    if (!selectedApp1 || !selectedApp2) {
      toast.error('Please select two applications to compare');
      return;
    }

    if (selectedApp1 === selectedApp2) {
      toast.error('Please select different applications');
      return;
    }

    setComparing(true);
    try {
      const result = await comparisonService.compareApplications({
        app1_id: selectedApp1,
        app2_id: selectedApp2
      });
      
      setComparisonResult(result);
      toast.success('Comparison completed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to compare applications');
    } finally {
      setComparing(false);
    }
  };

  const handleReset = () => {
    setComparisonResult(null);
    setSelectedApp1('');
    setSelectedApp2('');
    setFilter('all');
    setSearchQuery('');
    setViewMode('table');
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    if (!comparisonResult) return;

    setExporting(true);
    try {
      const blob = await comparisonService.exportComparison(comparisonResult, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sbom_comparison_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const getFilteredDifferences = (): ComponentDifference[] => {
    if (!comparisonResult) return [];

    let filtered = comparisonResult.differences;

    // Apply filter
    switch (filter) {
      case 'differences':
        filtered = filtered.filter(d => d.difference_type !== 'common');
        break;
      case 'common':
        filtered = filtered.filter(d => d.difference_type === 'common');
        break;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(diff => 
        diff.component_name.toLowerCase().includes(query) ||
        diff.app1_version?.toLowerCase().includes(query) ||
        diff.app2_version?.toLowerCase().includes(query) ||
        diff.app1_license?.toLowerCase().includes(query) ||
        diff.app2_license?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getLicenseAnalysis = () => {
    if (!comparisonResult) return null;

    const licenseConflicts = comparisonResult.differences.filter(d => d.license_diff);
    const uniqueLicensesApp1 = new Set(
      comparisonResult.differences
        .map(d => d.app1_license)
        .filter(l => l)
    );
    const uniqueLicensesApp2 = new Set(
      comparisonResult.differences
        .map(d => d.app2_license)
        .filter(l => l)
    );

    return {
      conflicts: licenseConflicts,
      app1Licenses: Array.from(uniqueLicensesApp1),
      app2Licenses: Array.from(uniqueLicensesApp2),
      totalConflicts: licenseConflicts.length
    };
  };

  const getDifferenceIcon = (type: string) => {
    switch (type) {
      case 'version':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'added':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'removed':
        return <TrendingDown className="w-4 h-4 text-rose-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-primary-600" />;
    }
  };

  const getDifferenceColor = (type: string) => {
    switch (type) {
      case 'version':
        return 'bg-amber-50 border-amber-200';
      case 'added':
        return 'bg-emerald-50 border-emerald-200';
      case 'removed':
        return 'bg-rose-50 border-rose-200';
      default:
        return 'bg-primary-50 border-primary-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Compare Applications
          </h1>
          <p className="mt-2 text-gray-600">
            Select two applications to compare their SBOMs and identify differences
          </p>
        </div>

        {/* Selection Section */}
        {!comparisonResult && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Application 1 Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application 1
                </label>
                <select
                  value={selectedApp1}
                  onChange={(e) => setSelectedApp1(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select an application...</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.platform}) - {app.component_count} components
                    </option>
                  ))}
                </select>
              </div>

              {/* Application 2 Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application 2
                </label>
                <select
                  value={selectedApp2}
                  onChange={(e) => setSelectedApp2(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select an application...</option>
                  {applications.map((app) => (
                    <option 
                      key={app.id} 
                      value={app.id}
                      disabled={app.id === selectedApp1}
                    >
                      {app.name} ({app.platform}) - {app.component_count} components
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Compare Button */}
            <div className="flex justify-center">
              <button
                onClick={handleCompare}
                disabled={!selectedApp1 || !selectedApp2 || comparing}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center shadow-sm"
              >
                {comparing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <GitCompare className="w-5 h-5 mr-2" />
                    Compare Applications
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Comparison Results */}
        {comparisonResult && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Comparison
                </button>
                
                <button
                  onClick={() => setShowLicenseAnalysis(!showLicenseAnalysis)}
                  className={`px-4 py-2 border rounded-lg font-medium transition-colors flex items-center ${
                    showLicenseAnalysis 
                      ? 'bg-primary-600 text-white border-primary-600' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  License Analysis
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'table' ? 'side-by-side' : 'table')}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  {viewMode === 'table' ? (
                    <>
                      <Layout className="w-4 h-4 mr-2" />
                      Side by Side
                    </>
                  ) : (
                    <>
                      <List className="w-4 h-4 mr-2" />
                      Table View
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  JSON
                </button>
              </div>
            </div>

            {/* License Analysis Panel */}
            {showLicenseAnalysis && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">License Analysis</h2>
                </div>
                
                {(() => {
                  const analysis = getLicenseAnalysis();
                  if (!analysis) return null;

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-600 mb-1">License Conflicts</p>
                          <p className="text-2xl font-bold text-rose-600">{analysis.totalConflicts}</p>
                        </div>
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-600 mb-1">Licenses in App 1</p>
                          <p className="text-2xl font-bold text-primary-600">{analysis.app1Licenses.length}</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-600 mb-1">Licenses in App 2</p>
                          <p className="text-2xl font-bold text-purple-600">{analysis.app2Licenses.length}</p>
                        </div>
                      </div>

                      {analysis.conflicts.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Components with License Differences</h3>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {analysis.conflicts.map((conflict, index) => (
                              <div key={index} className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                                <p className="font-medium text-gray-900">{conflict.component_name}</p>
                                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                  <div>
                                    <span className="text-gray-600">App 1: </span>
                                    <span className="font-medium text-gray-900">{conflict.app1_license || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">App 2: </span>
                                    <span className="font-medium text-gray-900">{conflict.app2_license || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Similarity</span>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {comparisonResult.summary.similarity_percentage}%
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Common</span>
                  <Package className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {comparisonResult.summary.total_common}
                </p>
                <p className="text-xs text-gray-500 mt-1">components</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Unique to App 1</span>
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {comparisonResult.summary.total_unique_app1}
                </p>
                <p className="text-xs text-gray-500 mt-1">components</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Unique to App 2</span>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {comparisonResult.summary.total_unique_app2}
                </p>
                <p className="text-xs text-gray-500 mt-1">components</p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search components, versions, or licenses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({comparisonResult.differences.length})
                  </button>
                  <button
                    onClick={() => setFilter('differences')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'differences'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Differences (
                    {comparisonResult.summary.total_unique_app1 +
                      comparisonResult.summary.total_unique_app2 +
                      comparisonResult.summary.total_version_differences}
                    )
                  </button>
                  <button
                    onClick={() => setFilter('common')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'common'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Common ({comparisonResult.summary.total_common})
                  </button>
                </div>
              </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    Component Comparison
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {getFilteredDifferences().length} components
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Component
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          {comparisonResult.app1_name}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          {comparisonResult.app2_name}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredDifferences().map((diff, index) => (
                        <tr 
                          key={index}
                          className={`${getDifferenceColor(diff.difference_type)} border-l-4 hover:bg-opacity-75 transition-colors`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {getDifferenceIcon(diff.difference_type)}
                              <span className="ml-2 text-sm font-medium text-gray-900 break-words">
                                {diff.component_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="text-gray-900 font-medium">
                                {diff.app1_version || (
                                  <span className="text-gray-400 italic">Not present</span>
                                )}
                              </div>
                              {diff.app1_license && (
                                <div className="text-gray-500 text-xs mt-1">
                                  {diff.app1_license}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="text-gray-900 font-medium">
                                {diff.app2_version || (
                                  <span className="text-gray-400 italic">Not present</span>
                                )}
                              </div>
                              {diff.app2_license && (
                                <div className="text-gray-500 text-xs mt-1">
                                  {diff.app2_license}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {diff.difference_type === 'version' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Version Diff
                              </span>
                            ) : diff.difference_type === 'added' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Added in App 2
                              </span>
                            ) : diff.difference_type === 'removed' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                Only in App 1
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Identical
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredDifferences().length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No components match your search or filter</p>
                  </div>
                )}
              </div>
            )}

            {/* Side-by-Side View */}
            {viewMode === 'side-by-side' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* App 1 Column */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-primary-600 p-4">
                    <h3 className="text-lg font-bold text-white">{comparisonResult.app1_name}</h3>
                    <p className="text-primary-100 text-sm">{comparisonResult.app1_platform} • {comparisonResult.app1_component_count} components</p>
                  </div>
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    <div className="space-y-2">
                      {getFilteredDifferences().map((diff, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-l-4 ${
                            diff.difference_type === 'removed' 
                              ? 'bg-rose-50 border-rose-400'
                              : diff.difference_type === 'version'
                              ? 'bg-amber-50 border-amber-400'
                              : 'bg-gray-50 border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{diff.component_name}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {diff.app1_version || <span className="italic text-gray-400">Not present</span>}
                              </p>
                              {diff.app1_license && (
                                <p className="text-xs text-gray-500 mt-1">{diff.app1_license}</p>
                              )}
                            </div>
                            {getDifferenceIcon(diff.difference_type)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* App 2 Column */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-purple-600 p-4">
                    <h3 className="text-lg font-bold text-white">{comparisonResult.app2_name}</h3>
                    <p className="text-purple-100 text-sm">{comparisonResult.app2_platform} • {comparisonResult.app2_component_count} components</p>
                  </div>
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    <div className="space-y-2">
                      {getFilteredDifferences().map((diff, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-l-4 ${
                            diff.difference_type === 'added' 
                              ? 'bg-emerald-50 border-emerald-400'
                              : diff.difference_type === 'version'
                              ? 'bg-amber-50 border-amber-400'
                              : 'bg-gray-50 border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{diff.component_name}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {diff.app2_version || <span className="italic text-gray-400">Not present</span>}
                              </p>
                              {diff.app2_license && (
                                <p className="text-xs text-gray-500 mt-1">{diff.app2_license}</p>
                              )}
                            </div>
                            {getDifferenceIcon(diff.difference_type)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* App Details Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {comparisonResult.app1_name}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Platform:</span>
                    <span className="text-sm font-medium">{comparisonResult.app1_platform}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Components:</span>
                    <span className="text-sm font-medium">{comparisonResult.app1_component_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unique Components:</span>
                    <span className="text-sm font-medium text-orange-600">
                      {comparisonResult.summary.total_unique_app1}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {comparisonResult.app2_name}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Platform:</span>
                    <span className="text-sm font-medium">{comparisonResult.app2_platform}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Components:</span>
                    <span className="text-sm font-medium">{comparisonResult.app2_component_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unique Components:</span>
                    <span className="text-sm font-medium text-purple-600">
                      {comparisonResult.summary.total_unique_app2}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};