import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { CheckCircle2, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('🔍 Full URL:', window.location.href);
    console.log('🔍 Hash:', window.location.hash);
    
    // Extract token from URL hash
    const hash = window.location.hash.substring(1);
    
    if (hash) {
      console.log('📍 Parsing hash:', hash);
      const hashParams = new URLSearchParams(hash);
      
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      console.log('🔑 Access Token:', accessToken);
      console.log('📋 Type:', type);
      
      if (accessToken && type === 'recovery') {
        setToken(accessToken);
        console.log('✅ Valid recovery token found!');
        
        // Clean the URL
        window.history.replaceState(null, '', window.location.pathname);
      } else {
        console.log('❌ Invalid token or type');
      }
    } else {
      // Check query parameters as fallback
      const searchParams = new URLSearchParams(window.location.search);
      const queryToken = searchParams.get('access_token') || searchParams.get('token');
      
      if (queryToken) {
        console.log('✅ Token found in query params');
        setToken(queryToken);
      } else {
        console.log('❌ No token found');
      }
    }
  }, [location]);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Password requirement checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordChecks.length) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!passwordChecks.uppercase) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!passwordChecks.lowercase) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!passwordChecks.number) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing. Please request a new password reset.');
      navigate('/forgot-password');
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('🔄 Attempting password reset...');
      console.log('📧 Email:', formData.email);
      console.log('🔑 Token:', token.substring(0, 20) + '...');
      
      await authService.resetPassword(formData.email, token, formData.password);
      
      toast.success('Password reset successful!');
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      const errorMessage = err.response?.data?.detail || 'Password reset failed. The link may have expired.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // If no token, show error
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/forgot-password')}
              className="w-full"
            >
              Request New Reset Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Password Reset Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            Your password has been updated. You can now log in with your new password.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  // Check if form is valid
  const isFormValid = 
    formData.email &&
    /\S+@\S+\.\S+/.test(formData.email) &&
    formData.password && 
    formData.confirmPassword && 
    formData.password === formData.confirmPassword &&
    passwordChecks.length && 
    passwordChecks.uppercase && 
    passwordChecks.lowercase && 
    passwordChecks.number;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your email and create a new password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              helperText="Enter the email you used to request password reset"
              required
            />

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Password must contain:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      passwordChecks.length ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {passwordChecks.length && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${
                      passwordChecks.length ? 'text-green-700 font-medium' : 'text-gray-600'
                    }`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      passwordChecks.uppercase ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {passwordChecks.uppercase && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${
                      passwordChecks.uppercase ? 'text-green-700 font-medium' : 'text-gray-600'
                    }`}>
                      One uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      passwordChecks.lowercase ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {passwordChecks.lowercase && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${
                      passwordChecks.lowercase ? 'text-green-700 font-medium' : 'text-gray-600'
                    }`}>
                      One lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      passwordChecks.number ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {passwordChecks.number && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${
                      passwordChecks.number ? 'text-green-700 font-medium' : 'text-gray-600'
                    }`}>
                      One number (0-9)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* New Password */}
            <PasswordInput
              label="New Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            {/* Password Strength */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded transition-colors ${
                        passwordStrength >= level
                          ? passwordStrength <= 2
                            ? 'bg-red-500'
                            : passwordStrength === 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  Password strength:{' '}
                  <span className={`font-medium ${
                    passwordStrength <= 2 ? 'text-red-600' :
                    passwordStrength === 3 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {passwordStrength <= 2 ? 'Weak' :
                     passwordStrength === 3 ? 'Medium' : 'Strong'}
                  </span>
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!isFormValid}
              className="w-full mt-6"
            >
              Reset Password
            </Button>

            {/* Helper text */}
            {!isFormValid && (formData.email || formData.password || formData.confirmPassword) && (
              <p className="text-sm text-gray-500 text-center mt-3">
                {!formData.email || !/\S+@\S+\.\S+/.test(formData.email)
                  ? 'Please enter a valid email address'
                  : !passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.lowercase || !passwordChecks.number
                  ? 'Please meet all password requirements'
                  : formData.password !== formData.confirmPassword
                  ? 'Passwords do not match'
                  : 'Fill in all fields to continue'}
              </p>
            )}
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            
            <a href="/login"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};