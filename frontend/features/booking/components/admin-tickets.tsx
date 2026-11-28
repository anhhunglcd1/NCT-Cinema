"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmAction } from "@/components/confirm-action";
import { ErrorState, PageTitle } from "@/components/states";
import { useAdminCatalog } from "@/features/catalog/admin-api";
import { indexCatalog } from "@/features/catalog/api";
import { api, errorMessage } from "@/lib/api/http";
import { formatDateTime, formatDay, formatVnd, showtimeStart } from "@/lib/format";
import type { Ticket, TicketStatus } from "@/lib/api/types";
import { canCancel, seatsKey, ticketsKey } from "../api";
import { TicketStatusBadge } from "./ticket-status";

type Filter = "all" | TicketStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Đang giữ" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "expired", label: "Hết hạn" },
];
const PAGE = 50;

function useAdminCancel() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<Ticket>(`/api/admin/tickets/${encodeURIComponent(id)}/cancel`, { method: "POST" }),
    onSuccess: (ticket) => {
      client.invalidateQueries({ queryKey: ["admin"] });
      client.invalidateQueries({ queryKey: ticketsKey });
      client.invalidateQueries({ queryKey: seatsKey(ticket.showtimeId) });
    },
  });
}

export function AdminTickets() {
  const catalog = useAdminCatalog();
  const cancel = useAdminCancel();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [now] = useState(() => Date.now());
  const index = useMemo(() => indexCatalog(catalog.data), [catalog.data]);

  if (catalog.isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (catalog.error) return <ErrorState description={errorMessage(catalog.error)} />;

  const q = query.trim().toLowerCase();
  const tickets = catalog.data.tickets
    .filter((t) => filter === "all" || t.status === filter)
    .filter((t) => !q || t.id.toLowerCase().includes(q) || (index.movie(t.movieId)?.title.toLowerCase().includes(q) ?? false));

  return (
    <div>
      <PageTitle title="Vé" description={`${catalog.data.tickets.length} vé trong hệ thống.`}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mã vé hoặc tên phim…" className="w-60 pl-8" aria-label="Tìm vé" />
        </div>
      </PageTitle>
      <Tabs value={filter} onValueChange={(v) => { setFilter(v as Filter); setLimit(PAGE); }} className="mb-4">
        <TabsList className="flex-wrap">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã vé</TableHead>
              <TableHead>Phim · Suất</TableHead>
              <TableHead>Ghế</TableHead>
              <TableHead className="text-right">Tổng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden lg:table-cell">Đặt lúc</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.slice(0, limit).map((t) => {
              const showtime = index.showtime(t.showtimeId);
              const upcoming = showtime ? showtimeStart(showtime).getTime() > now : false;
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id.slice(0, 15)}…</TableCell>
                  <TableCell>
                    <div className="max-w-52 truncate">{index.movie(t.movieId)?.title ?? t.movieId}</div>
                    {showtime && (
                      <div className="text-xs text-muted-foreground capitalize">
                        {showtime.time} {formatDay(showtime.date)} · {index.cinema(t.cinemaId)?.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{t.seats.join(", ")}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatVnd(t.total)}</TableCell>
                  <TableCell>
                    <TicketStatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="hidden text-xs lg:table-cell">{formatDateTime(t.bookedAt)}</TableCell>
                  <TableCell>
                    {upcoming && canCancel(t) && (
                      <ConfirmAction
                        title={`Hủy vé ${t.seats.join(", ")}?`}
                        description="Ghế sẽ được trả lại."
                        confirmLabel="Hủy vé"
                        destructive
                        onConfirm={() =>
                          cancel.mutate(t.id, {
                            onSuccess: () => toast.success("Đã hủy vé."),
                            onError: (e) => toast.error(errorMessage(e)),
                          })
                        }
                        trigger={
                          <Button variant="outline" size="sm" disabled={cancel.isPending}>
                            Hủy
                          </Button>
                        }
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Không có vé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {tickets.length > limit && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setLimit((l) => l + PAGE)}>
            Xem thêm ({tickets.length - limit} vé)
          </Button>
        </div>
      )}
    </div>
  );
}
