/** Colores que la clínica puede darle a una sede; el API guarda solo el nombre. */
export enum BranchColor {
  RED = 'RED',
  ORANGE = 'ORANGE',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  PURPLE = 'PURPLE',
}

/** Los colores en el orden de la marca, que es el orden en que se ofrecen y se asignan. */
export const BRANCH_COLORS: BranchColor[] = [
  BranchColor.RED,
  BranchColor.ORANGE,
  BranchColor.YELLOW,
  BranchColor.GREEN,
  BranchColor.BLUE,
  BranchColor.PURPLE,
];

/** Topes iguales a los del API. El teléfono (30 en el API) ya lo limita `PhoneField` a 20 caracteres. */
export const BRANCH_NAME_MAX_LENGTH = 80;
export const BRANCH_ADDRESS_MAX_LENGTH = 200;

/** Sede (sucursal física) de la clínica. La clínica las crea, edita, desactiva y reactiva; nunca se borran. */
export interface Branch {
  id: number;
  uuid: string;
  tenantUuid: string;
  name: string;
  phone: string | null;
  address: string | null;
  color: BranchColor;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBranchPayload {
  name: string;
  phone?: string;
  address?: string;
  color: BranchColor;
}

/** Vaciar `phone` o `address` los deja en `null`. */
export interface UpdateBranchPayload {
  name?: string;
  phone?: string;
  address?: string;
  color?: BranchColor;
  isActive?: boolean;
}
