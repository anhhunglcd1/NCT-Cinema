"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { formatCountdown } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Đồng hồ đếm ngược tới hạn giữ ghế (mốc tuyệt đối do backend trả về, không tự gia hạn).
 * Chỉ hiển thị; việc tải lại trạng thái vé khi hết giờ do hooks/use-refetch-after.ts đảm nhiệm.
 */
export function HoldCountdown({ expiresAt, className }: { expiresAt: string; className?: string }) {
  const deadline = new Date(expiresAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const left = now === null ? null : deadline - now;

  return (
    <div
      role="timer"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm tabular-nums",
        left !== null && left < 60_000 ? "border-destructive/50 text-destructive" : "text-muted-foreground",
        className,
      )}
    >
      <Timer className="size-4" />
      {left === null ? "--:--" : left <= 0 ? "Đã hết thời gian giữ ghế" : <>Giữ ghế còn {formatCountdown(left)}</>}
    </div>
  );
}
