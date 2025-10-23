import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { CheckCircle2, Check, AlertCircle } from 'lucide-react';
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
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  
  useEffect(() => {
    // Get email from sessionStorage (set in ForgotPasswordPage)
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      console.log('✅ Email found:', storedEmail);
    } else {
      console.log('❌ No email found in sessionStorage');
    }

    // Extract token from URL
    const extractToken = () => {
      // Check query parameters
      const queryToken = searchParams.get('token');
      if (queryToken) {
        setToken(queryToken);
        console.log('✅ Token found in query:', queryToken);
        return;
      }
      
      // Check hash fragment
      const hash = window.location.hash.substring(1);
      if (hash) {
        console.log('Hash found:', hash);
        const hashParams = new URLSearchParams(hash);
        const hashToken = hashParams.get('access_token') || hashParams.get('token');
        
        if (hashToken) {
          setToken(hashToken);
          console.log('✅ Token found in hash:', hashToken);
          // Clean URL
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          console.log('❌ No token in hash');
        }
      } else {
        console.log('❌ No hash in URL');
      }
    };
    
    extractToken();
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

  // Password requirement checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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
      return;
    }

    if (!email) {
      toast.error('Email is missing. Please request a new password reset.');
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authService.resetPassword(email, token, formData.password);
      
      // Clear the stored email
      sessionStorage.removeItem('resetEmail');
      
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

  // Check if button should be enabled
  const isFormValid = token && email && formData.password && formData.confirmPassword && 
                      formData.password === formData.confirmPassword &&
                      passwordChecks.length && passwordChecks.uppercase && 
                      passwordChecks.lowercase && passwordChecks.number;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Password
          </h1>
          <p className="text-gray-600">
            {email ? `Resetting password for ${email}` : 'Enter your new password below'}
          </p>
          
          {/* Debug Info - Remove this after testing */}
          {(!token || !email) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Missing Information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {!token && <li>Reset token not found</li>}
                    {!email && <li>Email not found (did you come from forgot password page?)</li>}
                  </ul>
                  <p className="mt-2">Please go back to the <a href="/forgot-password" className="underline font-medium">Forgot Password</a> page and try again.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Requirements */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Password must contain:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordChecks.length ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {passwordChecks.length && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${
                    passwordChecks.length ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordChecks.uppercase ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {passwordChecks.uppercase && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${
                    passwordChecks.uppercase ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    One uppercase letter (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordChecks.lowercase ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {passwordChecks.lowercase && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${
                    passwordChecks.lowercase ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    One lowercase letter (a-z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordChecks.number ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {passwordChecks.number && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${
                    passwordChecks.number ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    One number (0-9)
                  </span>
                </div>
              </div>
            </div>

            {/* Password */}
            <PasswordInput
              label="New Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
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
                        ? 'text-red-600 font-medium'
                        : passwordStrength === 3
                        ? 'text-yellow-600 font-medium'
                        : 'text-green-600 font-medium'
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
              error={errors.confirmPassword}
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!isFormValid}
              className="w-full"
            >
              Reset Password
            </Button>

            {/* Helper text when button is disabled */}
            {!isFormValid && (formData.password || formData.confirmPassword) && (
              <p className="text-sm text-gray-500 text-center">
                {!token || !email 
                  ? 'Missing reset token or email. Please request a new password reset.'
                  : !passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.lowercase || !passwordChecks.number
                  ? 'Please meet all password requirements'
                  : formData.password !== formData.confirmPassword
                  ? 'Passwords do not match'
                  : 'Fill in all fields to continue'}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};