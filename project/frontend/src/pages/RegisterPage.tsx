import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { 
  AlertCircle, 
  CheckCircle2,
  Shield, 
  Zap, 
  FileCheck, 
  Lock, 
  Search, 
  BarChart3,
  Sparkles,
  Check
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    setShowSuccess(false);
    
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      });
      
      setShowSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      let errorMsg = 'Registration failed. Please try again.';
      
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

  const benefits = [
    'Automated SBOM generation in seconds',
    'Component vulnerability tracking',
    'License compliance monitoring',
    'Export to industry standard formats',
    'Real-time dependency analysis',
    'Secure cloud-based storage'
  ];

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { label: '', color: '', width: '0%' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (strength <= 3) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = passwordStrength();

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
                  Start Your Journey<br />with SBOM Manager
                </h2>
                <p className="text-lg text-white/90 leading-relaxed max-w-md">
                  Join organizations securing their software supply chain with our comprehensive SBOM solution
                </p>
              </div>

              {/* Key Benefits */}
              <div className="space-y-3 mt-8">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/20"
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
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

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto scrollbar-hide">
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

          {/* Register Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Start managing your SBOMs today</p>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">Registration Successful!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Please check your email to verify your account. Redirecting to login...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* API Error Alert */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Registration Failed</p>
                      <p className="text-sm text-red-700 mt-1">{apiError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <Input
                label="Full Name"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                error={errors.full_name}
                autoComplete="name"
                required
              />

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
              <div>
                <PasswordInput
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="new-password"
                  required
                />
                
                {/* Password Requirements - Shows when typing */}
                {formData.password && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Password Requirements:</p>
                    <ul className="space-y-1.5">
                      <li className={`text-xs flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-600'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.password.length >= 8 ? 'bg-green-100' : 'bg-gray-200'}`}>
                          {formData.password.length >= 8 ? '✓' : '○'}
                        </span>
                        At least 8 characters
                      </li>
                      <li className={`text-xs flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(formData.password) ? 'bg-green-100' : 'bg-gray-200'}`}>
                          {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        One uppercase letter
                      </li>
                      <li className={`text-xs flex items-center gap-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${/[a-z]/.test(formData.password) ? 'bg-green-100' : 'bg-gray-200'}`}>
                          {/[a-z]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        One lowercase letter
                      </li>
                      <li className={`text-xs flex items-center gap-2 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${/\d/.test(formData.password) ? 'bg-green-100' : 'bg-gray-200'}`}>
                          {/\d/.test(formData.password) ? '✓' : '○'}
                        </span>
                        One number
                      </li>
                      <li className={`text-xs flex items-center gap-2 ${/[^a-zA-Z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${/[^a-zA-Z0-9]/.test(formData.password) ? 'bg-green-100' : 'bg-gray-200'}`}>
                          {/[^a-zA-Z0-9]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        One special character
                      </li>
                    </ul>
                  </div>
                )}
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password strength:</span>
                      <span className={`text-xs font-medium ${
                        strength.label === 'Weak' ? 'text-red-600' :
                        strength.label === 'Medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: strength.width }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />

              {/* Terms & Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-[#5B6FB5] focus:ring-[#5B6FB5] border-gray-300 rounded mt-1"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-[#5B6FB5] hover:text-[#4A5FA4] font-medium">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-[#5B6FB5] hover:text-[#4A5FA4] font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading || showSuccess}
                className="w-full bg-gradient-to-r from-[#5B6FB5] to-[#4A5FA4] hover:from-[#4A5FA4] hover:to-[#3D4E8D] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 border-2 border-[#5B6FB5] text-[#5B6FB5] font-semibold rounded-lg hover:bg-[#5B6FB5] hover:text-white transition-all duration-300"
              >
                Sign In Instead
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-[#5B6FB5] hover:underline font-medium">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-[#5B6FB5] hover:underline font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};