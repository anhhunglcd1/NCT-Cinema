"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Ticket as TicketIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/states";
import { HoldCountdown } from "@/components/HoldCountdown";
import { SeatMap } from "@/features/booking/components/seat-map";
import { useReserve, useSeats } from "@/features/booking/api";
import { indexCatalog, useCatalog } from "@/features/catalog/api";
import { useMe } from "@/features/auth-payment/auth";
import { useNow } from "@/hooks/use-now";
import { ApiError, errorMessage } from "@/lib/api/http";
import type { Ticket } from "@/lib/api/types";
import {
  IdempotencyKeys,
  MAX_SEATS_PER_BOOKING,
  statusMap,
  toggleSeat,
  unavailableSelected,
} from "@/lib/booking-state";
import { formatLongDay, formatVnd, showtimeStart } from "@/lib/format";

export function BookingFlow({ showtimeId }: { showtimeId: string }) {
  const router = useRouter();
  const catalog = useCatalog();
  const seats = useSeats(showtimeId);
  const me = useMe();
  const reserve = useReserve();
  const [selected, setSelected] = useState<string[]>([]);
  const [reserved, setReserved] = useState<Ticket | null>(null);
  const [keys] = useState(() => new IdempotencyKeys());
  const now = useNow();

  const index = useMemo(() => indexCatalog(catalog.data), [catalog.data]);
  const statuses = useMemo(() => statusMap(seats.data?.seats), [seats.data]);
  const showtime = index.showtime(showtimeId);
  const movie = showtime && index.movie(showtime.movieId);
  const cinema = showtime && index.cinema(showtime.cinemaId);
  const room = showtime && index.room(showtime.roomId);
  const lost = unavailableSelected(selected, statuses);

  if (catalog.isPending || seats.isPending) return <BookingSkeleton />;
  if (seats.error instanceof ApiError && seats.error.status === 404) {
    return <ErrorState title="Không tìm thấy suất chiếu" description="Suất chiếu có thể đã bị xóa." action={<Button asChild variant="outline"><Link href="/movies">Chọn phim khác</Link></Button>} />;
  }
  if (catalog.error || seats.error || !showtime || !room) {
    return <ErrorState description={errorMessage(catalog.error ?? seats.error)} action={<Button variant="outline" onClick={() => { catalog.refetch(); seats.refetch(); }}>Thử lại</Button>} />;
  }

  const started = showtimeStart(showtime).getTime() <= now;
  const total = showtime.price * selected.length;

  const onToggle = (label: string) => {
    const result = toggleSeat(selected, label, statuses.get(label));
    if (!result.ok) {
      toast.warning(result.reason === "limit" ? `Mỗi lần đặt tối đa ${MAX_SEATS_PER_BOOKING} ghế.` : `Ghế ${label} không còn trống.`);
      return;
    }
    setSelected(result.selected);
  };

  const onContinue = () => {
    if (!me.data) {
      router.push(`/login?next=${encodeURIComponent(`/booking/${showtimeId}`)}`);
      return;
    }
    const input = { showtimeId, seats: selected, idempotencyKey: keys.keyFor(showtimeId, selected) };
    reserve.mutate(input, {
      onSuccess: (ticket) => {
        setReserved(ticket);
        setSelected([]);
        toast.success(`Đã giữ ghế ${ticket.seats.join(", ")} trong 5 phút.`);
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 409) {
          keys.forget(showtimeId, selected);
          seats.refetch();
        }
        if (error instanceof ApiError && error.status === 401) {
          router.push(`/login?next=${encodeURIComponent(`/booking/${showtimeId}`)}`);
        }
        toast.error(errorMessage(error));
      },
    });
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={movie ? `/movies/${movie.id}` : "/movies"}>
          <ArrowLeft /> {movie ? movie.title : "Danh sách phim"}
        </Link>
      </Button>

      {reserved && (
        <Alert>
          <TicketIcon />
          <AlertTitle>Đã giữ ghế {reserved.seats.join(", ")} · Mã vé {reserved.id}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <HoldCountdown expiresAt={reserved.expiresAt} />
            <span>Trang thanh toán đang được tích hợp ở lượt sau.</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Chọn ghế · {room.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {started ? (
              <Alert variant="destructive">
                <AlertDescription>Suất chiếu đã bắt đầu, không thể đặt vé.</AlertDescription>
              </Alert>
            ) : (
              <SeatMap
                rows={room.rows}
                seatsPerRow={room.seatsPerRow}
                statuses={statuses}
                selected={selected}
                onToggle={onToggle}
                disabled={reserve.isPending}
              />
            )}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-lg">{movie?.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>
                {cinema?.name} · {room.name}
              </span>
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" />
              <span className="capitalize">
                {showtime.time} · {formatLongDay(showtime.date)}
              </span>
            </p>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ghế</span>
              <span className="text-right font-medium">{selected.length ? selected.join(", ") : "Chưa chọn"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giá vé</span>
              <span>{formatVnd(showtime.price)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Tạm tính</span>
              <span>{formatVnd(total)}</span>
            </div>
            {lost.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>Ghế {lost.join(", ")} vừa có người giữ. Vui lòng bỏ chọn và chọn ghế khác.</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              Ghế được giữ trong 5 phút sau khi bấm giữ chỗ.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" disabled={started || selected.length === 0 || lost.length > 0 || reserve.isPending} onClick={onContinue}>
              {reserve.isPending && <Spinner />}
              {me.data ? "Giữ ghế" : "Đăng nhập để đặt vé"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Skeleton className="h-[460px] rounded-xl" />
      <Skeleton className="h-[360px] rounded-xl" />
    </div>
  );
}
