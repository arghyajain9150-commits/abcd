import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/store.js';
import { getMe } from './api/index.js';
import { connectSocket, disconnectSocket } from './socket/socket.js';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AppShell from './pages/AppShell.jsx';
import HomePage from './pages/HomePage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import PharmacyPortal from './pages/PharmacyPortal.jsx';
import StubPage from './pages/StubPage.jsx';
import SupportPage from './pages/SupportPage.jsx';
import { HeartPulse } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

function AuthRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  return !token ? children : <Navigate to="/" replace />;
}

function AuthBootstrap() {
  const { token, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    getMe()
      .then((res) => {
        setUser(res.data);
        connectSocket(res.data.id);
      })
      .catch(() => {
        logout();
      });

    return () => disconnectSocket();
  }, [token]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap />
        <Routes>
          <Route path="/login"    element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="pharmacy"     element={<PharmacyPortal />} />
            <Route
              path="wellness"
              element={
                <StubPage
                  icon={HeartPulse}
                  title="Wellness & Counselling"
                  desc="Book confidential sessions with campus counsellors and psychologists."
                />
              }
            />
            <Route path="support" element={<SupportPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
