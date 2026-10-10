import type { AppRole } from '@/types/database';

const ROLE_HIERARCHY: Record<AppRole, number> = {
  admin: 3,
  teacher: 2,
  parent: 1,
};

export function hasMinRole(userRole: AppRole, minRole: AppRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

export function canManageStudents(role: AppRole): boolean {
  return role === 'admin' || role === 'teacher';
}

export function canManageGrades(role: AppRole): boolean {
  return role === 'admin' || role === 'teacher';
}

export function canViewReportCards(role: AppRole): boolean {
  return true; // All roles can view, but scoped by RLS
}

export function canManageUsers(role: AppRole): boolean {
  return role === 'admin';
}

export function canManageEnrollments(role: AppRole): boolean {
  return role === 'admin';
}

export function canViewAttendance(role: AppRole): boolean {
  return role === 'admin' || role === 'teacher' || role === 'parent';
}

export function canSendMessages(role: AppRole): boolean {
  return true;
}