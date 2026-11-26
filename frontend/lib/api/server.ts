import "server-only";
import { connection } from "next/server";

/**
 * Gọi backend trực tiếp từ Server Component (không đi qua rewrite).
 * Chỉ dùng cho dữ liệu công khai (danh mục phim/rạp/suất chiếu).
 * Không cache: luôn lấy dữ liệu mới, nên các component dùng hàm này phải nằm trong <Suspense>.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://127.0.0.1:8080").replace(/\/$/, "");

class BackendUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Không kết nối được backend NCT Cinema.", { cause });
    this.name = "BackendUnavailableError";
  }
}

type BackendResult<T> = { ok: true; data: T; at: number } | { ok: false };

/**
 * Chạy một lần đọc backend, trả về kết quả thay vì ném lỗi khi backend tắt
 * (để component hiển thị thông báo thay vì trang lỗi). `at` là thời điểm đọc, dùng thay cho Date.now() khi render.
 */
export async function tryBackend<T>(load: () => Promise<T>): Promise<BackendResult<T>> {
  try {
    const data = await load();
    return { ok: true, data, at: Date.now() };
  } catch (error) {
    if (error instanceof BackendUnavailableError) return { ok: false };
    throw error;
  }
}

export async function serverGet<T>(path: string): Promise<T | null> {
  // Dữ liệu backend thay đổi theo thời gian (suất chiếu, ghế...) -> chỉ đọc khi có request thật,
  // không đưa vào bản prerender. Sau dòng này dùng Date.now() là hợp lệ.
  await connection();
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch (error) {
    throw new BackendUnavailableError(error);
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new BackendUnavailableError(`HTTP ${response.status}`);
  return (await response.json()) as T;
}
