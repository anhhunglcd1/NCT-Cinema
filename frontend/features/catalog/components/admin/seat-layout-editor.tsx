"use client";

import { toast } from "sonner";
import { seatGrid } from "@/lib/booking-state";
import { errorMessage } from "@/lib/api/http";
import type { Room } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useToggleSeat } from "../../admin-api";

/** Bấm vào ghế để khóa (hỏng, lối đi...) hoặc mở lại. Backend từ chối khóa ghế đang có vé/giữ chỗ. */
export function SeatLayoutEditor({ room }: { room: Room }) {
  const toggle = useToggleSeat();
  const blocked = new Set(room.blockedSeats);
  const grid = seatGrid(room.rows, room.seatsPerRow);

  return (
    <div className="space-y-4">
      <div className="mx-auto h-1.5 max-w-sm rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-max flex-col gap-1">
          {grid.map((row, r) => (
            <div key={r} className="flex items-center gap-1">
              <span className="w-5 text-center text-xs text-muted-foreground">{row[0][0]}</span>
              {row.map((label) => {
                const isBlocked = blocked.has(label);
                const pending = toggle.isPending && toggle.variables?.roomId === room.id && toggle.variables.label === label;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={toggle.isPending}
                    aria-pressed={isBlocked}
                    aria-label={`Ghế ${label}${isBlocked ? " đang khóa" : ""}`}
                    title={isBlocked ? `Mở ghế ${label}` : `Khóa ghế ${label}`}
                    onClick={() =>
                      toggle.mutate(
                        { roomId: room.id, label, enabled: isBlocked },
                        { onError: (e) => toast.error(errorMessage(e)) },
                      )
                    }
                    className={cn(
                      "size-7 rounded-t-md rounded-b-sm border text-[10px] transition-colors",
                      isBlocked
                        ? "border-dashed border-destructive/60 bg-destructive/10 text-destructive line-through"
                        : "hover:border-primary",
                      pending && "animate-pulse",
                    )}
                  >
                    {label.slice(1)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {room.blockedSeats.length > 0 ? `Đang khóa: ${room.blockedSeats.join(", ")}` : "Chưa khóa ghế nào."}
      </p>
    </div>
  );
}
