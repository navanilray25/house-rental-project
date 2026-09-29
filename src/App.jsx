import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getHouseSettings } from './services/dataService';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Route Guard for Student (Only accessible by logged-in students)
function StudentRoute({ houseSettings }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar activeHouseName={houseSettings?.houseName} />
      <main className="flex-1 pb-16">
        <StudentDashboard houseSettings={houseSettings} />
      </main>
      <AppFooter houseSettings={houseSettings} />
    </div>
  );
}

// Route Guard for Admin (Only accessible by logged-in admins via /admin)
function AdminRoute({ houseSettings, onSettingsUpdated }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar activeHouseName={houseSettings?.houseName} />
      <main className="flex-1 pb-16">
        <AdminDashboard
          houseSettings={houseSettings}
          onSettingsUpdated={onSettingsUpdated}
        />
      </main>
      <AppFooter houseSettings={houseSettings} />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-300">Loading Rental System...</p>
    </div>
  );
}

function AppFooter({ houseSettings }) {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <strong>{houseSettings?.houseName || 'Student House Rental Service'}</strong> • Powered by React & Supabase
        </div>
        <div className="flex items-center gap-3">
          <span>Room Allocation</span>
          <span>•</span>
          <span>Electricity Meter Calculations</span>
          <span>•</span>
          <span>Official Receipts</span>
        </div>
      </div>
    </footer>
  );
}

function MainApp() {
  const [houseSettings, setHouseSettings] = useState(null);

  async function loadSettings() {
    try {
      const settings = await getHouseSettings();
      setHouseSettings(settings);
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<StudentRoute houseSettings={houseSettings} />} />
        <Route path="/login" element={<Login houseSettings={houseSettings} />} />
        <Route path="/register" element={<Register houseSettings={houseSettings} />} />

        {/* Dedicated Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute
              houseSettings={houseSettings}
              onSettingsUpdated={loadSettings}
            />
          }
        />
        <Route path="/admin/login" element={<AdminLogin houseSettings={houseSettings} />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
