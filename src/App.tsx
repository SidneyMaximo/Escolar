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
import { AdminStudents } from '@/pages/admin/Students';
import { AdminTeachers } from '@/pages/admin/Teachers';
import { AdminClasses } from '@/pages/admin/Classes';
import { AdminGrades } from '@/pages/admin/Grades';
import { AdminEnrollments } from '@/pages/admin/Enrollments';
import { AdminUsers } from '@/pages/admin/Users';
import { AdminSettings } from '@/pages/admin/Settings';

// Teacher pages
import { TeacherDashboard } from '@/pages/teacher/Dashboard';
import { TeacherClasses } from '@/pages/teacher/Classes';
import { TeacherAttendance } from '@/pages/teacher/Attendance';
import { TeacherGrades } from '@/pages/teacher/Grades';
import { TeacherProjects } from '@/pages/teacher/Projects';
import { TeacherReportCards } from '@/pages/teacher/ReportCards';

// Parent pages
import { ParentDashboard } from '@/pages/parent/Dashboard';
import { ParentChildren } from '@/pages/parent/Children';
import { ParentProjects } from '@/pages/parent/Projects';
import { ParentReportCards } from '@/pages/parent/ReportCards';
import { ParentGrades } from '@/pages/parent/Grades';
import { ParentMessages } from '@/pages/parent/Messages';

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

          {/* Admin routes - Total liberdade de gerenciamento */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/alunos" element={<AdminStudents />} />
              <Route path="/admin/professores" element={<AdminTeachers />} />
              <Route path="/admin/turmas" element={<AdminClasses />} />
              <Route path="/admin/notas" element={<AdminGrades />} />
              <Route path="/admin/matriculas" element={<AdminEnrollments />} />
              <Route path="/admin/usuarios" element={<AdminUsers />} />
              <Route path="/admin/configuracoes" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Teacher routes - Acesso pertinente ao professor */}
          <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/professor" element={<TeacherDashboard />} />
              <Route path="/professor/turmas" element={<TeacherClasses />} />
              <Route path="/professor/frequencia" element={<TeacherAttendance />} />
              <Route path="/professor/notas" element={<TeacherGrades />} />
              <Route path="/professor/projetos" element={<TeacherProjects />} />
              <Route path="/professor/boletins" element={<TeacherReportCards />} />
            </Route>
          </Route>

          {/* Parent routes - Acesso às pastas e informações dos seus filhos */}
          <Route element={<ProtectedRoute allowedRoles={['parent', 'admin']} />}>
            <Route element={<ParentLayout />}>
              <Route path="/pais" element={<ParentDashboard />} />
              <Route path="/pais/filhos" element={<ParentChildren />} />
              <Route path="/pais/projetos" element={<ParentProjects />} />
              <Route path="/pais/boletins" element={<ParentReportCards />} />
              <Route path="/pais/notas" element={<ParentGrades />} />
              <Route path="/pais/mensagens" element={<ParentMessages />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}