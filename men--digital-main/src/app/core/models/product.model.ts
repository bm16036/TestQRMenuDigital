/**
 * Describe un producto o platillo disponible en el menú.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  menuIds: string[];
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Información requerida para crear o actualizar un producto desde el frontend.
 */
export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
