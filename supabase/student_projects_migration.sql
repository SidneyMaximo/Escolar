-- ============================================================================
-- TABELA: student_projects (Pastas de Fotos, Eventos e Projetos da Criança)
-- Permite que o professor compartilhe fotos, projetos e boletins com o aluno/turma
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'projeto', -- 'projeto', 'evento', 'atividades', 'boletim'
  media_urls text[] DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_projects_class ON student_projects(class_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_student ON student_projects(student_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_teacher ON student_projects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_school ON student_projects(school_id);

ALTER TABLE student_projects ENABLE ROW LEVEL SECURITY;

-- 1. Admin tem acesso completo
CREATE POLICY "student_projects_admin_all" ON student_projects
  FOR ALL USING (school_id = get_user_school_id() AND is_admin())
  WITH CHECK (school_id = get_user_school_id() AND is_admin());

-- 2. Professor gerencia projetos que ele criou ou das turmas dele
CREATE POLICY "student_projects_teacher_all" ON student_projects
  FOR ALL USING (
    school_id = get_user_school_id() AND is_teacher()
  )
  WITH CHECK (
    school_id = get_user_school_id() AND is_teacher()
  );

-- 3. Responsável/Pai só visualiza fotos e projetos publicados liberados para seu filho ou turma do filho
CREATE POLICY "student_projects_parent_select" ON student_projects
  FOR SELECT USING (
    is_parent() AND is_published = true
    AND (
      -- Se a pasta é específica para o filho dele
      (student_id IS NOT NULL AND is_parent_of_student(student_id))
      OR
      -- Se a pasta é para a turma inteira onde o filho estuda
      (student_id IS NULL AND class_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM class_students cs
        JOIN students s ON s.id = cs.student_id
        WHERE cs.class_id = student_projects.class_id
          AND s.parent_guardian_id = auth.uid()
          AND cs.status = 'active'
      ))
    )
  );
