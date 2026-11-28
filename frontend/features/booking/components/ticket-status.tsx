import { Badge } from "@/components/ui/badge";
import { TICKET_STATUS_LABEL } from "@/lib/format";
import type { TicketStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const TICKET_STYLE: Record<TicketStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  cancelled: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant="outline" className={cn(TICKET_STYLE[status])}>
      {TICKET_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
