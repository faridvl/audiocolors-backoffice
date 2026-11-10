import { env } from '@/shared/api/config';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { LoginResponse } from '@/types/auth/auth';
import { routesPublic } from '@/shared/navigation/routes';

// En local, un origen que el API no tiene en ALLOWED_ORIGINS (CORS) falla igual
// que una red caída: el navegador no deja distinguirlos.
const NETWORK_ERROR_MESSAGE =
  process.env.NODE_ENV === 'development'
    ? 'No se pudo conectar con el API. En local, la app tiene que correr en http://localhost:3000: el API rechaza otros puertos.'
    : 'No hay conexión. Revisa tu internet e inténtalo de nuevo.';
const GENERIC_ERROR_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo.';

export enum HttpStatus {
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
}

/** Error del API con su status, para distinguir p. ej. un 403 de rol de una falla real. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Errores 400 por campo, cuando el API los detalla. */
    readonly details: ApiFieldError[] = [],
    /** Código estable del API (p. ej. `BRANCH_LAST_ACTIVE`), cuando lo trae. */
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiFieldError {
  field: string;
  message: string;
}

interface ApiErrorBody {
  message?: string | string[];
  details?: ApiFieldError[];
  error?: { code?: string; message?: string | string[] };
}

const resolveFieldErrors = (body: ApiErrorBody | null): ApiFieldError[] =>
  Array.isArray(body?.details) ? body.details : [];

/** Aviso para que la sesión (`/auth/me`) se relea cuando el acceso del usuario cambió. */
export const ACCESS_REFRESHED_EVENT = 'access-refreshed';
const REFRESH_ENDPOINT = '/auth/refresh';

/**
 * Un 401 o un 403 puede ser un acceso cambiado después de iniciar sesión (el token lleva el
 * acceso viejo).
 * Se pide un token nuevo; devuelve false si no se pudo.
 */
const refreshAccessToken = async (): Promise<boolean> => {
  const token = CookiesManager.getAccessToken();
  if (!token) return false;
  try {
    const response = await fetch(`${env.API.IDENTITY_URL}${REFRESH_ENDPOINT}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) return false;
    const refreshed = await parseJsonBody<LoginResponse>(response);
    if (!refreshed?.access_token) return false;
    CookiesManager.setSession(
      refreshed.access_token,
      refreshed.user?.name ?? CookiesManager.getUserName() ?? '',
    );
    window.dispatchEvent(new Event(ACCESS_REFRESHED_EVENT));
    return true;
  } catch {
    return false;
  }
};

export const handleSessionExpired = (): void => {
  CookiesManager.clearAll();
  if (typeof window !== 'undefined') {
    window.location.href = `${routesPublic.login}?expired=true`;
  }
};

/**
 * El API devuelve `message` como string o como string[] (errores de validacion
 * de Zod/class-validator). Se normaliza a una sola linea legible.
 */
const resolveErrorMessage = (body: ApiErrorBody | null, fallback: string): string => {
  const message = body?.message ?? body?.error?.message;
  if (!message) return fallback;
  return Array.isArray(message) ? message.join('. ') : message;
};

/**
 * Lee el body como JSON tolerando respuestas vacias: algunos endpoints
 * responden 200/201 sin cuerpo y `response.json()` lanzaria SyntaxError.
 */
const parseJsonBody = async <T>(response: Response): Promise<T | null> => {
  const rawBody = await response.text();
  if (!rawBody) return null;

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    return null;
  }
};

async function fetcher<T>(url: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const token = CookiesManager.getAccessToken();

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  });

  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;

  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  if (response.status === 401) {
    // Sin token es un login fallido: se propaga el mensaje del API.
    // Con token, un 401 puede ser un token viejo (sin `attendsPatients` o con un rol legado): se
    // intenta un refresh una sola vez y, si falla, la sesion se cierra de verdad.
    if (token) {
      if (!isRetry && (await refreshAccessToken())) {
        return fetcher<T>(url, options, true);
      }
      handleSessionExpired();
      throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
    }

    const errorBody = await parseJsonBody<ApiErrorBody>(response);
    throw new Error(resolveErrorMessage(errorBody, 'Credenciales inválidas'));
  }

  const isAccessDenied = response.status === HttpStatus.FORBIDDEN;
  if (isAccessDenied && token && !isRetry && (await refreshAccessToken())) {
    return fetcher<T>(url, options, true);
  }

  if (response.status === 204) return null as T;

  const data = await parseJsonBody<T>(response);

  if (!response.ok) {
    throw new ApiError(
      resolveErrorMessage(data as ApiErrorBody | null, GENERIC_ERROR_MESSAGE),
      response.status,
      resolveFieldErrors(data as ApiErrorBody | null),
      (data as ApiErrorBody | null)?.error?.code,
    );
  }

  return data as T;
}

export const ApiServiceClient = (baseUrl: string) => ({
  get: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
    fetcher<T>(`${baseUrl}${endpoint}`, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> =>
    fetcher<T>(`${baseUrl}${endpoint}`, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> =>
    fetcher<T>(`${baseUrl}${endpoint}`, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> =>
    fetcher<T>(`${baseUrl}${endpoint}`, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
    fetcher<T>(`${baseUrl}${endpoint}`, { ...options, method: 'DELETE' }),
});
