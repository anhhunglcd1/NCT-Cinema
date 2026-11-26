import type { SeatAvailability, SeatStatus } from "./api/types";

/** Tối đa số ghế cho một lần đặt trên giao diện (backend cho phép nhiều hơn). */
export const MAX_SEATS_PER_BOOKING = 8;

/** Nhãn ghế giống backend: hàng A..T, cột 1..24 (CatalogService.saveRoom). */
function seatLabel(row: number, col: number): string {
  return `${String.fromCharCode(65 + row)}${col}`;
}

export function seatGrid(rows: number, seatsPerRow: number): string[][] {
  return Array.from({ length: rows }, (_, r) => Array.from({ length: seatsPerRow }, (_, c) => seatLabel(r, c + 1)));
}

/** Sắp xếp nhãn ghế theo hàng rồi theo số: A2 < A10 < B1. */
function compareSeats(a: string, b: string): number {
  return a.charCodeAt(0) - b.charCodeAt(0) || Number(a.slice(1)) - Number(b.slice(1));
}

export function sortSeats(seats: Iterable<string>): string[] {
  return [...seats].sort(compareSeats);
}

export function statusMap(seats: SeatAvailability[] | undefined): Map<string, SeatStatus> {
  return new Map(seats?.map((s) => [s.label, s.status]));
}

type ToggleResult =
  | { ok: true; selected: string[] }
  | { ok: false; reason: "unavailable" | "limit"; selected: string[] };

/**
 * Bật/tắt một ghế. Luôn cho phép BỎ chọn (kể cả khi ghế vừa bị người khác giữ),
 * chỉ chặn chọn thêm ghế không trống hoặc vượt giới hạn.
 */
export function toggleSeat(
  selected: string[],
  label: string,
  status: SeatStatus | undefined,
  limit = MAX_SEATS_PER_BOOKING,
): ToggleResult {
  if (selected.includes(label)) return { ok: true, selected: selected.filter((s) => s !== label) };
  if (status !== "available") return { ok: false, reason: "unavailable", selected };
  if (selected.length >= limit) return { ok: false, reason: "limit", selected };
  return { ok: true, selected: sortSeats([...selected, label]) };
}

/** Ghế đang chọn nhưng không còn trống theo dữ liệu mới nhất. */
export function unavailableSelected(selected: string[], statuses: Map<string, SeatStatus>): string[] {
  return selected.filter((s) => statuses.get(s) !== "available");
}

/**
 * Khóa idempotency gắn với (suất chiếu + bộ ghế). Bấm lại/gửi lại cùng lựa chọn dùng lại khóa cũ
 * -> backend trả về đúng vé cũ, không tạo vé trùng; đổi lựa chọn thì sinh khóa mới.
 */
function selectionFingerprint(showtimeId: string, seats: string[]): string {
  return `${showtimeId}|${sortSeats(seats).join(",")}`;
}

export class IdempotencyKeys {
  private keys = new Map<string, string>();

  constructor(private readonly generate: () => string = () => crypto.randomUUID()) {}

  keyFor(showtimeId: string, seats: string[]): string {
    const fingerprint = selectionFingerprint(showtimeId, seats);
    let key = this.keys.get(fingerprint);
    if (!key) {
      key = this.generate();
      this.keys.set(fingerprint, key);
    }
    return key;
  }

  /** Gọi khi backend báo xung đột ghế: lần thử sau với cùng lựa chọn phải là yêu cầu mới. */
  forget(showtimeId: string, seats: string[]) {
    this.keys.delete(selectionFingerprint(showtimeId, seats));
  }
}
