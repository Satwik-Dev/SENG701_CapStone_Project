import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import type { Application } from '../../types/application';

interface RecentActivityProps {
  applications: Application[];
  loading: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ applications, loading }) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div
          key={app.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center flex-1 min-w-0">
            {getStatusIcon(app.status)}
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {app.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatTimeAgo(app.created_at)}
                {app.platform && app.platform !== 'unknown' && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-gray-200 rounded-full">
                    {app.platform}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/applications/${app.id}`)}
            className="ml-3 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};