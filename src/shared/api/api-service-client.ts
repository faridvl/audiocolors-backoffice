import { CookiesManager } from '@/shared/utils/cookies-manager';
import { routesPublic } from '@/shared/navigation/routes';

const NETWORK_ERROR_MESSAGE =
  'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
const GENERIC_ERROR_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo.';

interface ApiErrorBody {
  message?: string | string[];
}

const handleSessionExpired = (): void => {
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
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message.join('. ') : body.message;
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

async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
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
    // Con token, la sesion expiro y se cierra de verdad.
    if (token) {
      handleSessionExpired();
      throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
    }

    const errorBody = await parseJsonBody<ApiErrorBody>(response);
    throw new Error(resolveErrorMessage(errorBody, 'Credenciales inválidas'));
  }

  if (response.status === 204) return null as T;

  const data = await parseJsonBody<T>(response);

  if (!response.ok) {
    throw new Error(resolveErrorMessage(data as ApiErrorBody | null, GENERIC_ERROR_MESSAGE));
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
