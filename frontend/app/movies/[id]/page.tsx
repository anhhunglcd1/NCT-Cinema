import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BACKEND_DOWN_HINT, ErrorState } from "@/components/states";
import { MovieDetails } from "@/components/MovieDetails";
import { ShowtimePicker } from "@/components/ShowtimePicker";
import { Skeleton } from "@/components/ui/skeleton";
import { getCatalog, getMovie } from "@/features/catalog/server";
import { tryBackend } from "@/lib/api/server";

export async function generateMetadata({ params }: PageProps<"/movies/[id]">): Promise<Metadata> {
  const { id } = await params;
  const result = await tryBackend(() => getMovie(id));
  if (!result.ok || !result.data) return { title: "Phim" };
  return { title: result.data.title, description: result.data.synopsis.slice(0, 160) };
}

export default function MoviePage({ params }: PageProps<"/movies/[id]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<MovieSkeleton />}>
        <MovieContent params={params} />
      </Suspense>
    </div>
  );
}

async function MovieContent({ params }: { params: PageProps<"/movies/[id]">["params"] }) {
  const { id } = await params;
  const result = await tryBackend(() => Promise.all([getMovie(id), getCatalog()]));
  if (!result.ok) return <ErrorState description={BACKEND_DOWN_HINT} />;
  const [movie, catalog] = result.data;
  if (!movie) notFound();
  const showtimes = catalog.showtimes.filter((s) => s.movieId === movie.id);
  return (
    <div className="space-y-10">
      <MovieDetails movie={movie} />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Lịch chiếu</h2>
        <ShowtimePicker showtimes={showtimes} cinemas={catalog.cinemas} rooms={catalog.rooms} now={result.at} />
      </section>
    </div>
  );
}

function MovieSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-[260px_1fr]">
      <Skeleton className="aspect-[2/3] w-full max-w-[260px] rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="aspect-video w-full" />
      </div>
    </div>
  );
}
