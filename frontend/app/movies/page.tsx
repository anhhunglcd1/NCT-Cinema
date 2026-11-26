import type { Metadata } from "next";
import { Suspense } from "react";
import { MovieGrid } from "@/components/MovieCard";
import { BACKEND_DOWN_HINT, EmptyState, ErrorState, MovieGridSkeleton, PageTitle } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import { MovieFilters } from "@/features/catalog/components/movie-filters";
import { getMovies } from "@/features/catalog/server";
import { tryBackend } from "@/lib/api/server";
import type { MovieStatus } from "@/lib/api/types";

export const metadata: Metadata = { title: "Phim" };

export default function MoviesPage({ searchParams }: PageProps<"/movies">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTitle title="Phim" description="Tìm phim theo tên, thể loại và trạng thái chiếu.">
        <Suspense fallback={<Skeleton className="h-9 w-full sm:w-[34rem]" />}>
          <MovieFilters />
        </Suspense>
      </PageTitle>
      <Suspense fallback={<MovieGridSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function Results({ searchParams }: { searchParams: PageProps<"/movies">["searchParams"] }) {
  const params = await searchParams;
  const query = first(params.query)?.trim() || undefined;
  const rawStatus = first(params.status);
  const status: MovieStatus | undefined =
    rawStatus === "nowPlaying" || rawStatus === "comingSoon" ? rawStatus : undefined;

  const result = await tryBackend(() => getMovies({ query, status }));
  if (!result.ok) return <ErrorState description={BACKEND_DOWN_HINT} />;
  if (result.data.length === 0) {
    return <EmptyState title="Không tìm thấy phim phù hợp" description="Thử từ khóa khác hoặc bỏ bớt bộ lọc." />;
  }
  return <MovieGrid movies={result.data} priorityCount={5} />;
}
