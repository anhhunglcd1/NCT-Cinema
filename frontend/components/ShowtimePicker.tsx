"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDay, formatVnd, showtimeStart } from "@/lib/format";
import type { Cinema, Room, Showtime } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Chọn ngày -> rạp -> giờ chiếu. `now` do server truyền xuống để render nhất quán giữa server/client.
 * Chỉ hiện suất chưa bắt đầu (backend cũng từ chối đặt vé suất đã chiếu).
 */
export function ShowtimePicker({
  showtimes,
  cinemas,
  rooms,
  now,
}: {
  showtimes: Showtime[];
  cinemas: Cinema[];
  rooms: Room[];
  now: number;
}) {
  const upcoming = useMemo(
    () =>
      showtimes
        .filter((s) => showtimeStart(s).getTime() > now)
        .sort((a, b) => showtimeStart(a).getTime() - showtimeStart(b).getTime()),
    [showtimes, now],
  );
  const dates = useMemo(() => [...new Set(upcoming.map((s) => s.date))], [upcoming]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(dates[0]);
  const activeDate = selectedDate && dates.includes(selectedDate) ? selectedDate : dates[0];

  if (upcoming.length === 0) {
    return <p className="text-sm text-muted-foreground">Hiện chưa có suất chiếu sắp tới cho phim này.</p>;
  }

  const roomName = new Map(rooms.map((r) => [r.id, r.name]));
  const byCinema = new Map<string, Showtime[]>();
  for (const s of upcoming.filter((s) => s.date === activeDate)) {
    byCinema.set(s.cinemaId, [...(byCinema.get(s.cinemaId) ?? []), s]);
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Chọn ngày chiếu">
        {dates.map((date) => (
          <button
            key={date}
            type="button"
            role="tab"
            aria-selected={date === activeDate}
            onClick={() => setSelectedDate(date)}
            className={cn(
              "min-w-20 shrink-0 rounded-lg border px-3 py-2 text-sm capitalize transition-colors",
              date === activeDate ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {formatDay(date)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {cinemas
          .filter((c) => byCinema.has(c.id))
          .map((cinema) => (
            <div key={cinema.id} className="rounded-lg border p-4">
              <div className="mb-3">
                <h3 className="font-medium">{cinema.name}</h3>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {cinema.address}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {byCinema.get(cinema.id)!.map((s) => (
                  <Button key={s.id} asChild variant="outline" className="h-auto flex-col gap-0 px-4 py-1.5">
                    <Link href={`/booking/${s.id}`}>
                      <span className="text-base font-semibold">{s.time}</span>
                      <span className="text-[11px] font-normal text-muted-foreground">
                        {roomName.get(s.roomId)} · {formatVnd(s.price)}
                      </span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
