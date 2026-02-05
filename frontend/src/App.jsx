import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './services/authContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotesList from './pages/NotesList';
import NoteForm from './pages/NoteForm';
import PrivateRoute from './components/PrivateRoute';
import Snackbar from './components/Snackbar';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/notes"
                element={
                  <PrivateRoute>
                    <NotesList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notes/new"
                element={
                  <PrivateRoute>
                    <NoteForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notes/:id/edit"
                element={
                  <PrivateRoute>
                    <NoteForm />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            </BrowserRouter>
            <Snackbar />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
