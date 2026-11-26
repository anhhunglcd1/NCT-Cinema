import { describe, expect, it } from "vitest";
import {
  IdempotencyKeys,
  MAX_SEATS_PER_BOOKING,
  seatGrid,
  sortSeats,
  statusMap,
  toggleSeat,
  unavailableSelected,
} from "./booking-state";

describe("seatGrid", () => {
  it("đặt tên ghế giống backend (A1.., hàng theo chữ cái)", () => {
    expect(seatGrid(2, 3)).toEqual([
      ["A1", "A2", "A3"],
      ["B1", "B2", "B3"],
    ]);
    expect(seatGrid(20, 24).at(-1)?.at(-1)).toBe("T24");
  });
});

describe("sortSeats", () => {
  it("sắp theo hàng rồi theo số, không theo chuỗi", () => {
    expect(sortSeats(["B1", "A10", "A2"])).toEqual(["A2", "A10", "B1"]);
  });
});

describe("toggleSeat", () => {
  const statuses = statusMap([
    { label: "A1", status: "available" },
    { label: "A2", status: "occupied" },
    { label: "A3", status: "blocked" },
  ]);

  it("chọn ghế trống", () => {
    expect(toggleSeat([], "A1", statuses.get("A1"))).toEqual({ ok: true, selected: ["A1"] });
  });

  it("không cho chọn ghế đã có người hoặc bị khóa", () => {
    expect(toggleSeat([], "A2", statuses.get("A2")).ok).toBe(false);
    expect(toggleSeat([], "A3", statuses.get("A3")).ok).toBe(false);
  });

  it("luôn cho bỏ chọn, kể cả khi ghế vừa bị người khác giữ", () => {
    expect(toggleSeat(["A2"], "A2", "occupied")).toEqual({ ok: true, selected: [] });
  });

  it("giới hạn số ghế mỗi lần đặt", () => {
    const selected = Array.from({ length: MAX_SEATS_PER_BOOKING }, (_, i) => `C${i + 1}`);
    expect(toggleSeat(selected, "D1", "available")).toMatchObject({ ok: false, reason: "limit" });
  });

  it("phát hiện ghế đang chọn nhưng đã mất", () => {
    expect(unavailableSelected(["A1", "A2"], statuses)).toEqual(["A2"]);
  });
});

describe("IdempotencyKeys", () => {
  const counter = () => {
    let n = 0;
    return () => `key-${++n}`;
  };

  it("cùng suất + cùng bộ ghế (khác thứ tự) dùng lại một khóa", () => {
    const keys = new IdempotencyKeys(counter());
    expect(keys.keyFor("s1", ["A2", "A1"])).toBe("key-1");
    expect(keys.keyFor("s1", ["A1", "A2"])).toBe("key-1");
  });

  it("đổi lựa chọn hoặc đổi suất -> khóa mới", () => {
    const keys = new IdempotencyKeys(counter());
    expect(keys.keyFor("s1", ["A1"])).toBe("key-1");
    expect(keys.keyFor("s1", ["A1", "A2"])).toBe("key-2");
    expect(keys.keyFor("s2", ["A1"])).toBe("key-3");
  });

  it("forget() sau xung đột ghế -> lần sau là yêu cầu mới", () => {
    const keys = new IdempotencyKeys(counter());
    keys.keyFor("s1", ["A1"]);
    keys.forget("s1", ["A1"]);
    expect(keys.keyFor("s1", ["A1"])).toBe("key-2");
  });
});
