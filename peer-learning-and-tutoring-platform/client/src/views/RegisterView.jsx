import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthViewModel } from '../viewmodels/AuthViewModel';
import { qaForumSupportedGrades } from '../data/qaData';

const RegisterView = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, getDashboardRoute } = useAuthViewModel();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    profile: {
      firstName: '',
      lastName: '',
      grade: '',
      school: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (formData.role === 'tutor' && !formData.profile.grade) {
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          grade: '8'
        }
      }));
    }
  }, [formData.role, formData.profile.grade]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }
    
    // Validate required fields
    const missingFields = [];
    if (!formData.username.trim()) missingFields.push('Username');
    if (!formData.email.trim()) missingFields.push('Email');
    if (!formData.password.trim()) missingFields.push('Password');
    if (!formData.profile.firstName.trim()) missingFields.push('First Name');
    if (!formData.profile.lastName.trim()) missingFields.push('Last Name');
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    const { confirmPassword, ...registrationData } = formData;
    if (registrationData.profile?.grade === '') {
      delete registrationData.profile.grade;
    }
    const result = await register(registrationData);
    console.log('RegisterView: Registration result:', result);
    
    if (result.success) {
      navigate(getDashboardRoute(), { replace: true });
    }
  };

  const isFormValid = () => {
    return (
      formData.username &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.profile.firstName &&
      formData.profile.lastName &&
      formData.password === formData.confirmPassword
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="profile.firstName"
                  type="text"
                  required
                  className="input-field mt-1"
                  value={formData.profile.firstName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="profile.lastName"
                  type="text"
                  required
                  className="input-field mt-1"
                  value={formData.profile.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field mt-1"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field mt-1"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <select
                id="role"
                name="role"
                required
                className="input-field mt-1"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {(formData.role === 'student' || formData.role === 'tutor' || formData.role === 'parent') && (
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                  {formData.role === 'tutor' ? 'Assigned Grade' : formData.role === 'parent' ? 'Child Grade' : 'Grade'}
                </label>
                <select
                  id="grade"
                  name="profile.grade"
                  className="input-field mt-1"
                  value={formData.profile.grade}
                  onChange={handleChange}
                >
                  <option value="">Select Grade</option>
                  {qaForumSupportedGrades.map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
                {formData.role === 'tutor' && (
                  <p className="mt-2 text-xs text-gray-500">
                    Tutors can currently be assigned to Grades 6, 8, or 9 for the Q&A workflow.
                  </p>
                )}
              </div>
            )}

            {formData.role !== 'admin' && (
              <>
                <div>
                  <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                    School (Optional)
                  </label>
                  <input
                    id="school"
                    name="profile.school"
                    type="text"
                    className="input-field mt-1"
                    value={formData.profile.school}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="phone"
                    name="profile.phone"
                    type="tel"
                    className="input-field mt-1"
                    value={formData.profile.phone}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field mt-1"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input-field mt-1"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {formData.password !== formData.confirmPassword && formData.confirmPassword && (
              <div className="text-red-600 text-sm">
                Passwords do not match
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterView;
