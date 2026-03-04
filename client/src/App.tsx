import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Notifications } from './pages/Notifications';
import { UserRole } from './types';

// Clinician pages
import {
  ClinicianDashboard,
  PatientSearch,
  PatientProfile,
  NewConsultation,
  ConsultationSuccess,
  ConsultationDetail as ClinicianConsultationDetail,
  AllConsultations,
} from './pages/clinician';

// Specialist pages
import {
  SpecialistDashboard,
  CreateDischargeProfile,
  RespondToConsultation,
  DischargeProfileView,
} from './pages/specialist';

// Admin pages
import { AdminDashboard, UserManagement, FacilityManagement, ReportsAnalytics, ExecutiveDashboard } from './pages/admin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Redirect based on user role
const RoleBasedRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case UserRole.CLINICIAN:
      return <Navigate to="/clinician" replace />;
    case UserRole.SPECIALIST:
      return <Navigate to="/specialist" replace />;
    case UserRole.ADMINISTRATOR:
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* Notifications (all authenticated users) */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Clinician routes */}
      <Route
        path="/clinician"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CLINICIAN]}>
            <ClinicianDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinician/search"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CLINICIAN]}>
            <PatientSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinician/patient/:code"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CLINICIAN]}>
            <PatientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinician/consultation/new/:patientId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CLINICIAN]}>
            <NewConsultation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinician/consultation/success"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CLINICIAN]}>
            <ConsultationSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinician/consultation/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CLINICIAN]}>
            <ClinicianConsultationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinician/consultations"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CLINICIAN]}>
            <AllConsultations />
          </ProtectedRoute>
        }
      />

      {/* Specialist routes */}
      <Route
        path="/specialist"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SPECIALIST]}>
            <SpecialistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/specialist/discharge/new"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SPECIALIST]}>
            <CreateDischargeProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/specialist/consultation/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SPECIALIST]}>
            <RespondToConsultation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/specialist/consultation/:id/respond"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SPECIALIST]}>
            <RespondToConsultation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/specialist/patient/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SPECIALIST]}>
            <DischargeProfileView />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMINISTRATOR]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMINISTRATOR]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/facilities"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMINISTRATOR]}>
            <FacilityManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMINISTRATOR]}>
            <ReportsAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/executive"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMINISTRATOR]}>
            <ExecutiveDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
