import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SBOM Manager</h1>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome, {user?.full_name || user?.email}! 👋
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              You are successfully logged in to SBOM Manager.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a placeholder dashboard. 
                We'll build the full dashboard with file upload, SBOM viewing, 
                and statistics in the upcoming days.
              </p>
            </div>

            {/* User Info Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Your Account</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Email:</span> {user?.email}</p>
                <p><span className="text-gray-600">Name:</span> {user?.full_name || 'Not set'}</p>
                <p>
                  <span className="text-gray-600">Verified:</span>{' '}
                  <span className={user?.is_verified ? 'text-green-600' : 'text-red-600'}>
                    {user?.is_verified ? '✓ Yes' : '✗ No'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};