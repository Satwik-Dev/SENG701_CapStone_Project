import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FolderOpen, BarChart3, Search } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Upload Application',
      description: 'Upload a new app to generate SBOM',
      icon: Upload,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/upload'),
    },
    {
      title: 'View Applications',
      description: 'Browse all your applications',
      icon: FolderOpen,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/applications'),
    },
    {
      title: 'View Statistics',
      description: 'Analyze your SBOM data',
      icon: BarChart3,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: () => navigate('/statistics'),
    },
    {
      title: 'Search',
      description: 'Find specific applications',
      icon: Search,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/applications'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.title}
            onClick={action.onClick}
            className={`
              ${action.color} ${action.hoverColor}
              text-white rounded-xl p-6 text-left transition-all
              hover:shadow-lg hover:scale-105 transform
            `}
          >
            <Icon className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
            <p className="text-sm text-white/90">{action.description}</p>
          </button>
        );
      })}
    </div>
  );
};