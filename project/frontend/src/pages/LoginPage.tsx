import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { 
  AlertCircle, 
  Shield, 
  Zap, 
  FileCheck, 
  Lock, 
  Search, 
  BarChart3,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Check for password reset token and redirect
  useEffect(() => {
    const token = searchParams.get('access_token') || 
                  searchParams.get('token') || 
                  searchParams.get('recovery_token');
    
    if (token) {
      navigate(`/reset-password?token=${token}`, { replace: true });
    }
  }, [searchParams, navigate]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setApiError('');
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      navigate('/dashboard');
      
    } catch (error: any) {
      let errorMsg = 'Invalid email or password. Please try again.';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (detail.message) {
          errorMsg = detail.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setApiError(errorMsg);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure SBOM Management',
      description: 'Enterprise-grade security for your software bills of materials'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Analysis',
      description: 'Powered by Anchore Syft for instant component detection'
    },
    {
      icon: FileCheck,
      title: 'Multi-Platform Support',
      description: 'iOS, Android, macOS, Windows, and Linux applications'
    },
    {
      icon: Search,
      title: 'Advanced Search & Filter',
      description: 'Find components, licenses, and dependencies instantly'
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Comprehensive insights into your software supply chain'
    },
    {
      icon: Lock,
      title: 'Compliance Ready',
      description: 'SPDX and CycloneDX format support for industry standards'
    }
  ];

  const highlights = [
    'Automated SBOM generation',
    'Component vulnerability tracking',
    'License compliance monitoring',
    'Export to industry standards',
    'Real-time dependency analysis',
    'Cloud-based storage'
  ];

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Features & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#5B6FB5] via-[#4A5FA4] to-[#3D4E8D] relative overflow-y-auto scrollbar-hide">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo & Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">BRIGHT AI SOLUTIONS</h1>
                <p className="text-sm text-white/80 font-medium">Transforming Ideas to AI Realities</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                  Welcome to<br />SBOM Manager
                </h2>
                <p className="text-lg text-white/90 leading-relaxed max-w-md">
                  Your comprehensive solution for software supply chain security and compliance
                </p>
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                {highlights.map((highlight, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/20"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-sm font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-base mb-1">{feature.title}</h3>
                <p className="text-sm text-white/80 leading-snug">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-white/20">
            <p className="text-sm text-white/70">
              Powered by Anchore Syft • Enterprise Security • Cloud Storage
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md my-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#5B6FB5] to-[#4A5FA4] rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">BRIGHT AI SOLUTIONS</h1>
                <p className="text-xs text-gray-600">SBOM Manager</p>
              </div>
            </div>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* API Error Alert */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Login Failed</p>
                      <p className="text-sm text-red-700 mt-1">{apiError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
                required
              />

              {/* Password */}
              <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
                required
              />

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#5B6FB5] focus:ring-[#5B6FB5] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#5B6FB5] hover:text-[#4A5FA4] font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#5B6FB5] to-[#4A5FA4] hover:from-[#4A5FA4] hover:to-[#3D4E8D] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center w-full px-6 py-3 border-2 border-[#5B6FB5] text-[#5B6FB5] font-semibold rounded-lg hover:bg-[#5B6FB5] hover:text-white transition-all duration-300"
              >
                Create New Account
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#5B6FB5] hover:underline font-medium">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#5B6FB5] hover:underline font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};