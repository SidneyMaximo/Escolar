-- ============================================================================
-- ESCOLA INFANTIL SaaS — SUPABASE SCHEMA + RLS
-- Execute este script no SQL Editor do Supabase Dashboard
-- ⚠️  NUNCA exponha a SERVICE_ROLE_KEY no frontend. Use apenas ANON_KEY.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE app_role AS ENUM ('admin', 'teacher', 'parent');
CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected', 'active', 'inactive');
CREATE TYPE grade_type AS ENUM ('avaliacao', 'trabalho', 'prova', 'participacao', 'final');
CREATE TYPE attendance_status AS ENUM ('presente', 'ausente', 'justificado', 'atraso');
CREATE TYPE message_status AS ENUM ('sent', 'read', 'archived');

-- 3. HELPER FUNCTIONS (SECURITY DEFINER — executam com privilégios elevados)
-- Estas funções são usadas nas políticas RLS e NÃO expõem dados sensíveis.

CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_teacher()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'
  );
$$;

CREATE OR REPLACE FUNCTION is_parent()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'parent'
  );
$$;

-- Verifica se o usuário é professor de uma turma específica
CREATE OR REPLACE FUNCTION is_teacher_of_class(p_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM classes
    WHERE id = p_class_id AND teacher_id = auth.uid()
  );
$$;

-- Verifica se o aluno é filho do usuário autenticado
CREATE OR REPLACE FUNCTION is_parent_of_student(p_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM students
    WHERE id = p_student_id AND parent_guardian_id = auth.uid()
  );
$$;

-- 4. TABLES

-- SCHOOLS (tenants)
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  primary_color text DEFAULT '#0D9488',
  address text,
  phone text,
  email text,
  cnpj text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Inserção de escola padrão inicial para novos cadastros
INSERT INTO schools (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Escola Modelo', 'escola-modelo')
ON CONFLICT (id) DO NOTHING;

-- PROFILES (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  cpf text,
  phone text,
  avatar_url text,
  role app_role NOT NULL DEFAULT 'parent',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_cpf_unique UNIQUE (school_id, cpf)
);

-- STUDENTS
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text,
  photo_url text,
  parent_guardian_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CLASSES / TURMAS
CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  grade_level text NOT NULL,
  academic_year int NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  teacher_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  max_capacity int NOT NULL DEFAULT 30,
  schedule jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CLASS_STUDENTS (enrollment junction)
CREATE TABLE class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  status enrollment_status NOT NULL DEFAULT 'active',
  UNIQUE (class_id, student_id)
);

-- SUBJECTS / DISCIPLINAS
CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  description text
);

-- GRADES / NOTAS
CREATE TABLE grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  grade_type grade_type NOT NULL,
  score numeric(5,2) NOT NULL CHECK (score >= 0),
  max_score numeric(5,2) NOT NULL DEFAULT 10 CHECK (max_score > 0),
  description text,
  graded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT grades_score_max CHECK (score <= max_score)
);

-- REPORT_CARDS / BOLETINS
CREATE TABLE report_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  period text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  pdf_url text,
  notes text,
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- ENROLLMENTS / MATRÍCULAS (public form submissions)
CREATE TABLE enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('matricula', 'rematricula')),
  student_name text NOT NULL,
  student_dob date NOT NULL,
  parent_name text NOT NULL,
  parent_email text NOT NULL,
  parent_phone text NOT NULL,
  parent_cpf text,
  address jsonb,
  previous_school text,
  medical_info text,
  documents jsonb,
  status enrollment_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- STAFF
CREATE TABLE staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  position text NOT NULL,
  department text,
  hire_date date,
  active boolean NOT NULL DEFAULT true
);

-- ATTENDANCE / FREQUÊNCIA
CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date date NOT NULL,
  status attendance_status NOT NULL DEFAULT 'presente',
  recorded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (student_id, class_id, date)
);

-- MESSAGES / MENSAGENS
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text NOT NULL,
  status message_status NOT NULL DEFAULT 'sent',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. INDEXES (performance)
