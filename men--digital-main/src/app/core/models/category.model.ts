/**
 * Representa la categoría de un menú dentro de una empresa.
 */
export interface Category {
  /** Identificador único generado por el backend. */
  id: string;
  /** Nombre visible de la categoría (por ejemplo "Bebidas"). */
  name: string;
  /** Determina si la categoría debe mostrarse en el menú público. */
  active: boolean;
  /** Relación con la empresa propietaria. */
  companyId: string;
  /** Fechas generadas en el backend para auditoría. */
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Datos mínimos para crear o editar categorías desde el frontend.
 */
export type CategoryPayload = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
