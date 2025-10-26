import { User } from './user.model';

/**
 * Datos necesarios para el inicio de sesión.
 */
export interface AuthCredentials {
  username: string;
  password: string;
  /**
   * Empresa seleccionada en el flujo de registro/login.
   */
  companyId?: string;
}

/**
 * Respuesta esperada desde el backend al autenticarse correctamente.
 */
export interface AuthResponse {
  token: string;
  user: User;
}
