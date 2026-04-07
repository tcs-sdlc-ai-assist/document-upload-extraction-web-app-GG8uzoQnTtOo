import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import LoginComponent from '@/components/auth/LoginComponent';
import SignupComponent from '@/components/auth/SignupComponent';
import { APP_NAME } from '@/constants';

type AuthView = 'login' | 'signup';

const AuthPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useSession();
  const [currentView, setCurrentView] = useState<AuthView>('login');

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-neutral-50"
        role="status"
        aria-label="Loading authentication"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600 tracking-tight">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Document Processing &amp; Extraction
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 animate-fade-in">
          {currentView === 'login' ? (
            <LoginComponent onSwitchToSignup={() => setCurrentView('signup')} />
          ) : (
            <SignupComponent onSwitchToLogin={() => setCurrentView('login')} />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          All data is stored locally in your browser.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;