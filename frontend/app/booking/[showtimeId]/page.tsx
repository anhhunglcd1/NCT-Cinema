import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingFlow } from "@/components/BookingFlow";

export const metadata: Metadata = { title: "Chọn ghế" };

export default function BookingPage({ params }: PageProps<"/booking/[showtimeId]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<Skeleton className="h-[460px] rounded-xl" />}>
        <Booking params={params} />
      </Suspense>
    </div>
  );
}

async function Booking({ params }: { params: PageProps<"/booking/[showtimeId]">["params"] }) {
  const { showtimeId } = await params;
  return <BookingFlow showtimeId={showtimeId} />;
}
