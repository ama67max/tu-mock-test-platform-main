import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-loaded page components for route-level code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ExamListPage = lazy(() => import('./pages/ExamListPage'));
const ExamPage = lazy(() => import('./pages/ExamPage'));
const ResultPage = lazy(() => import('./pages/ResultPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const VagueGrid = lazy(() => import('./pages/VagueGrid'));

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminExams = lazy(() => import('./pages/AdminExams'));
const AdminExamEditor = lazy(() => import('./pages/AdminExamEditor'));
const AdminQuestions = lazy(() => import('./pages/AdminQuestions'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const IndexedDBDemo = lazy(() => import('./pages/IndexedDBDemo'));
const OfflineDemo = lazy(() => import('./pages/OfflineDemo'));
const VerifyPhonePage = lazy(() => import('./pages/VerifyPhonePage'));

function PageLoader() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background text-primary">
      <LoadingSpinner size="lg" label="Loading page resources..." />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public routes ───────────────────────────── */}
        <Route element={<StudentLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-phone" element={<VerifyPhonePage />} />
          <Route path="/demo/indexeddb" element={<IndexedDBDemo />} />
          <Route path="/demo/offline" element={<OfflineDemo />} />
          <Route path="/vague-grid" element={<VagueGrid />} />

          {/* ── Student-protected routes ─────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/exams" element={<ExamListPage />} />
            <Route path="/exams/:examId" element={<ExamPage />} />
            <Route path="/results/:attemptId" element={<ResultPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leaderboard/:examId" element={<LeaderboardPage />} />
          </Route>
        </Route>

        {/* ── Admin routes ─────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="exams/:examId/edit" element={<AdminExamEditor />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="iddb" element={<IndexedDBDemo />} />
          <Route path="dbdemo" element={<OfflineDemo />} />
        </Route>

        {/* ── Fallback ──────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;