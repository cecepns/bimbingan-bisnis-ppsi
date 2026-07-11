import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/guards/RouteGuards';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import MemberLayout from './components/layout/MemberLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMaterials from './pages/admin/AdminMaterials';
import AdminMembers from './pages/admin/AdminMembers';

// Member Pages
import MemberDashboard from './pages/member/MemberDashboard';
import MemberMaterials from './pages/member/MemberMaterials';
import MaterialDetailPage from './pages/member/MaterialDetailPage';
import MemberProgress from './pages/member/MemberProgress';
import MemberProfile from './pages/member/MemberProfile';

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-gray-100 bg-white text-gray-900 border dark:border-white/10 border-gray-200',
              style: {
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/materials" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminMaterials /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminMembers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/stats" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />

            {/* Member Routes */}
            <Route path="/member" element={<ProtectedRoute requireRole="member"><MemberLayout><MemberDashboard /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/materials" element={<ProtectedRoute requireRole="member"><MemberLayout><MemberMaterials /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/materials/:id" element={<ProtectedRoute requireRole="member"><MemberLayout><MaterialDetailPage /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/progress" element={<ProtectedRoute requireRole="member"><MemberLayout><MemberProgress /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/profile" element={<ProtectedRoute requireRole="member"><MemberLayout><MemberProfile /></MemberLayout></ProtectedRoute>} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