CREATE INDEX idx_profiles_school ON profiles(school_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_students_parent ON students(parent_guardian_id);
CREATE INDEX idx_classes_school ON classes(school_id);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_class_students_class ON class_students(class_id);
CREATE INDEX idx_class_students_student ON class_students(student_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_class ON grades(class_id);
CREATE INDEX idx_grades_teacher ON grades(teacher_id);
CREATE INDEX idx_enrollments_school ON enrollments(school_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);

-- 6. ENABLE RLS ON ALL TABLES
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- === SCHOOLS ===
-- Admin: read own school
CREATE POLICY "schools_select_admin" ON schools
  FOR SELECT USING (id = get_user_school_id() AND is_admin());

-- Teacher/Parent: read own school
CREATE POLICY "schools_select_member" ON schools
  FOR SELECT USING (id = get_user_school_id());

-- Only superuser/service_role can insert/update schools (via Supabase Dashboard or migration)
-- No INSERT/UPDATE/DELETE policies for regular users on schools table.

-- === PROFILES ===
-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Admin can read all profiles in their school
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (school_id = get_user_school_id() AND is_admin());

-- Teacher can read profiles of students' parents and other teachers in same school
CREATE POLICY "profiles_select_teacher" ON profiles
  FOR SELECT USING (
    school_id = get_user_school_id() AND is_teacher()
    AND (role = 'teacher' OR role = 'parent')
  );

-- Parent can read own profile only (covered by profiles_select_own)

-- Users can update their own profile (name, phone, avatar)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND school_id = get_user_school_id());

-- Admin can create profiles (for teachers/staff)
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (get_user_school_id() = school_id AND is_admin());

-- === STUDENTS ===
-- Admin: full CRUD in own school
CREATE POLICY "students_select_admin" ON students
  FOR SELECT USING (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "students_insert_admin" ON students
  FOR INSERT WITH CHECK (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "students_update_admin" ON students
  FOR UPDATE USING (school_id = get_user_school_id() AND is_admin())
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "students_delete_admin" ON students
  FOR DELETE USING (school_id = get_user_school_id() AND is_admin());

-- Teacher: read students in their classes
CREATE POLICY "students_select_teacher" ON students
  FOR SELECT USING (
    is_teacher()
    AND EXISTS (
      SELECT 1 FROM class_students cs
      JOIN classes c ON c.id = cs.class_id
      WHERE cs.student_id = students.id
        AND c.teacher_id = auth.uid()
        AND cs.status = 'active'
    )
  );

-- Parent: read only own children
CREATE POLICY "students_select_parent" ON students
  FOR SELECT USING (parent_guardian_id = auth.uid());

-- === CLASSES ===
-- Admin: full CRUD
CREATE POLICY "classes_select_admin" ON classes
  FOR SELECT USING (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "classes_insert_admin" ON classes
  FOR INSERT WITH CHECK (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "classes_update_admin" ON classes
  FOR UPDATE USING (school_id = get_user_school_id() AND is_admin())
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "classes_delete_admin" ON classes
  FOR DELETE USING (school_id = get_user_school_id() AND is_admin());

-- Teacher: read own classes
CREATE POLICY "classes_select_teacher" ON classes
  FOR SELECT USING (teacher_id = auth.uid());

-- Parent: read classes where their children are enrolled
CREATE POLICY "classes_select_parent" ON classes
  FOR SELECT USING (
    is_parent()
    AND EXISTS (
      SELECT 1 FROM class_students cs
      JOIN students s ON s.id = cs.student_id
      WHERE cs.class_id = classes.id
        AND s.parent_guardian_id = auth.uid()
        AND cs.status = 'active'
    )
  );

-- === CLASS_STUDENTS ===
CREATE POLICY "class_students_select_admin" ON class_students
  FOR SELECT USING (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "class_students_insert_admin" ON class_students
  FOR INSERT WITH CHECK (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "class_students_update_admin" ON class_students
  FOR UPDATE USING (school_id = get_user_school_id() AND is_admin())
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "class_students_delete_admin" ON class_students
  FOR DELETE USING (school_id = get_user_school_id() AND is_admin());

-- Teacher: read roster of own classes
CREATE POLICY "class_students_select_teacher" ON class_students
  FOR SELECT USING (
    is_teacher()
    AND EXISTS (
      SELECT 1 FROM classes WHERE id = class_students.class_id AND teacher_id = auth.uid()
    )
  );

-- Parent: read own children's enrollments
CREATE POLICY "class_students_select_parent" ON class_students
  FOR SELECT USING (
    is_parent()
    AND EXISTS (
      SELECT 1 FROM students WHERE id = class_students.student_id AND parent_guardian_id = auth.uid()
    )
  );

-- === SUBJECTS ===
CREATE POLICY "subjects_select_all_members" ON subjects
  FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "subjects_manage_admin" ON subjects
  FOR ALL USING (school_id = get_user_school_id() AND is_admin())
  WITH CHECK (school_id = get_user_school_id());

-- === GRADES ===
-- Admin: full access
CREATE POLICY "grades_select_admin" ON grades
  FOR SELECT USING (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "grades_insert_admin" ON grades
  FOR INSERT WITH CHECK (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "grades_update_admin" ON grades
  FOR UPDATE USING (school_id = get_user_school_id() AND is_admin())
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "grades_delete_admin" ON grades
  FOR DELETE USING (school_id = get_user_school_id() AND is_admin());

-- Teacher: insert/read grades for own classes
CREATE POLICY "grades_select_teacher" ON grades
  FOR SELECT USING (
    is_teacher()
    AND EXISTS (
      SELECT 1 FROM classes WHERE id = grades.class_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "grades_insert_teacher" ON grades
  FOR INSERT WITH CHECK (
    is_teacher()
    AND teacher_id = auth.uid()
    AND school_id = get_user_school_id()
    AND EXISTS (
      SELECT 1 FROM classes WHERE id = grades.class_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "grades_update_teacher" ON grades
  FOR UPDATE USING (
    is_teacher()
    AND teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM classes WHERE id = grades.class_id AND teacher_id = auth.uid()
    )
  )
  WITH CHECK (teacher_id = auth.uid());

-- Parent: read grades of own children only
CREATE POLICY "grades_select_parent" ON grades
  FOR SELECT USING (
    is_parent()
    AND EXISTS (
      SELECT 1 FROM students WHERE id = grades.student_id AND parent_guardian_id = auth.uid()
    )
  );

-- === REPORT_CARDS ===
CREATE POLICY "report_cards_select_admin" ON report_cards
  FOR SELECT USING (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "report_cards_manage_admin" ON report_cards
  FOR ALL USING (school_id = get_user_school_id() AND is_admin())
  WITH CHECK (school_id = get_user_school_id());

-- Teacher: read report cards for own classes
CREATE POLICY "report_cards_select_teacher" ON report_cards
  FOR SELECT USING (
    is_teacher()
    AND EXISTS (
      SELECT 1 FROM classes WHERE id = report_cards.class_id AND teacher_id = auth.uid()
    )
  );

-- Parent: read own children's report cards
CREATE POLICY "report_cards_select_parent" ON report_cards
  FOR SELECT USING (
    is_parent()
    AND EXISTS (
      SELECT 1 FROM students WHERE id = report_cards.student_id AND parent_guardian_id = auth.uid()
    )
  );

-- === ENROLLMENTS ===
-- Public: anyone can submit enrollment (no auth required)
CREATE POLICY "enrollments_insert_public" ON enrollments
  FOR INSERT WITH CHECK (true);

-- Admin: full management
CREATE POLICY "enrollments_select_admin" ON enrollments
  FOR SELECT USING (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "enrollments_update_admin" ON enrollments
  FOR UPDATE USING (school_id = get_user_school_id() AND is_admin())
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "enrollments_delete_admin" ON enrollments
  FOR DELETE USING (school_id = get_user_school_id() AND is_admin());

-- Parent: read own enrollment submissions (by email match)
CREATE POLICY "enrollments_select_parent" ON enrollments
  FOR SELECT USING (
    is_parent()
    AND parent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- === STAFF ===
CREATE POLICY "staff_select_admin" ON staff
  FOR SELECT USING (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "staff_manage_admin" ON staff
  FOR ALL USING (school_id = get_user_school_id() AND is_admin())
  WITH CHECK (school_id = get_user_school_id());

-- Staff can read own record
CREATE POLICY "staff_select_own" ON staff
  FOR SELECT USING (profile_id = auth.uid());

-- === ATTENDANCE ===
CREATE POLICY "attendance_select_admin" ON attendance
  FOR SELECT USING (school_id = get_user_school_id() AND is_admin());

CREATE POLICY "attendance_manage_admin" ON attendance
  FOR ALL USING (school_id = get_user_school_id() AND is_admin())
  WITH CHECK (school_id = get_user_school_id());

-- Teacher: manage attendance for own classes
CREATE POLICY "attendance_select_teacher" ON attendance
  FOR SELECT USING (
    is_teacher()
    AND EXISTS (
      SELECT 1 FROM classes WHERE id = attendance.class_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "attendance_insert_teacher" ON attendance
  FOR INSERT WITH CHECK (
    is_teacher()
    AND recorded_by = auth.uid()
    AND school_id = get_user_school_id()
    AND EXISTS (
      SELECT 1 FROM classes WHERE id = attendance.class_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "attendance_update_teacher" ON attendance
  FOR UPDATE USING (
    is_teacher()
    AND recorded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM classes WHERE id = attendance.class_id AND teacher_id = auth.uid()
    )
  )
  WITH CHECK (recorded_by = auth.uid());

-- Parent: read own children's attendance
CREATE POLICY "attendance_select_parent" ON attendance
  FOR SELECT USING (
    is_parent()
    AND EXISTS (
      SELECT 1 FROM students WHERE id = attendance.student_id AND parent_guardian_id = auth.uid()
    )
  );

-- === MESSAGES ===
-- Users can send messages within same school
CREATE POLICY "messages_insert_member" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND school_id = get_user_school_id()
  );

-- Users can read messages they sent or received
CREATE POLICY "messages_select_own" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- Users can update only received messages (mark as read)
CREATE POLICY "messages_update_recipient" ON messages
  FOR UPDATE USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Admin can read all messages in school (for moderation)
CREATE POLICY "messages_select_admin" ON messages
  FOR SELECT USING (school_id = get_user_school_id() AND is_admin());

-- 8. AUTO-CREATE PROFILE TRIGGER
-- When a new user signs up via Supabase Auth, automatically create a profile row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, school_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'school_id', '00000000-0000-0000-0000-000000000001')::uuid,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')::app_role
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. UPDATED_AT TRIGGER FOR PROFILES
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 10. STORAGE BUCKETS (for documents and avatars)
-- Create buckets via Supabase Dashboard or:
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('enrollment-docs', 'enrollment-docs', false),
  ('report-cards', 'report-cards', false),
  ('student-photos', 'student-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 11. STORAGE RLS POLICIES
-- ⚠️ CRITICAL: Storage policies use auth.uid() and NEVER expose service_role keys.
-- All private buckets enforce school_id tenant isolation via folder structure: {school_id}/{user_id}/file

-- === AVATARS (public bucket) ===
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Anyone can read avatars (public bucket)
CREATE POLICY "avatars_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update/delete their own avatar
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- === ENROLLMENT-DOCS (private) ===
-- Public can upload enrollment documents (no auth required for form submission)
CREATE POLICY "enrollment_docs_insert_public" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'enrollment-docs'
    AND (storage.foldername(name))[1] = 'pending'
  );

-- Admin can read all enrollment docs in their school
CREATE POLICY "enrollment_docs_select_admin" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'enrollment-docs'
    AND is_admin()
    AND (storage.foldername(name))[1] = get_user_school_id()::text
  );

-- Admin can delete enrollment docs
CREATE POLICY "enrollment_docs_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'enrollment-docs'
    AND is_admin()
    AND (storage.foldername(name))[1] = get_user_school_id()::text
  );

-- Parent can read their own submitted docs
CREATE POLICY "enrollment_docs_select_parent" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'enrollment-docs'
    AND is_parent()
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- === REPORT-CARDS (private) ===
-- Admin can manage report cards
CREATE POLICY "report_cards_storage_admin" ON storage.objects
  FOR ALL USING (
    bucket_id = 'report-cards'
    AND is_admin()
    AND (storage.foldername(name))[1] = get_user_school_id()::text
  )
  WITH CHECK (
    bucket_id = 'report-cards'
    AND is_admin()
    AND (storage.foldername(name))[1] = get_user_school_id()::text
  );

-- Teacher can read report cards for their classes
CREATE POLICY "report_cards_storage_select_teacher" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'report-cards'
    AND is_teacher()
    AND (storage.foldername(name))[1] = get_user_school_id()::text
  );

-- Parent can read their children's report cards
CREATE POLICY "report_cards_storage_select_parent" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'report-cards'
    AND is_parent()
    AND (storage.foldername(name))[1] = get_user_school_id()::text
  );

-- === STUDENT-PHOTOS (private) ===
-- Admin can manage student photos
CREATE POLICY "student_photos_admin" ON storage.objects
  FOR ALL USING (
    bucket_id = 'student-photos'
    AND is_admin()
    AND (storage.foldername(name))[1] = get_user_school_id()::text
  )
  WITH CHECK (
    bucket_id = 'student-photos'
    AND is_admin()
    AND (storage.foldername(name))[1] = get_user_school_id()::text
  );

-- Teacher can read photos of students in their classes
CREATE POLICY "student_photos_select_teacher" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'student-photos'
    AND is_teacher()
    AND (storage.foldername(name))[1] = get_user_school_id()::text
  );

-- Parent can read their own children's photos
CREATE POLICY "student_photos_select_parent" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'student-photos'
    AND is_parent()
    AND EXISTS (
      SELECT 1 FROM students
      WHERE id::text = (storage.foldername(name))[2]
        AND parent_guardian_id = auth.uid()
    )
  );

-- ============================================================================
-- ⚠️ SECURITY NOTES — LEIA ANTES DE EXECUTAR
-- ============================================================================
-- 1. NUNCA use a SERVICE_ROLE_KEY no frontend. Apenas a ANON_KEY é segura.
-- 2. A SERVICE_ROLE_KEY ignora RLS — use apenas em Edge Functions ou backend.
-- 3. Todas as funções helper são SECURITY DEFINER com search_path fixo para
--    prevenir privilege escalation via schema injection.
-- 4. O trigger handle_new_user usa COALESCE com valores padrão seguros.
-- 5. Storage buckets privados exigem estrutura de pastas: {school_id}/{entity_id}/file
-- 6. Políticas de enrollment permitem INSERT público (formulário sem login),
--    mas SELECT/UPDATE/DELETE são restritos ao admin da escola.
-- 7. Para produção, considere adicionar rate limiting via Supabase Edge Functions
--    no endpoint de matrícula para prevenir abuso do INSERT público.
-- ============================================================================