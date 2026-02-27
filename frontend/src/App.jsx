import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import PullRequests from './pages/PullRequests';
import PullRequestDetail from './pages/PullRequestDetail';
import ReviewResults from './pages/ReviewResults';
import Search from './pages/Search';
import ReviewHistory from './pages/ReviewHistory';
import ReviewDetailById from './pages/ReviewDetailById';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Documentation from './pages/Documentation';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/pull-requests" element={<PullRequests />} />
            <Route path="/pull-requests/:owner/:repo" element={<PullRequests />} />
            <Route path="/pull-requests/:owner/:repo/:prNumber" element={<PullRequestDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/review-results" element={<ReviewResults />} />
            <Route path="/reviews" element={<ReviewHistory />} />
            <Route path="/reviews/:id" element={<ReviewDetailById />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/docs" element={<Documentation />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
