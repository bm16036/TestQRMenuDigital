/**
 * Roles soportados por la aplicación administrativa.
 */
export type UserRole = 'ADMIN' | 'USER';

/**
 * Usuario interno que puede acceder al panel administrativo.
 */
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  companyId: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Datos esperados por el backend para crear o actualizar usuarios.
 * La contraseña se maneja únicamente en el backend.
 */
export type UserPayload = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password?: string };
