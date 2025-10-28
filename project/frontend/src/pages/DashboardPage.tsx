import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatsCard } from '../components/dashboard/StatsCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { 
  FolderOpen, 
  Package, 
  CheckCircle, 
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import type { Application } from '../types/application';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalComponents: 0,
    completedAnalyses: 0,
    processingAnalyses: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    
    try {
      // Fetch recent applications
      const appsData = await applicationService.getApplications({
        page: 1,
        limit: 5,
      });

      setRecentApplications(appsData.items);

      // Calculate stats
      const totalApps = appsData.total;
      const completed = appsData.items.filter(app => app.status === 'completed').length;
      const processing = appsData.items.filter(app => app.status === 'processing').length;
      const totalComps = appsData.items.reduce((sum, app) => sum + (app.component_count || 0), 0);

      setStats({
        totalApplications: totalApps,
        totalComponents: totalComps,
        completedAnalyses: completed,
        processingAnalyses: processing,
      });
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      if (!silent) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData(false);// initial load
    
    // silent Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's an overview of your SBOM management.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={FolderOpen}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatsCard
            title="Total Components"
            value={stats.totalComponents}
            icon={Package}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatsCard
            title="Completed Analyses"
            value={stats.completedAnalyses}
            icon={CheckCircle}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatsCard
            title="Processing"
            value={stats.processingAnalyses}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <QuickActions />
        </div>

        {/* Recent Activity & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <button 
                onClick={() => window.location.href = '/applications'}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all →
              </button>
            </div>
            <RecentActivity applications={recentApplications} loading={loading} />
          </div>

          {/* Tips & Info */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Getting Started
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Upload an Application</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Upload your first app to generate an SBOM
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Analyze Components</p>
                  <p className="text-xs text-gray-600 mt-1">
                    View detailed component information and licenses
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Export & Share</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Export SBOMs in SPDX or CycloneDX format
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-primary-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Supported Platforms</p>
                  <p className="text-xs text-gray-600 mt-1">
                    iOS, Android, Windows, macOS, and Linux applications
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};