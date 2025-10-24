import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileUp, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/common/Button';
import toast from 'react-hot-toast';
import { uploadService } from '../services/uploadService';
import type { UploadResponse } from '../services/uploadService';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedAppId, setUploadedAppId] = useState<string | null>(null);

  // Supported file types
  const acceptedTypes = [
    '.apk', '.ipa', '.exe', '.app', '.deb', '.rpm',
    '.zip', '.tar', '.tar.gz', '.tgz'
  ];

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`;
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const isValidType = acceptedTypes.some(type => fileName.endsWith(type));
    
    if (!isValidType) {
      return `Invalid file type. Supported: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    
    if (error) {
      toast.error(error);
      return;
    }

    setFile(selectedFile);
    setUploadComplete(false);
  };

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const response: UploadResponse = await uploadService.uploadFile(
        file,
        (progress) => setUploadProgress(progress)
      );

      setUploadedAppId(response.application_id);
      setUploadComplete(true);
      toast.success('File uploaded successfully! SBOM generation in progress...');

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Upload failed';
      toast.error(errorMessage);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setUploadComplete(false);
    setUploadProgress(0);
    setUploadedAppId(null);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    const iconClass = "text-6xl";
    
    if (ext === 'apk') return <span className={iconClass}>📱</span>;
    if (ext === 'ipa') return <span className={iconClass}>🍎</span>;
    if (ext === 'exe') return <span className={iconClass}>💻</span>;
    if (ext === 'zip' || ext === 'tar' || ext === 'tgz') return <span className={iconClass}>📦</span>;
    return <span className={iconClass}>📄</span>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Application
          </h1>
          <p className="text-gray-600">
            Upload your application to generate a Software Bill of Materials (SBOM)
          </p>
        </div>

        {!uploadComplete ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              {/* File Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-3 border-dashed rounded-xl p-12 text-center transition-all duration-200
                  ${isDragging 
                    ? 'border-primary-500 bg-primary-50' 
                    : file 
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }
                `}
              >
                {!file ? (
                  <>
                    <FileUp className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Drop your file here
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      or click to browse
                    </p>
                    <input
                      type="file"
                      onChange={handleFileInputChange}
                      accept={acceptedTypes.join(',')}
                      className="hidden"
                      id="file-input"
                    />
                    <label 
                      htmlFor="file-input"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all cursor-pointer shadow-md hover:shadow-lg"
                    >
                      <Upload className="w-5 h-5" />
                      Choose File
                    </label>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      {getFileIcon(file.name)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {formatFileSize(file.size)}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button variant="primary" onClick={handleUpload} disabled={uploading}>
                        {uploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Uploading... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Upload & Analyze
                          </>
                        )}
                      </Button>
                      <Button variant="secondary" onClick={handleReset} disabled={uploading}>
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* File Type Info */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">
                      Supported File Types
                    </h4>
                    <p className="text-sm text-blue-800">
                      <strong>Mobile:</strong> .apk (Android), .ipa (iOS)
                      <br />
                      <strong>Desktop:</strong> .exe (Windows), .app (macOS), .deb/.rpm (Linux)
                      <br />
                      <strong>Source Code:</strong> .zip, .tar, .tar.gz
                      <br />
                      <strong>Maximum size:</strong> 50MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your file has been uploaded and SBOM generation is in progress.
                <br />
                This may take a few moments depending on the file size.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="primary" 
                  onClick={() => navigate(`/applications/${uploadedAppId}`)}
                >
                  View Application
                </Button>
                <Button variant="secondary" onClick={() => navigate('/applications')}>
                  View All Applications
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  Upload Another File
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};