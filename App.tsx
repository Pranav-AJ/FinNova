import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/chatContext';
import { StockProvider } from './context/StockContext';

// Components
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import StockAnalysis from './components/StockAnalysis';
import ChatBot from './components/ChatBot';
import Login from './components/Login';

// Types
import { AppRoute } from './types';

// Protected Route Wrapper: Redirects to Login if no user session exists
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    // Optional: Render a loading spinner while checking auth status
    return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    // 1. AuthProvider: Handles Login/Logout and User User
    <AuthProvider>
      {/* 2. ChatProvider: Keeps the AI conversation alive across pages */}
      <ChatProvider>
        {/* 3. StockProvider: Keeps the Market Analysis data alive across pages */}
        <StockProvider>
          <Router>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path={AppRoute.DASHBOARD} element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={AppRoute.EXPENSES} element={
                <ProtectedRoute>
                  <Layout>
                    <ExpenseTracker />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={AppRoute.STOCKS} element={
                <ProtectedRoute>
                  <Layout>
                    <StockAnalysis />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={AppRoute.CHAT} element={
                <ProtectedRoute>
                  <Layout>
                    <ChatBot />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to={AppRoute.DASHBOARD} replace />} />
            </Routes>
          </Router>
        </StockProvider>
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;