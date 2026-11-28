"use client";

import { CalendarDays, MapPin, Ticket as TicketIcon } from "lucide-react";
import { formatDateTime, formatLongDay, formatVnd } from "@/lib/format";
import type { Ticket } from "@/lib/api/types";
import type { CatalogIndex } from "@/features/catalog/api";
import { TicketStatusBadge } from "./ticket-status";

export function TicketSummary({ ticket, index }: { ticket: Ticket; index: CatalogIndex }) {
  const movie = index.movie(ticket.movieId);
  const cinema = index.cinema(ticket.cinemaId);
  const room = index.room(ticket.roomId);
  const showtime = index.showtime(ticket.showtimeId);

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <TicketStatusBadge status={ticket.status} />
      </div>
      <h2 className="text-lg font-semibold">{movie?.title ?? "Phim không còn trong danh mục"}</h2>
      <p className="flex items-start gap-2 text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0" />
        {cinema?.name ?? "Rạp"} · {room?.name ?? "Phòng"}
      </p>
      {showtime && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="size-4" />
          <span className="capitalize">
            {showtime.time} · {formatLongDay(showtime.date)}
          </span>
        </p>
      )}
      <p className="flex items-center gap-2">
        <TicketIcon className="size-4 text-muted-foreground" />
        Ghế <span className="font-medium">{ticket.seats.join(", ")}</span>
      </p>
      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-muted-foreground">Tổng tiền</span>
        <span className="text-base font-semibold">{formatVnd(ticket.total)}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Mã vé <span className="font-mono">{ticket.id}</span> · Đặt lúc {formatDateTime(ticket.bookedAt)}
      </p>
    </div>
  );
}
