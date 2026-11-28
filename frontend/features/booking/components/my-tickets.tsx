"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState } from "@/components/states";
import { HoldCountdown } from "@/components/HoldCountdown";
import { Poster } from "@/features/catalog/components/poster";
import { indexCatalog, useCatalog } from "@/features/catalog/api";
import { errorMessage } from "@/lib/api/http";
import { useNow } from "@/hooks/use-now";
import { useRefetchAfter } from "@/hooks/use-refetch-after";
import { formatDay, formatVnd } from "@/lib/format";
import type { Ticket } from "@/lib/api/types";
import { useMyTickets } from "../api";
import { TicketStatusBadge } from "./ticket-status";

const FILTERS = {
  all: { label: "Tất cả", match: () => true },
  pending: { label: "Đang giữ chỗ", match: (t: Ticket) => t.status === "pending" },
  confirmed: { label: "Đã xác nhận", match: (t: Ticket) => t.status === "confirmed" },
  closed: { label: "Đã hủy / hết hạn", match: (t: Ticket) => t.status === "cancelled" || t.status === "expired" },
} as const;
type Filter = keyof typeof FILTERS;

export function MyTickets() {
  const tickets = useMyTickets();
  const catalog = useCatalog();
  const index = useMemo(() => indexCatalog(catalog.data), [catalog.data]);
  const [filter, setFilter] = useState<Filter>("all");
  const now = useNow();
  const nextDeadline = tickets.data
    ?.filter((t) => t.status === "pending")
    .map((t) => t.expiresAt)
    .sort()[0];
  useRefetchAfter(nextDeadline, () => tickets.refetch());

  if (tickets.isPending || catalog.isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }
  if (tickets.error || catalog.error) {
    return <ErrorState description={errorMessage(tickets.error ?? catalog.error)} action={<Button variant="outline" onClick={() => tickets.refetch()}>Thử lại</Button>} />;
  }

  const list = tickets.data.filter(FILTERS[filter].match);

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="flex-wrap">
          {(Object.keys(FILTERS) as Filter[]).map((key) => (
            <TabsTrigger key={key} value={key}>
              {FILTERS[key].label}
              <span className="ml-1 text-xs text-muted-foreground">({tickets.data.filter(FILTERS[key].match).length})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState
          title={tickets.data.length === 0 ? "Bạn chưa có vé nào" : "Không có vé trong mục này"}
          action={
            <Button asChild>
              <Link href="/movies">Đặt vé ngay</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {list.map((ticket) => {
            const movie = index.movie(ticket.movieId);
            const cinema = index.cinema(ticket.cinemaId);
            const showtime = index.showtime(ticket.showtimeId);
            const holding = ticket.status === "pending" && new Date(ticket.expiresAt).getTime() > now;
            return (
              <li key={ticket.id}>
                <Card className="py-0 transition-colors hover:bg-muted/40">
                  <CardContent className="flex gap-4 p-3">
                    <Poster src={movie?.poster ?? ""} title={movie?.title ?? "Phim"} className="w-16 shrink-0" sizes="64px" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <TicketStatusBadge status={ticket.status} />
                      </div>
                      <p className="truncate font-medium">{movie?.title ?? ticket.movieId}</p>
                      <p className="text-sm text-muted-foreground">
                        {cinema?.name}
                        {showtime && (
                          <span className="capitalize">
                            {" "}
                            · {showtime.time} {formatDay(showtime.date)}
                          </span>
                        )}{" "}
                        · Ghế {ticket.seats.join(", ")} · {formatVnd(ticket.total)}
                      </p>
                      {holding && <HoldCountdown expiresAt={ticket.expiresAt} className="py-0.5" />}
                    </div>
                    <div className="flex shrink-0 flex-col items-end justify-center gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/my-tickets/${ticket.id}`}>
                          Chi tiết <ChevronRight />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
