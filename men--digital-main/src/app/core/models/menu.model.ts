/**
 * Representa un menú disponible en el sistema.
 */
export interface Menu {
  id: string;
  name: string;
  active: boolean;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Información utilizada para crear o actualizar un menú desde el frontend.
 */
export type MenuPayload = Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>;
