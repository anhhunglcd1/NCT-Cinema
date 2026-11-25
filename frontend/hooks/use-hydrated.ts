"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false khi render ở server và trong lần hydrate đầu tiên, true sau đó.
 * Dùng cho component đọc cache TanStack Query (ví dụ thông tin đăng nhập): cache có thể đã có dữ liệu
 * trước khi một vùng <Suspense> hydrate xong, làm HTML client lệch với server (hydration mismatch).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
