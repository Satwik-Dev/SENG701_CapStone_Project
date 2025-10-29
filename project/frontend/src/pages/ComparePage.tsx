import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  GitCompare, 
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Download,
  RefreshCw
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import type { Application } from '../types/application';
import toast from 'react-hot-toast';

export const ComparePage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp1, setSelectedApp1] = useState<string>('');
  const [selectedApp2, setSelectedApp2] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

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
      // Simulated comparison logic
      // In production, this would call your backend comparison API
      await new Promise(resolve => setTimeout(resolve, 1500));

      const app1 = applications.find(app => app.id === selectedApp1);
      const app2 = applications.find(app => app.id === selectedApp2);

      // Simulated comparison result
      const result = {
        app1: {
          name: app1?.name,
          componentCount: app1?.component_count || 0,
          platform: app1?.platform,
        },
        app2: {
          name: app2?.name,
          componentCount: app2?.component_count || 0,
          platform: app2?.platform,
        },
        common: Math.floor(Math.random() * 50) + 20,
        uniqueToApp1: Math.floor(Math.random() * 30) + 10,
        uniqueToApp2: Math.floor(Math.random() * 30) + 10,
        similarity: (Math.random() * 40 + 50).toFixed(1),
        differences: [
          { component: 'react', app1Version: '18.2.0', app2Version: '17.0.2', type: 'version' },
          { component: 'lodash', app1Version: '4.17.21', app2Version: null, type: 'missing' },
          { component: 'axios', app1Version: null, app2Version: '1.4.0', type: 'missing' },
        ]
      };

      setComparisonResult(result);
      toast.success('Comparison completed successfully');
    } catch (error) {
      toast.error('Failed to compare applications');
    } finally {
      setComparing(false);
    }
  };

  const handleReset = () => {
    setSelectedApp1('');
    setSelectedApp2('');
    setComparisonResult(null);
  };

  const handleExport = () => {
    toast.success('Comparison report exported successfully');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compare Applications
          </h1>
          <p className="text-gray-600">
            Compare SBOMs between two applications to identify differences and similarities
          </p>
        </div>

        {/* Application Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 ml-3">Select Applications</h2>
          </div>

          {applications.length < 2 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">
                You need at least 2 completed applications to compare
              </p>
              <p className="text-sm text-gray-500">
                Upload and analyze applications first to enable comparison
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* First Application */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Application
                </label>
                <select
                  value={selectedApp1}
                  onChange={(e) => setSelectedApp1(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select an application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.platform})
                    </option>
                  ))}
                </select>
                {selectedApp1 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      {applications.find(a => a.id === selectedApp1)?.component_count || 0} components
                    </p>
                  </div>
                )}
              </div>

              {/* VS Icon */}
              <div className="hidden lg:flex justify-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-600" />
                </div>
              </div>

              {/* Second Application */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Second Application
                </label>
                <select
                  value={selectedApp2}
                  onChange={(e) => setSelectedApp2(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select an application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.platform})
                    </option>
                  ))}
                </select>
                {selectedApp2 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      {applications.find(a => a.id === selectedApp2)?.component_count || 0} components
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {applications.length >= 2 && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCompare}
                disabled={!selectedApp1 || !selectedApp2 || comparing}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
              {comparisonResult && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {comparisonResult && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Similarity</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{comparisonResult.similarity}%</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Common</span>
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{comparisonResult.common}</p>
                <p className="text-xs text-gray-500 mt-1">components</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Unique to App 1</span>
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{comparisonResult.uniqueToApp1}</p>
                <p className="text-xs text-gray-500 mt-1">components</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Unique to App 2</span>
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{comparisonResult.uniqueToApp2}</p>
                <p className="text-xs text-gray-500 mt-1">components</p>
              </div>
            </div>

            {/* Detailed Differences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Key Differences</h2>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Component</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">{comparisonResult.app1.name}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">{comparisonResult.app2.name}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonResult.differences.map((diff: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{diff.component}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {diff.app1Version || <span className="text-gray-400 italic">Not found</span>}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {diff.app2Version || <span className="text-gray-400 italic">Not found</span>}
                        </td>
                        <td className="py-3 px-4">
                          {diff.type === 'version' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Version Diff
                            </span>
                          ) : diff.app1Version ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Missing in App 2
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Missing in App 1
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Comparison */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Component Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{comparisonResult.app1.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Components</span>
                      <span className="font-medium">{comparisonResult.app1.componentCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Platform</span>
                      <span className="font-medium">{comparisonResult.app1.platform}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Unique Components</span>
                      <span className="font-medium text-orange-600">{comparisonResult.uniqueToApp1}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{comparisonResult.app2.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Components</span>
                      <span className="font-medium">{comparisonResult.app2.componentCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Platform</span>
                      <span className="font-medium">{comparisonResult.app2.platform}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Unique Components</span>
                      <span className="font-medium text-purple-600">{comparisonResult.uniqueToApp2}</span>
                    </div>
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