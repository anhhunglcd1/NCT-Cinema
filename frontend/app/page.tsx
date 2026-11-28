import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieGrid } from "@/components/MovieCard";
import { BACKEND_DOWN_HINT, ErrorState, MovieGridSkeleton } from "@/components/states";
import { getMovies } from "@/features/catalog/server";
import { tryBackend } from "@/lib/api/server";
import type { MovieStatus } from "@/lib/api/types";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/25 via-background to-background px-6 py-12 sm:px-10">
        <div className="max-w-xl space-y-4">
          <p className="text-sm font-medium text-primary">NCT Cinema</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Chọn phim, chọn ghế, giữ chỗ trong vài phút.</h1>
          <p className="text-muted-foreground">
            Xem lịch chiếu tại các rạp NCT, giữ ghế trong 5 phút và theo dõi vé đã đặt.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/movies">
                <Ticket /> Đặt vé ngay
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/my-tickets">Vé của tôi</Link>
            </Button>
          </div>
        </div>
      </section>

      <MovieSection title="Phim đang chiếu" status="nowPlaying" priority />
      <MovieSection title="Phim sắp chiếu" status="comingSoon" />
    </div>
  );
}

function MovieSection({ title, status, priority }: { title: string; status: MovieStatus; priority?: boolean }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <Link href={`/movies?status=${status}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          Xem tất cả <ArrowRight className="size-4" />
        </Link>
      </div>
      <Suspense fallback={<MovieGridSkeleton count={5} />}>
        <MovieList status={status} priority={priority} />
      </Suspense>
    </section>
  );
}

async function MovieList({ status, priority }: { status: MovieStatus; priority?: boolean }) {
  const result = await tryBackend(() => getMovies({ status }));
  if (!result.ok) return <ErrorState description={BACKEND_DOWN_HINT} />;
  if (result.data.length === 0) return <p className="text-sm text-muted-foreground">Chưa có phim.</p>;
  return <MovieGrid movies={result.data.slice(0, 10)} priorityCount={priority ? 5 : 0} />;
}
