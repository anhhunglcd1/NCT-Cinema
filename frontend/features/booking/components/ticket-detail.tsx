"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmAction } from "@/components/confirm-action";
import { ErrorState } from "@/components/states";
import { indexCatalog, useCatalog } from "@/features/catalog/api";
import { ApiError, errorMessage } from "@/lib/api/http";
import { showtimeStart } from "@/lib/format";
import { useNow } from "@/hooks/use-now";
import { canCancel, useCancelTicket, useTicket } from "../api";
import { TicketSummary } from "./ticket-summary";

export function TicketDetail({ ticketId }: { ticketId: string }) {
  const ticket = useTicket(ticketId);
  const catalog = useCatalog();
  const index = useMemo(() => indexCatalog(catalog.data), [catalog.data]);
  const cancel = useCancelTicket();
  const now = useNow();

  if (ticket.isPending || catalog.isPending) return <Skeleton className="h-80 rounded-xl" />;
  if (ticket.error instanceof ApiError && ticket.error.status === 404) {
    return <ErrorState title="Không tìm thấy vé" description="Vé không tồn tại hoặc không thuộc tài khoản của bạn." />;
  }
  if (ticket.error || !ticket.data) return <ErrorState description={errorMessage(ticket.error)} />;

  const t = ticket.data;
  const showtime = index.showtime(t.showtimeId);
  const notStarted = showtime ? showtimeStart(showtime).getTime() > now : false;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/my-tickets">
          <ArrowLeft /> Vé của tôi
        </Link>
      </Button>
      <Card>
        <CardContent className="space-y-6">
          <TicketSummary ticket={t} index={index} />
          {t.status === "confirmed" && (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-xs text-muted-foreground">Đưa mã này cho nhân viên soát vé</p>
              <p className="mt-1 font-mono text-lg font-semibold tracking-wider break-all">{t.id}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          {notStarted && canCancel(t) && (
            <ConfirmAction
              title={`Hủy vé ${t.seats.join(", ")}?`}
              description="Ghế sẽ được trả lại. Thao tác không thể hoàn tác."
              confirmLabel="Hủy vé"
              onConfirm={() =>
                cancel.mutate(t.id, {
                  onSuccess: () => toast.success("Đã hủy vé."),
                  onError: (e) => toast.error(errorMessage(e)),
                })
              }
              trigger={
                <Button variant="outline" disabled={cancel.isPending}>
                  Hủy vé
                </Button>
              }
            />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
