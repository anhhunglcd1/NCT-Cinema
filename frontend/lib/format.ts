import type { Showtime } from "./api/types";

/** Giờ suất chiếu và báo cáo đều tính theo giờ Việt Nam (Asia/Ho_Chi_Minh, UTC+7, không đổi giờ). */
const VN_TIME_ZONE = "Asia/Ho_Chi_Minh";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatVnd(amount: number): string {
  return currency.format(amount);
}

/** Thời điểm bắt đầu suất chiếu (Instant) từ ngày/giờ địa phương Việt Nam. */
export function showtimeStart(showtime: Pick<Showtime, "date" | "time">): Date {
  return new Date(`${showtime.date}T${showtime.time.slice(0, 5)}:00+07:00`);
}

export function isUpcoming(showtime: Pick<Showtime, "date" | "time">, now: number = Date.now()): boolean {
  return showtimeStart(showtime).getTime() > now;
}

/** Ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD. */
export function todayInVietnam(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const dayLabel = new Intl.DateTimeFormat("vi-VN", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});

/** "T7, 21/11" cho một ngày YYYY-MM-DD. */
export function formatDay(isoDate: string): string {
  return dayLabel.format(new Date(`${isoDate}T00:00:00Z`));
}

const longDate = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatLongDay(isoDate: string): string {
  return longDate.format(new Date(`${isoDate}T00:00:00Z`));
}

const dateTime = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: VN_TIME_ZONE,
});

/** Định dạng một mốc thời gian ISO (UTC) theo giờ Việt Nam. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
}

export const RATING_LABEL: Record<string, string> = {
  P: "P – Mọi lứa tuổi",
  K: "K – Dưới 13 tuổi cần người lớn đi kèm",
  T13: "T13 – Từ 13 tuổi",
  T16: "T16 – Từ 16 tuổi",
  T18: "T18 – Từ 18 tuổi",
};
