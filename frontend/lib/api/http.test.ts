import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, resetCsrf } from "./http";

type Call = { url: string; init: RequestInit };

function json(status: number, body: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("api()", () => {
  let calls: Call[];
  let responses: Array<(call: Call) => Response>;

  beforeEach(() => {
    resetCsrf();
    calls = [];
    responses = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit = {}) => {
        const call = { url, init };
        calls.push(call);
        const next = responses.shift();
        if (!next) throw new Error(`Unexpected fetch ${url}`);
        return next(call);
      }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("GET không cần CSRF và trả về JSON", async () => {
    responses.push(() => json(200, { status: "UP" }));
    await expect(api("/api/health")).resolves.toEqual({ status: "UP" });
    expect(calls).toHaveLength(1);
  });

  it("POST gửi CSRF token qua header do backend chỉ định", async () => {
    responses.push(() => json(200, { token: "t1", headerName: "X-CSRF-TOKEN" }));
    responses.push(() => json(201, { id: "NCT1" }));
    await api("/api/tickets", { method: "POST", body: { a: 1 } });
    const headers = calls[1].init.headers as Record<string, string>;
    expect(headers["X-CSRF-TOKEN"]).toBe("t1");
    expect(calls[1].init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("dùng lại token cho các lần ghi tiếp theo", async () => {
    responses.push(() => json(200, { token: "t1", headerName: "X-CSRF-TOKEN" }));
    responses.push(() => json(200, {}));
    responses.push(() => json(200, {}));
    await api("/a", { method: "POST" });
    await api("/b", { method: "POST" });
    expect(calls.map((c) => c.url)).toEqual(["/api/auth/csrf", "/a", "/b"]);
  });

  it("403 -> lấy token mới và thử lại đúng 1 lần", async () => {
    responses.push(() => json(200, { token: "old", headerName: "X-CSRF-TOKEN" }));
    responses.push(() => json(403, { message: "expired" }));
    responses.push(() => json(200, { token: "new", headerName: "X-CSRF-TOKEN" }));
    responses.push(() => json(200, { ok: true }));
    await expect(api("/api/tickets/1/cancel", { method: "POST" })).resolves.toEqual({ ok: true });
    expect((calls[3].init.headers as Record<string, string>)["X-CSRF-TOKEN"]).toBe("new");
  });

  it("403 lặp lại là lỗi quyền thật, không thử lại vô hạn", async () => {
    responses.push(() => json(200, { token: "a", headerName: "X-CSRF-TOKEN" }));
    responses.push(() => json(403, { message: "Bạn không có quyền" }));
    responses.push(() => json(200, { token: "b", headerName: "X-CSRF-TOKEN" }));
    responses.push(() => json(403, { message: "Bạn không có quyền" }));
    const error = (await api("/api/admin/movies", { method: "POST" }).catch((e) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(403);
    expect(error.message).toBe("Bạn không có quyền");
    expect(calls).toHaveLength(4);
  });

  it("đọc message và danh sách lỗi validate từ backend", async () => {
    responses.push(() => json(400, { message: "Thông tin chưa hợp lệ.", errors: ["title: must not be blank"] }));
    const error = (await api("/x").catch((e) => e)) as ApiError;
    expect(error.status).toBe(400);
    expect(error.details).toEqual(["title: must not be blank"]);
  });

  it("204 trả về undefined", async () => {
    responses.push(() => json(200, { token: "t", headerName: "X-CSRF-TOKEN" }));
    responses.push(() => new Response(null, { status: 204 }));
    await expect(api("/api/admin/movies/x", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("lỗi mạng -> ApiError status 0 với thông báo tiếng Việt", async () => {
    responses.push(() => {
      throw new TypeError("fetch failed");
    });
    const error = (await api("/api/catalog").catch((e) => e)) as ApiError;
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/Không kết nối/);
  });

  it("5xx không lộ chi tiết lỗi máy chủ", async () => {
    responses.push(() => json(500, { message: "NullPointerException at ..." }));
    const error = (await api("/api/catalog").catch((e) => e)) as ApiError;
    expect(error.message).not.toMatch(/NullPointer/);
  });
});
