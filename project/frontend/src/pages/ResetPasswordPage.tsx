import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Get token from URL (query params or hash fragment)
  const [token, setToken] = useState<string | null>(null);
  
useEffect(() => {
    // Log everything for debugging
    console.log('Full URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Search:', window.location.search);
    console.log('Hash:', window.location.hash);
    console.log('SearchParams:', Array.from(searchParams.entries()));
    
    // Check query parameters
    const queryToken = searchParams.get('token') || searchParams.get('access_token') || searchParams.get('recovery_token');
    
    if (queryToken) {
      setToken(queryToken);
      console.log('✅ Token found in query params:', queryToken);
      return;
    }
    
    // Check hash fragment (Supabase often uses this)
    const hash = window.location.hash.substring(1); // Remove the #
    console.log('Hash substring:', hash);
    
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      console.log('Hash params:', Array.from(hashParams.entries()));
      const hashToken = hashParams.get('access_token') || hashParams.get('token') || hashParams.get('recovery_token');
      
      if (hashToken) {
        setToken(hashToken);
        console.log('✅ Token found in hash:', hashToken);
        return;
      }
    }
    
    console.log('❌ No token found in URL');
  }, [searchParams]);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
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
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authService.resetPassword(token, formData.password);
      
      toast.success('Password reset successful!');
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Password reset failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set New Password
          </h1>
          <p className="text-gray-600">
            Please enter your new password
          </p>
          {!token && (
            <p className="text-sm text-red-600 mt-2">
              No reset token detected. Please check your email link.
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <PasswordInput
              label="New Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required
            />

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded ${
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
                  <span
                    className={
                      passwordStrength <= 2
                        ? 'text-red-600'
                        : passwordStrength === 3
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }
                  >
                    {passwordStrength <= 2
                      ? 'Weak'
                      : passwordStrength === 3
                      ? 'Medium'
                      : 'Strong'}
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
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!token}
              className="w-full"
            >
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};