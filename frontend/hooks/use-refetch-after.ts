"use client";

import { useEffect, useRef } from "react";

/**
 * Gọi `refetch` một lần ngay sau mốc `deadline` (ISO) + `delayMs`.
 * Dùng để tải lại trạng thái vé khi hết giờ giữ ghế, không phụ thuộc vào việc
 * đồng hồ đếm ngược còn hiển thị hay không. Backend dọn vé hết hạn mỗi giây,
 * nên chờ thêm một chút cho chắc.
 */
export function useRefetchAfter(deadline: string | undefined, refetch: () => void, delayMs = 1_500) {
  const latest = useRef(refetch);
  useEffect(() => {
    latest.current = refetch;
  });

  useEffect(() => {
    if (!deadline) return;
    const wait = new Date(deadline).getTime() + delayMs - Date.now();
    if (wait < -60_000) return; // đã qua hạn từ lâu, dữ liệu đã được tải sau đó
    const timer = setTimeout(() => latest.current(), Math.max(0, wait));
    return () => clearTimeout(timer);
  }, [deadline, delayMs]);
}
