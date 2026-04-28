import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../controllers/useAuth';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      
      // Refresh user profile in context and then redirect
      refreshUser()
        .then((userData) => {
          if (userData && userData.role === 'student' && !userData.grade) {
            navigate('/profile-setup');
          } else if (userData && userData.role === 'tutor') {
            if (userData.verificationStatus === 'not_created') {
              navigate('/tutor-onboarding');
            } else if (userData.verificationStatus === 'approved') {
              navigate('/dashboard');
            } else {
              navigate('/tutor-pending');
            }
          } else {
            navigate('/dashboard');
          }
        })
        .catch(() => {
          navigate('/login?error=auth_failed');
        });
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authenticating...</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Finishing your sign-in process.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
