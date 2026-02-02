import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 px-4 transition-colors duration-300">
        <button
          onClick={toggleTheme}
          className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-zinc-800 shadow-lg hover:shadow-xl transition-all border border-zinc-200 dark:border-zinc-700"
        >
          {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-zinc-700" />}
        </button>

        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 text-center border border-zinc-200 dark:border-zinc-700">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Invalid Reset Link</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">This password reset link is invalid or has expired.</p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium py-2 px-6 rounded-lg transition"
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 px-4 transition-colors duration-300">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-zinc-800 shadow-lg hover:shadow-xl transition-all border border-zinc-200 dark:border-zinc-700"
      >
        {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-zinc-700" />}
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 space-y-6 border border-zinc-200 dark:border-zinc-700">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Create New Password
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Enter a new password for your account
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm animate-pulse">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500 transition bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500 transition bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-900 font-medium py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center space-y-3">
              <p className="text-green-700 dark:text-green-400 font-semibold">Password reset successfully!</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Redirecting to login in 3 seconds...</p>
            </div>
          )}

          <div className="text-center pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-zinc-900 dark:text-white hover:underline font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
