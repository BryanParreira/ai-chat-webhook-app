import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState('idle'); // idle, loading, success, error

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let error = null;
    if (field === 'email') {
      error = validateEmail(formData.email);
    } else if (field === 'password') {
      error = validatePassword(formData.password);
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleLogin = async () => {
    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    setErrors({
      email: emailError,
      password: passwordError,
    });
    
    setTouched({
      email: true,
      password: true,
    });

    if (emailError || passwordError) {
      return;
    }

    setIsLoading(true);
    setLoginStatus('loading');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure (you can change this for testing)
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setLoginStatus('success');
        // Handle successful login here
        console.log('Login successful!', formData);
      } else {
        setLoginStatus('error');
        setErrors({ general: 'Invalid email or password. Please try again.' });
      }
    } catch (error) {
      setLoginStatus('error');
      setErrors({ general: 'Login failed. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
      if (loginStatus !== 'success') {
        setTimeout(() => setLoginStatus('idle'), 3000);
      }
    }
  };

  const getStatusColor = () => {
    switch (loginStatus) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'loading': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (loginStatus) {
      case 'success': return 'Login Successful!';
      case 'error': return 'Login Failed';
      case 'loading': return 'Authenticating...';
      default: return 'Ready to Login';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">
            Welcome Back
          </h1>
          <p className="text-gray-400 font-mono">
            Sign in to your account
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold font-mono">Status:</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                loginStatus === 'success' ? 'bg-green-500' : 
                loginStatus === 'error' ? 'bg-red-500' : 
                loginStatus === 'loading' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
              <span className={`font-semibold font-mono ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2 font-mono">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  touched.email && errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                autoComplete="email"
              />
            </div>
            {touched.email && errors.email && (
              <p className="mt-2 text-red-400 text-sm font-mono">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2 font-mono">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  touched.password && errors.password ? 'border-red-500' : 'border-gray-600'
                }`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="mt-2 text-red-400 text-sm font-mono">{errors.password}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm font-mono">{errors.general}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 font-mono flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <button className="text-blue-400 hover:text-blue-300 text-sm font-mono transition duration-200">
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white font-bold mb-3 font-mono">Need Help?</h3>
          <p className="text-gray-400 text-sm font-mono mb-4">
            Having trouble signing in? Make sure you're using the correct email address and password.
          </p>
          <div className="space-y-2">
            <div className="text-xs font-mono text-gray-500">
              Demo credentials (for testing):
            </div>
            <div className="bg-gray-700 p-3 rounded text-xs font-mono text-gray-300 border border-gray-600">
              Email: demo@example.com<br />
              Password: demo123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}