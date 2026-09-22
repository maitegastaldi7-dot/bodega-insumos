const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  errores?: Array<{ campo: string; mensaje: string }>;
  constructor(status: number, mensaje: string, errores?: Array<{ campo: string; mensaje: string }>) {
    super(mensaje);
    this.status = status;
    this.errores = errores;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    let mensaje = `Error ${res.status} al llamar a ${path}`;
    let errores: Array<{ campo: string; mensaje: string }> | undefined;
    try {
      const body = await res.json();
      mensaje = body.mensaje ?? mensaje;
      errores = body.errores;
    } catch {
      // el cuerpo de error no era JSON: se usa el mensaje genérico
    }
    throw new ApiError(res.status, mensaje, errores);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
};
