import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/authContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/notes');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
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
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-white" style={{ fontFamily: 'Caveat, cursive' }}>
            PENDOWN
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-600 transition text-sm"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-600 transition text-sm"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-600 transition"
              placeholder="johndoe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-600 transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-600 transition"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50 mt-6"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-zinc-900 dark:text-white hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
