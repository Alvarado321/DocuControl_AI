import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MLProvider } from './context/MLContext';

// Components
import Layout from './components/common/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Trámites Pages
import TramitesPage from './pages/tramites/TramitesPage';
import TramiteDetailPage from './pages/tramites/TramiteDetailPage';
import SolicitarTramitePage from './pages/tramites/SolicitarTramitePage';

// Solicitudes Pages
import SolicitudesPage from './pages/solicitudes/SolicitudesPage';
import SolicitudDetailPage from './pages/solicitudes/SolicitudDetailPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <MLProvider>
              <div className="App">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route 
                      path="dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                      {/* Trámites routes */}
                    <Route 
                      path="tramites" 
                      element={
                        <ProtectedRoute>
                          <TramitesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="tramites/:id" 
                      element={
                        <ProtectedRoute>
                          <TramiteDetailPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="tramites/:id/solicitar" 
                      element={
                        <ProtectedRoute>
                          <SolicitarTramitePage />
                        </ProtectedRoute>
                      } 
                    />
                      {/* Solicitudes routes */}
                    <Route 
                      path="solicitudes" 
                      element={
                        <ProtectedRoute>
                          <SolicitudesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="solicitudes/:id" 
                      element={
                        <ProtectedRoute>
                          <SolicitudDetailPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Other placeholder routes */}
                    <Route 
                      path="documentos" 
                      element={
                        <ProtectedRoute>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold">Documentos</h1>
                            <p>Página en desarrollo...</p>
                          </div>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="ml" 
                      element={
                        <ProtectedRoute>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold">Análisis ML</h1>
                            <p>Página en desarrollo...</p>
                          </div>
                        </ProtectedRoute>
                      } 
                    />
                  </Route>

                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                
                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </MLProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
