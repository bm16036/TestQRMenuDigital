export interface Category {
  id: number;
  nombre: string;
  descripcion: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type CategoryPayload = Pick<Category, 'nombre' | 'descripcion'>;
