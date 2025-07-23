import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Shield, LogOut } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = false }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is not required, always show children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If auth is required but user is not authenticated, show login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 dark:from-orange-800 dark:via-red-800 dark:to-yellow-800 text-white py-8 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Admin Access Required</h1>
            </div>
            <p className="text-lg opacity-90">Please sign in with Google to access the admin panel</p>
          </div>
        </div>
        
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#ea580c',
                      brandAccent: '#dc2626',
                    },
                  },
                },
                className: {
                  container: isDarkMode ? 'dark' : '',
                },
              }}
              providers={['google']}
              onlyThirdPartyProviders
              redirectTo={`${window.location.origin}/admin`}
            />
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/'}
              className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
            >
              ← Back to main page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show children with sign out option
  return (
    <div className="relative">
      
      {children}
    </div>
  );
};