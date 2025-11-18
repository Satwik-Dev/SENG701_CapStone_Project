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

      // Poll for completion status before allowing navigation
      pollUploadStatus(response.application_id);

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Upload failed';
      toast.error(errorMessage);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Poll upload status until complete
  const pollUploadStatus = async (appId: string) => {
    const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const status = await uploadService.getUploadStatus(appId);
        
        if (status.status === 'completed') {
          toast.success('SBOM generation completed!');
          return true;
        } else if (status.status === 'failed') {
          toast.error(`Processing failed: ${status.error_message}`);
          return true;
        }
        
        return false; // Still processing
      } catch (error) {
        return false;
      }
    };

    const interval = setInterval(async () => {
      attempts++;
      const isDone = await checkStatus();
      
      if (isDone || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds
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
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload
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
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-primary-600">
                          Uploading
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-primary-600">
                          {uploadProgress}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                      <div
                        style={{ width: `${uploadProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* File Type Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Supported File Types
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Mobile:</span> .apk, .ipa
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Desktop:</span> .exe, .app
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Linux:</span> .deb, .rpm
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Archives:</span> .zip, .tar
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  <span className="font-medium">Maximum file size: </span> {maxFileSize / (1024 * 1024)}MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
              <div className="flex items-center justify-center mb-6">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Upload Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your file has been uploaded and SBOM generation is in progress.
                This may take a few minutes depending on the file size.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/applications')}
                >
                  View All Applications
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  Upload Another
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};