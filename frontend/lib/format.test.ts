import { describe, expect, it } from "vitest";
import { addDays, formatDuration, formatVnd, isUpcoming, showtimeStart, todayInVietnam } from "./format";

describe("giờ Việt Nam", () => {
  it("showtimeStart hiểu ngày/giờ là giờ VN (UTC+7)", () => {
    expect(showtimeStart({ date: "2026-11-22", time: "09:00" }).toISOString()).toBe("2026-11-22T02:00:00.000Z");
  });

  it("isUpcoming so sánh theo mốc tuyệt đối", () => {
    const show = { date: "2026-11-22", time: "09:00" };
    expect(isUpcoming(show, Date.parse("2026-11-22T01:59:59Z"))).toBe(true);
    expect(isUpcoming(show, Date.parse("2026-11-22T02:00:00Z"))).toBe(false);
  });

  it("todayInVietnam đổi ngày lúc 0h giờ VN, không phải 0h UTC", () => {
    expect(todayInVietnam(new Date("2026-11-21T16:59:00Z"))).toBe("2026-11-21");
    expect(todayInVietnam(new Date("2026-11-21T17:00:00Z"))).toBe("2026-11-22");
  });

  it("addDays qua tháng/năm", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("định dạng", () => {
  it("tiền VND không có số lẻ", () => {
    expect(formatVnd(170000).replace(/\s/g, " ")).toMatch(/^170\.000\s?₫$/);
  });

  it("thời lượng", () => {
    expect(formatDuration(45)).toBe("45 phút");
    expect(formatDuration(120)).toBe("2 giờ");
    expect(formatDuration(166)).toBe("2 giờ 46 phút");
  });
});
