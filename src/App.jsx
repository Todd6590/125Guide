import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import SSOGate from '@/components/SSOGate';
import SSOLogin from '@/pages/SSOLogin';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import CreatePlan from '@/pages/CreatePlan';
import ViewPlan from '@/pages/ViewPlan';
import EditPlan from '@/pages/EditPlan';
import Clients from '@/pages/Clients';
import ComplianceReview from '@/pages/ComplianceReview';
import Profile from '@/pages/Profile';
import AdminDashboard from '@/pages/AdminDashboard';
import PlansManagement from '@/pages/PlansManagement';
import NondiscriminationTesting from '@/pages/NondiscriminationTesting';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/sso-login" element={<SSOLogin />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route element={<SSOGate />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreatePlan />} />
          <Route path="/plan/:id" element={<ViewPlan />} />
          <Route path="/edit/:id" element={<EditPlan />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/compliance" element={<ComplianceReview />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/plans" element={<PlansManagement />} />
          <Route path="/ndt" element={<NondiscriminationTesting />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App