/**
 * Información de la empresa que utilizará el menú digital.
 */
export interface Company {
  id: string;
  taxId: string;
  businessName: string;
  commercialName: string;
  email: string;
  phone: string;
  logoUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CompanyPayload = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;
