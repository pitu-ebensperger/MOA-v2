import { env } from "@/config/env.js"

const DEFAULT_TIMEOUT = env.API_TIMEOUT ?? 15000;
const TOKEN_STORAGE_KEY = "moa.accessToken";
const DEFAULT_429_DELAY_MS = 1000;
const DEFAULT_MAX_429_RETRIES = 3;

// token + handler global 401 (los setea AuthContext)
let tokenGetter = () => null;
let onUnauthorized = null;

export function setTokenGetter(fn) {
  tokenGetter = typeof fn === "function" ? fn : () => null;
}

export function setOnUnauthorized(fn) {
  onUnauthorized = typeof fn === "function" ? fn : null;
}

// FormData/Blob/etc. no llevan JSON.stringify ni content-type json
const isRawBody =
  (data) =>
    (typeof FormData !== "undefined" && data instanceof FormData) ||
    (typeof Blob !== "undefined" && data instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer);

// Interceptor de mocks eliminado: todo va contra backend real.

const tryParseJson = (text) => {
  if (text === undefined || text === null || text === "") {
    return { ok: true, value: null };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, value: text };
  }
};

const getStoredToken = () => {
  try {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      return globalThis.localStorage.getItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage read errors
  }
  return null;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Petición base (fetch)
async function request(path, {
  method = "GET",
  data,
  headers = {},
  auth = null,
  timeout = DEFAULT_TIMEOUT,
  responseType = "json",
  params,
  retry429Attempt = 0,
  max429Retries = DEFAULT_MAX_429_RETRIES,
  retry429Delay = DEFAULT_429_DELAY_MS,
  signal: externalSignal,
} = {}) {
  // Sin soporte de mocks: siempre solicitar al backend.

  const baseURL = env.API_BASE_URL;
  const url = new URL(path, baseURL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item === undefined || item === null) {
            continue;
          }
          url.searchParams.append(key, String(item));
        }
        continue;
      }
      url.searchParams.append(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeoutError = new Error("Request timeout");
  timeoutError.name = "AbortError";
  const timer = setTimeout(() => controller.abort(timeoutError), timeout);
  let externalAbortCleanup;

  if (externalSignal) {
    const handleAbort = (event) => {
      const reason = event?.target?.reason ?? externalSignal.reason ?? new Error("Aborted by caller");
      if (!controller.signal.aborted) {
        controller.abort(reason);
      }
    };

    if (externalSignal.aborted) {
      handleAbort({ target: externalSignal });
    } else {
      externalSignal.addEventListener('abort', handleAbort, { once: true });
      externalAbortCleanup = () => externalSignal.removeEventListener('abort', handleAbort);
    }
  }

  const requestHeaders = { ...headers };

  const opts = {
    method,
    headers: requestHeaders,
    signal: controller.signal,
  };

  // Body + content-type
  if (data !== undefined) {
    if (isRawBody(data)) {
      opts.body = data;
      // no seteamos Content-Type: el browser lo pone (boundary, etc.)
    } else {
      requestHeaders["Content-Type"] = "application/json";
      opts.body = typeof data === "string" ? data : JSON.stringify(data);
    }
  }

  // Auto-detectar auth si no se especifica
  if (auth === null) {
    // Rutas que típicamente requieren autenticación
    const authRequiredPatterns = [
      /\/admin\//,
      /\/perfil/,
      /\/profile/,
      /\/carrito/,
      /\/cart/,
      /\/direcciones/,
      /\/addresses/,
      /\/pedidos/,
      /\/orders/,
      /\/usuario/,
      /\/user/,
      /\/checkout/, // agregar checkout para ordenes
    ];
    
    auth = authRequiredPatterns.some(pattern => pattern.test(path));
  }

  // Authorization si es cliente privado
  if (auth) {
    let token = tokenGetter?.();
    if (!token || typeof token !== "string" || token.length === 0) {
      token = getStoredToken();
    }
    if (token && typeof token === "string" && token.length > 0) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let res;
  try {
    res = await fetch(url, opts);
  } finally {
    clearTimeout(timer);
    if (externalAbortCleanup) externalAbortCleanup();
  }

  // 204 No Content
  if (res.status === 204) return null;

  let payload;
  let rawText = "";
  let parsedJson = null;

  if (responseType === "blob") {
    const clone = res.clone();
    payload = await res.blob();
    rawText = await clone.text();
    parsedJson = tryParseJson(rawText);
  } else {
    rawText = await res.text();
    parsedJson = tryParseJson(rawText);
    if (responseType === "text") {
      payload = rawText;
    } else {
      payload = parsedJson.ok ? parsedJson.value : rawText;
    }
  }

  // 401 → dispara handler global (logout) si existe
  // PERO no en rutas de autenticación (login/register) donde 401 es esperado
  if (res.status === 401 && onUnauthorized) {
    const isAuthEndpoint = path.includes('/login') || path.includes('/register');
    if (!isAuthEndpoint) {
      console.warn(`[api-client] 401 Unauthorized en ${path}, disparando logout...`);
      try {
        onUnauthorized();
      } catch (handlerError) {
        console.error('[api-client] onUnauthorized handler failed', handlerError);
      }
    }
  }

  if (!res.ok) {
    const errorData = parsedJson?.ok ? parsedJson.value : rawText;
    const message = parsedJson?.ok && parsedJson.value?.message
      ? parsedJson.value.message
      : rawText || `HTTP ${res.status}`;
    if (res.status === 429 && retry429Attempt < max429Retries) {
      const retryAfterHeader = res.headers?.get?.("Retry-After");
      const retryDelayMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : retry429Delay;
      await sleep(Number.isFinite(retryDelayMs) && retryDelayMs > 0 ? retryDelayMs : DEFAULT_429_DELAY_MS);
      return request(path, {
        method,
        data,
        headers,
        auth,
        timeout,
        responseType,
        params,
        retry429Attempt: retry429Attempt + 1,
        max429Retries,
        retry429Delay,
        signal: externalSignal,
      });
    }
    const err = new Error(message);
    err.status = res.status;
    err.data = errorData;
    throw err;
  }

  return payload;
}

// Cliente auxiliar para rutas públicas/privadas
const createSubClient = (authOverride) => ({
  get: (path, opts = {}) => request(path, { ...opts, method: "GET", auth: authOverride }),
  post: (path, data, opts = {}) => request(path, { ...opts, method: "POST", data, auth: authOverride }),
  put: (path, data, opts = {}) => request(path, { ...opts, method: "PUT", data, auth: authOverride }),
  patch: (path, data, opts = {}) => request(path, { ...opts, method: "PATCH", data, auth: authOverride }),
  delete: (path, opts = {}) => request(path, { ...opts, method: "DELETE", auth: authOverride }),
});

// Cliente API simple con auto-detección de autenticación
export const apiClient = {
  get:    (path, opts = {})       => request(path, { ...opts, method: "GET" }),
  post:   (path, data, opts = {}) => request(path, { ...opts, method: "POST", data }),
  put:    (path, data, opts = {}) => request(path, { ...opts, method: "PUT", data }),
  patch:  (path, data, opts = {}) => request(path, { ...opts, method: "PATCH", data }),
  delete: (path, opts = {})       => request(path, { ...opts, method: "DELETE" }),
  public: createSubClient(false),
  private: createSubClient(true),
};
