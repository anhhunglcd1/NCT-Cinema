import type { CsrfToken } from "./types";

/**
 * HTTP client dùng trong trình duyệt. Mọi request đi qua `/api/*` của Next.js
 * (được rewrite sang backend) nên cookie phiên và CSRF luôn cùng origin.
 *
 * Backend dùng Spring Security với HttpSessionCsrfTokenRepository:
 *  - Lấy token bằng GET /api/auth/csrf, gửi lại qua header `headerName`.
 *  - Token đổi sau khi đăng nhập và mất sau khi đăng xuất -> gọi resetCsrf().
 *  - 403 có thể là token hết hạn HOẶC thật sự không có quyền, nên chỉ thử lại 1 lần.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  signal?: AbortSignal;
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: "Dữ liệu gửi lên không hợp lệ.",
  401: "Vui lòng đăng nhập để tiếp tục.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu.",
  409: "Dữ liệu đã thay đổi. Vui lòng tải lại và thử lại.",
};

let csrfPromise: Promise<CsrfToken> | null = null;

export function resetCsrf() {
  csrfPromise = null;
}

async function fetchCsrf(): Promise<CsrfToken> {
  const response = await fetch("/api/auth/csrf", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new ApiError(response.status, "Không lấy được mã bảo mật (CSRF). Backend có đang chạy không?");
  }
  return (await response.json()) as CsrfToken;
}

function getCsrf(force = false): Promise<CsrfToken> {
  if (force || !csrfPromise) {
    csrfPromise = fetchCsrf().catch((error) => {
      csrfPromise = null;
      throw error;
    });
  }
  return csrfPromise;
}

async function toApiError(response: Response): Promise<ApiError> {
  let message = FALLBACK_MESSAGES[response.status] ?? "Có lỗi xảy ra. Vui lòng thử lại.";
  let details: string[] = [];
  try {
    const data = (await response.json()) as { message?: string; errors?: string[] };
    if (data?.message) message = data.message;
    if (Array.isArray(data?.errors)) details = data.errors;
  } catch {
    // Body không phải JSON (ví dụ proxy báo lỗi) -> giữ thông báo mặc định.
  }
  if (response.status >= 500) {
    message = "Máy chủ đang gặp sự cố hoặc chưa khởi động. Vui lòng thử lại sau.";
  }
  return new ApiError(response.status, message, details);
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const isWrite = method !== "GET";

  const send = async (forceCsrf: boolean) => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (isWrite) {
      const csrf = await getCsrf(forceCsrf);
      headers[csrf.headerName] = csrf.token;
    }
    return fetch(path, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "same-origin",
      cache: "no-store",
      signal: options.signal,
    });
  };

  let response: Response;
  try {
    response = await send(false);
    if (response.status === 403 && isWrite) {
      response = await send(true);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "Không kết nối được máy chủ. Kiểm tra mạng hoặc backend.");
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Có lỗi xảy ra. Vui lòng thử lại.";
}
