import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/authContext.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;
