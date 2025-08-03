import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import PaymentSuccess from './pages/PaymentSuccess';
import Expenses from './pages/Expenses';
import Broadcast from './pages/Broadcast';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/broadcast"
              element={
                <ProtectedRoute>
                  <Broadcast />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            
            {/* Placeholder routes for other pages */}
            <Route
              path="/payment-types"
              element={
                <ProtectedRoute>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900">Jenis Pembayaran</h1>
                    <p className="text-gray-600 mt-2">Halaman ini sedang dalam pengembangan</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reminders"
              element={
                <ProtectedRoute>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900">Pengingat</h1>
                    <p className="text-gray-600 mt-2">Halaman ini sedang dalam pengembangan</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/whatsapp-logs"
              element={
                <ProtectedRoute>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900">Riwayat WhatsApp</h1>
                    <p className="text-gray-600 mt-2">Halaman ini sedang dalam pengembangan</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
                    <p className="text-gray-600 mt-2">Halaman ini sedang dalam pengembangan</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
