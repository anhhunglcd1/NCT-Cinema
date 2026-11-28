import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireLogin } from "@/components/RequireLogin";
import { TicketDetail } from "@/features/booking/components/ticket-detail";

export const metadata: Metadata = { title: "Chi tiết vé" };

export default function TicketPage({ params }: PageProps<"/my-tickets/[id]">) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Suspense fallback={<Skeleton className="mx-auto h-80 max-w-xl rounded-xl" />}>
        <TicketContent params={params} />
      </Suspense>
    </div>
  );
}

async function TicketContent({ params }: { params: PageProps<"/my-tickets/[id]">["params"] }) {
  const { id } = await params;
  return (
    <RequireLogin>
      <TicketDetail ticketId={id} />
    </RequireLogin>
  );
}
