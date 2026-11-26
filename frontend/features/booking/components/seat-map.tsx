"use client";

import { seatGrid } from "@/lib/booking-state";
import type { SeatStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const LEGEND: { label: string; className: string }[] = [
  { label: "Trống", className: "border-border bg-background" },
  { label: "Đang chọn", className: "border-primary bg-primary" },
  { label: "Đã có người", className: "border-transparent bg-muted-foreground/40" },
  { label: "Không sử dụng", className: "border-dashed border-muted-foreground/40 bg-transparent" },
];

export function SeatMap({
  rows,
  seatsPerRow,
  statuses,
  selected,
  onToggle,
  disabled,
}: {
  rows: number;
  seatsPerRow: number;
  statuses: Map<string, SeatStatus>;
  selected: string[];
  onToggle: (label: string) => void;
  disabled?: boolean;
}) {
  const grid = seatGrid(rows, seatsPerRow);
  const chosen = new Set(selected);

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-md">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        <p className="mt-1 text-center text-xs tracking-widest text-muted-foreground uppercase">Màn hình</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-max flex-col gap-1.5" role="group" aria-label="Sơ đồ ghế">
          {grid.map((row, r) => (
            <div key={r} className="flex items-center gap-1.5" role="group" aria-label={`Hàng ${row[0][0]}`}>
              <span className="w-5 text-center text-xs text-muted-foreground" aria-hidden>
                {row[0][0]}
              </span>
              {row.map((label) => {
                const status = statuses.get(label) ?? "occupied";
                const isSelected = chosen.has(label);
                const unavailable = status !== "available";
                return (
                  <button
                    key={label}
                    type="button"
                    aria-label={`Ghế ${label}${isSelected ? ", đang chọn" : unavailable ? ", không trống" : ""}`}
                    aria-pressed={isSelected}
                    disabled={disabled || (unavailable && !isSelected)}
                    onClick={() => onToggle(label)}
                    className={cn(
                      "size-8 rounded-t-lg rounded-b-sm border text-[10px] font-medium transition-colors sm:size-9",
                      isSelected && "border-primary bg-primary text-primary-foreground",
                      isSelected && unavailable && "ring-2 ring-destructive",
                      !isSelected && status === "available" && "bg-background hover:border-primary hover:bg-primary/10",
                      !isSelected && status === "occupied" && "cursor-not-allowed border-transparent bg-muted-foreground/40 text-transparent",
                      !isSelected && status === "blocked" && "cursor-not-allowed border-dashed border-muted-foreground/40 text-transparent",
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

      <ul className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span className={cn("inline-block size-4 rounded-t-md rounded-b-sm border", item.className)} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
