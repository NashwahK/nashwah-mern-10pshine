import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setMessage('Check your email for password reset instructions');
      setSubmitted(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-950 px-4 transition-colors duration-300">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-zinc-800 shadow-lg hover:shadow-xl transition-all border border-zinc-200 dark:border-zinc-700"
      >
        {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-zinc-700" />}
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 space-y-6 border border-zinc-200 dark:border-zinc-700">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Enter your email to receive reset instructions
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm animate-pulse">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition duration-200 transform hover:scale-105"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center space-y-3">
              <p className="text-green-700 dark:text-green-400 font-semibold">{message}</p>
              <p className="text-sm text-gray-600 dark:text-zinc-400">Redirecting to login...</p>
            </div>
          )}

          <div className="text-center pt-4 border-t border-gray-200 dark:border-zinc-700">
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
