import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { ParentLayout } from '@/components/layout/ParentLayout';

// Shared
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

// Public pages
import { Home } from '@/pages/public/Home';
import { About } from '@/pages/public/About';
import { Methodology } from '@/pages/public/Methodology';
import { Team } from '@/pages/public/Team';
import { Gallery } from '@/pages/public/Gallery';
import { Testimonials } from '@/pages/public/Testimonials';
import { FAQ } from '@/pages/public/FAQ';
import { Contact } from '@/pages/public/Contact';
import { Enrollment } from '@/pages/public/Enrollment';
import { Reenrollment } from '@/pages/public/Reenrollment';

// Auth pages
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';

// Admin pages
import { AdminDashboard } from '@/pages/admin/Dashboard';

// Teacher pages
import { TeacherDashboard } from '@/pages/teacher/Dashboard';

// Parent pages
import { ParentDashboard } from '@/pages/parent/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/metodologia" element={<Methodology />} />
            <Route path="/equipe" element={<Team />} />
            <Route path="/galeria" element={<Gallery />} />
            <Route path="/depoimentos" element={<Testimonials />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/matricula" element={<Enrollment />} />
            <Route path="/rematricula" element={<Reenrollment />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/entrar" element={<Login />} />
            <Route path="/cadastrar" element={<Signup />} />
            <Route path="/recuperar-senha" element={<ForgotPassword />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              {/* TODO: Add admin sub-routes (Students, Teachers, Classes, etc.) */}
            </Route>
          </Route>

          {/* Teacher routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/professor" element={<TeacherDashboard />} />
              {/* TODO: Add teacher sub-routes */}
            </Route>
          </Route>

          {/* Parent routes */}
          <Route element={<ProtectedRoute allowedRoles={['parent', 'admin']} />}>
            <Route element={<ParentLayout />}>
              <Route path="/pais" element={<ParentDashboard />} />
              {/* TODO: Add parent sub-routes */}
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}