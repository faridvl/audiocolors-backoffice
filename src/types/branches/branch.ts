/** Sede (sucursal fisica) de la clinica. Catalogo de solo lectura desde el API. */
export interface Branch {
  id: number;
  uuid: string;
  tenantUuid: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}
