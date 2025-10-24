import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  Package, 
  FileCode,
  Shield,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/common/Button';
import { applicationService } from '../services/applicationService';
import type { ApplicationDetail, Component } from '../types/application';
import toast from 'react-hot-toast';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'components' | 'sbom' | 'info'>('components');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch application details
  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await applicationService.getApplication(id);
      setApplication(data);
    } catch (error: any) {
      toast.error('Failed to load application details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Export SBOM
  const handleExport = async (format: 'cyclonedx' | 'spdx') => {
    if (!id) return;
    
    try {
      const data = await applicationService.exportSBOM(id, format);
      
      // Create download
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${application?.name || 'sbom'}-${format}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`SBOM exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export SBOM');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Filter components
  const filteredComponents = application?.components.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.version?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.license?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };

    const icons = {
      completed: <CheckCircle className="w-4 h-4" />,
      processing: <Loader2 className="w-4 h-4 animate-spin" />,
      failed: <XCircle className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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

  if (!application) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Application not found</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/applications')}
              className="mt-4"
            >
              Back to Applications
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/applications')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Applications
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {application.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(application.status)}
                {application.platform && application.platform !== 'unknown' && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {application.platform.toUpperCase()}
                  </span>
                )}
                {application.version && (
                  <span className="text-gray-600 text-sm">
                    Version {application.version}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => handleExport('cyclonedx')}
                disabled={application.status !== 'completed'}
              >
                <Download className="w-4 h-4 mr-2" />
                CycloneDX
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleExport('spdx')}
                disabled={application.status !== 'completed'}
              >
                <Download className="w-4 h-4 mr-2" />
                SPDX
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Components</p>
                <p className="text-2xl font-bold text-gray-900">
                  {application.component_count}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">File Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(application.file_size)}
                </p>
              </div>
              <FileCode className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unique Licenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(application.components.map(c => c.license).filter(Boolean)).size}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Analyzed</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.analyzed_at 
                    ? formatDate(application.analyzed_at) 
                    : 'Processing...'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('components')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'components'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Components ({application.component_count})
              </button>
              <button
                onClick={() => setActiveTab('sbom')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'sbom'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Raw SBOM
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'info'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Information
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Components Tab */}
            {activeTab === 'components' && (
              <div>
                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search components by name, version, or license..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Components Table */}
                {filteredComponents.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      {searchTerm ? 'No components match your search' : 'No components found'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Component
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Version
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            License
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Language
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredComponents.map((component) => (
                          <tr key={component.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {component.name}
                              </div>
                              {component.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {component.description.substring(0, 60)}
                                  {component.description.length > 60 && '...'}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {component.version || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {component.type || '-'}
                            </td>
                            <td className="px-4 py-3">
                              {component.license ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {component.license}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {component.language || '-'}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              <div className="flex items-center justify-end gap-2">
                                {component.purl && (
                                  <button
                                    onClick={() => copyToClipboard(component.purl!)}
                                    className="text-gray-400 hover:text-gray-600"
                                    title="Copy PURL"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                )}
                                {component.homepage && (
                                  
                                  <a href={component.homepage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-800"
                                    title="Visit homepage"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SBOM Tab */}
            {activeTab === 'sbom' && (
              <div>
                {application.sbom_data ? (
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(application.sbom_data, null, 2))}
                      className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{JSON.stringify(application.sbom_data, null, 2)}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileCode className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">SBOM data not available</p>
                  </div>
                )}
              </div>
            )}

            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">File Name</h3>
                    <p className="text-sm text-gray-900">{application.original_filename}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">File Hash</h3>
                    <p className="text-sm text-gray-900 font-mono">
                      {application.file_hash?.substring(0, 16)}...
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Created At</h3>
                    <p className="text-sm text-gray-900">{formatDate(application.created_at)}</p>
                  </div>
                  {application.analyzed_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Analyzed At</h3>
                      <p className="text-sm text-gray-900">{formatDate(application.analyzed_at)}</p>
                    </div>
                  )}
                  {application.supplier && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Supplier</h3>
                      <p className="text-sm text-gray-900">{application.supplier}</p>
                    </div>
                  )}
                  {application.sbom_format && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">SBOM Format</h3>
                      <p className="text-sm text-gray-900">{application.sbom_format.toUpperCase()}</p>
                    </div>
                  )}
                </div>

                {application.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-800 mb-2">Error Message</h3>
                    <p className="text-sm text-red-700">{application.error_message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};