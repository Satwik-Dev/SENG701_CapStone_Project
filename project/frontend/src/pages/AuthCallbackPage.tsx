import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Verifying your reset link...');
        
        // Get the hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Callback params:', { 
          type, 
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken 
        });

        if (type === 'recovery' && accessToken && refreshToken) {
          setStatus('Setting up your session...');
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw new Error('Failed to establish session');
          }

          if (!data.session) {
            throw new Error('No session created');
          }

          console.log('Session established successfully:', data.session.user.email);
          setStatus('Redirecting to password reset...');

          await new Promise(resolve => setTimeout(resolve, 500));

          navigate('/reset-password', { replace: true });
          return;
        }

        // Handle other auth types
        if (type === 'signup' && accessToken) {
          setStatus('Email confirmed! Redirecting...');
          if (refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
          }
          await new Promise(resolve => setTimeout(resolve, 500));
          navigate('/dashboard', { replace: true });
          return;
        }

        // No valid recovery params
        throw new Error('Invalid authentication link');

      } catch (err: any) {
        console.error('Callback handling error:', err);
        setError(err.message || 'An error occurred during authentication');
        setTimeout(() => navigate('/forgot-password'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Failed</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <p className="text-gray-500 text-xs">Redirecting back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B6FB5] mx-auto mb-4"></div>
        <p className="text-gray-700 text-lg font-medium mb-2">{status}</p>
        <p className="text-gray-500 text-sm">Please wait, this may take a few seconds...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;