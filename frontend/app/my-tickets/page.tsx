import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTitle } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireLogin } from "@/components/RequireLogin";
import { MyTickets } from "@/features/booking/components/my-tickets";

export const metadata: Metadata = { title: "Vé của tôi" };

export default function MyTicketsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageTitle title="Vé của tôi" description="Theo dõi vé đang giữ, đã thanh toán và lịch sử đặt vé." />
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <RequireLogin>
          <MyTickets />
        </RequireLogin>
      </Suspense>
    </div>
  );
}
