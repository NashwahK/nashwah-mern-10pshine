import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { Sun, Moon, Mail, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 px-4 transition-colors duration-300">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-zinc-800 shadow-lg hover:shadow-xl transition-all border border-zinc-200 dark:border-zinc-700"
      >
        {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-zinc-700" />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-6xl font-bold mb-2 text-zinc-900 dark:text-white" style={{ fontFamily: 'Caveat, cursive' }}>
            PENDOWN
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">Reset your password</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 animate-fade-in">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm animate-pulse">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-600 transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? 'Sending...' : (
                  <>
                    Send Reset Link
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center space-y-3">
              <p className="text-green-700 dark:text-green-400 font-medium">{message}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Redirecting to login...</p>
            </div>
          )}

          <div className="flex justify-between items-center text-sm text-zinc-600 dark:text-zinc-400 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Link to="/login" className="hover:text-zinc-900 dark:hover:text-white transition">
              Back to login
            </Link>
            <span>•</span>
            <Link to="/register" className="text-zinc-900 dark:text-white hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
