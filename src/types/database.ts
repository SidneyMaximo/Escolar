export type AppRole = 'admin' | 'teacher' | 'parent';
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
export type GradeType = 'avaliacao' | 'trabalho' | 'prova' | 'participacao' | 'final';
export type AttendanceStatus = 'presente' | 'ausente' | 'justificado' | 'atraso';

export interface School {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  cnpj: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  school_id: string;
  full_name: string;
  cpf: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  full_name: string;
  date_of_birth: string;
  gender: string | null;
  photo_url: string | null;
  parent_guardian_id: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_notes: string | null;
  created_at: string;
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  grade_level: string;
  academic_year: number;
  teacher_id: string | null;
  max_capacity: number;
  schedule: Record<string, unknown> | null;
  created_at: string;
}

export interface ClassStudent {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  status: EnrollmentStatus;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string | null;
  description: string | null;
}

export interface Grade {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  grade_type: GradeType;
  score: number;
  max_score: number;
  description: string | null;
  graded_at: string;
  created_at: string;
}

export interface ReportCard {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  period: string;
  generated_at: string;
  pdf_url: string | null;
  notes: string | null;
  approved_by: string | null;
}

export interface Enrollment {
  id: string;
  school_id: string;
  type: 'matricula' | 'rematricula';
  student_name: string;
  student_dob: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_cpf: string | null;
  address: Record<string, unknown> | null;
  previous_school: string | null;
  medical_info: string | null;
  documents: Record<string, unknown> | null;
  status: EnrollmentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface Staff {
  id: string;
  school_id: string;
  profile_id: string | null;
  position: string;
  department: string | null;
  hire_date: string | null;
  active: boolean;
}

export interface Attendance {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  recorded_by: string | null;
}

export interface Message {
  id: string;
  school_id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      schools: { Row: School; Insert: Omit<School, 'id' | 'created_at'>; Update: Partial<School> };
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile> };
      students: { Row: Student; Insert: Omit<Student, 'id' | 'created_at'>; Update: Partial<Student> };
      classes: { Row: Class; Insert: Omit<Class, 'id' | 'created_at'>; Update: Partial<Class> };
      class_students: { Row: ClassStudent; Insert: Omit<ClassStudent, 'id' | 'enrolled_at'>; Update: Partial<ClassStudent> };
      subjects: { Row: Subject; Insert: Omit<Subject, 'id'>; Update: Partial<Subject> };
      grades: { Row: Grade; Insert: Omit<Grade, 'id' | 'created_at'>; Update: Partial<Grade> };
      report_cards: { Row: ReportCard; Insert: Omit<ReportCard, 'id' | 'generated_at'>; Update: Partial<ReportCard> };
      enrollments: { Row: Enrollment; Insert: Omit<Enrollment, 'id' | 'created_at'>; Update: Partial<Enrollment> };
      staff: { Row: Staff; Insert: Omit<Staff, 'id'>; Update: Partial<Staff> };
      attendance: { Row: Attendance; Insert: Omit<Attendance, 'id'>; Update: Partial<Attendance> };
      messages: { Row: Message; Insert: Omit<Message, 'id' | 'created_at'>; Update: Partial<Message> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      enrollment_status: EnrollmentStatus;
      grade_type: GradeType;
    };
  };
}