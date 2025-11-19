import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Search, 
  Trash2, 
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  X
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { SearchAutocomplete } from '../components/common/SearchAutocomplete';
import { applicationService } from '../services/applicationService';
import { useDebounce } from '../hooks/useDebounce';
import type { Application } from '../types/application';
import toast from 'react-hot-toast';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [binaryTypeFilter, setBinaryTypeFilter] = useState<string>('');
  
  // New state for fuzzy search
  const [searchSuggestions, setSearchSuggestions] = useState<Application[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchApplications = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    
    try {
      const data = await applicationService.getApplications({
        page,
        limit: 10,
        platform: platformFilter || undefined,
        status: statusFilter || undefined,
        binary_type: binaryTypeFilter || undefined,
      });

      setApplications(data.items);
      setTotalPages(data.total_pages);
    } catch (error: any) {
      if (!silent) {
        toast.error('Failed to load applications');
      }
      console.error(error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Fuzzy search function with LOWER threshold for partial matching
  const performFuzzySearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchSuggestions([]);
      setIsSearchActive(false);
      return;
    }

    setSearchLoading(true);
    setIsSearchActive(true);
    try {
      // Using threshold of 50 for more lenient partial matching
      const data = await applicationService.searchApplications(query, 10, 50);
      setSearchSuggestions(data.items);
    } catch (error: any) {
      console.error('Search failed:', error);
      setSearchSuggestions([]);
      // Don't show error toast for search failures, just log it
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(false);
    
    const interval = setInterval(() => {
      fetchApplications(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [page, platformFilter, statusFilter, binaryTypeFilter]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.trim().length >= 2) {
      performFuzzySearch(debouncedSearchQuery);
    } else {
      // When search is cleared or too short, reset to regular list
      setSearchSuggestions([]);
      setIsSearchActive(false);
    }
  }, [debouncedSearchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await applicationService.deleteApplication(id);
      toast.success('Application deleted successfully');
      
      // Refresh both lists
      fetchApplications();
      if (isSearchActive && debouncedSearchQuery) {
        performFuzzySearch(debouncedSearchQuery);
      }
    } catch (error) {
      toast.error('Failed to delete application');
    }
  };

  // Handle selecting an application from suggestions
  const handleSelectApplication = (app: Application) => {
    navigate(`/applications/${app.id}`);
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    // If search is being cleared, immediately reset search state
    if (!query || query.trim().length === 0) {
      setSearchSuggestions([]);
      setIsSearchActive(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlatformBadge = (platform?: string) => {
    if (!platform || platform === 'unknown') return null;

    const colors = {
      android: 'bg-green-100 text-green-800',
      ios: 'bg-blue-100 text-blue-800',
      windows: 'bg-sky-100 text-sky-800',
      macos: 'bg-gray-100 text-gray-800',
      linux: 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[platform as keyof typeof colors]}`}>
        {platform.toUpperCase()}
      </span>
    );
  };

  const getBinaryTypeBadge = (binaryType?: string) => {
    if (!binaryType || binaryType === 'unknown') return null;

    const colors = {
      mobile: 'bg-purple-100 text-purple-800',
      desktop: 'bg-indigo-100 text-indigo-800',
      server: 'bg-teal-100 text-teal-800',
      container: 'bg-cyan-100 text-cyan-800',
      library: 'bg-pink-100 text-pink-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[binaryType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {binaryType.charAt(0).toUpperCase() + binaryType.slice(1)}
      </span>
    );
  };

  // FIXED: Better logic for determining which applications to display
  const getDisplayedApplications = () => {
    // If search is active (user typed >= 2 chars), show search results
    if (isSearchActive && searchQuery.trim().length >= 2) {
      return searchSuggestions;
    }
    
    // Otherwise, show regular applications list
    return applications;
  };

  const filteredApplications = getDisplayedApplications();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
            <p className="text-gray-600">
              Manage your uploaded applications and SBOMs
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/upload')}>
            <Upload className="w-5 h-5 mr-2" />
            Upload New
          </Button>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Fuzzy Search with Autocomplete */}
            <SearchAutocomplete
              onSearch={handleSearchChange}
              onSelectApplication={handleSelectApplication}
              suggestions={searchSuggestions}
              loading={searchLoading}
              placeholder="Search applications..."
              className="md:col-span-1"
            />

            {/* Platform Filter */}
            <select
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">All Platforms</option>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="windows">Windows</option>
              <option value="macos">macOS</option>
              <option value="linux">Linux</option>
            </select>

            {/* Binary Type Filter */}
            <select
              value={binaryTypeFilter}
              onChange={(e) => {
                setBinaryTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">All Types</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="server">Server</option>
              <option value="container">Container</option>
              <option value="library">Library</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Active Search Indicator */}
        {isSearchActive && searchQuery && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Searching for: <span className="font-semibold">"{searchQuery}"</span>
                {searchSuggestions.length > 0 && (
                  <span className="ml-2">
                    ({searchSuggestions.length} result{searchSuggestions.length !== 1 ? 's' : ''})
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => handleSearchChange('')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear Search
            </button>
          </div>
        )}

        {/* Results Section */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isSearchActive ? 'No matching applications found' : 'No applications found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isSearchActive 
                ? `No applications match "${searchQuery}". Try adjusting your search query or filters.`
                : 'Upload your first application to generate an SBOM'
              }
            </p>
            {isSearchActive ? (
              <Button variant="secondary" onClick={() => handleSearchChange('')}>
                Clear Search
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate('/upload')}>
                <Upload className="w-5 h-5 mr-2" />
                Upload Application
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Application
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Platform/Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      Components
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      Size
                    </th>
                    {isSearchActive && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Match
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-start flex-col">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {app.name}
                          </div>
                          {app.version && (
                            <div className="text-xs text-gray-500 mt-1">
                              v{app.version}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {getPlatformBadge(app.platform)}
                          {getBinaryTypeBadge(app.binary_type)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {app.component_count || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatFileSize(app.file_size)}
                      </td>
                      {isSearchActive && (
                        <td className="px-4 py-3">
                          {app.similarity_score !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${
                                app.similarity_score >= 90 ? 'text-green-600' :
                                app.similarity_score >= 75 ? 'text-blue-600' :
                                app.similarity_score >= 50 ? 'text-yellow-600' :
                                'text-gray-600'
                              }`}>
                                {app.similarity_score.toFixed(0)}%
                              </span>
                              {app.match_field && (
                                <span className="text-xs text-gray-400">
                                  ({app.match_field})
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(app.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/applications/${app.id}`)}
                            className="text-primary-600 hover:text-primary-900 p-2 rounded-lg hover:bg-primary-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id, app.name)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - Only show when not searching */}
            {!isSearchActive && totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="secondary"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{page}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};