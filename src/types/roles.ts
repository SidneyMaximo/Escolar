import type { AppRole } from './database';

export const ROLES: Record<AppRole, string> = {
  admin: 'Administrador',
  teacher: 'Professor',
  parent: 'Responsável',
};

export const ROLE_DASHBOARDS: Record<AppRole, string> = {
  admin: '/admin',
  teacher: '/professor',
  parent: '/pais',
};

export function canAccess(role: AppRole, allowedRoles: AppRole[]): boolean {
  return allowedRoles.includes(role);
}