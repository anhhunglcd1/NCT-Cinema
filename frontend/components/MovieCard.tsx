import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Poster } from "@/features/catalog/components/poster";
import { formatDuration } from "@/lib/format";
import type { Movie } from "@/lib/api/types";

export function MovieCard({ movie, priority }: { movie: Movie; priority?: boolean }) {
  return (
    <Link href={`/movies/${movie.id}`} className="group flex flex-col gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="relative">
        <Poster
          src={movie.poster}
          title={movie.title}
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <Badge className="absolute top-2 left-2" variant="secondary">
          {movie.rating}
        </Badge>
        {movie.status === "comingSoon" && <Badge className="absolute top-2 right-2">Sắp chiếu</Badge>}
      </div>
      <div className="space-y-1">
        <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-primary">{movie.title}</h3>
        <p className="flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
          <Clock className="size-3 shrink-0" />
          {formatDuration(movie.duration)}
        </p>
        <p className="truncate text-xs text-muted-foreground">{movie.genres.join(", ")}</p>
      </div>
    </Link>
  );
}

export function MovieGrid({ movies, priorityCount = 0 }: { movies: Movie[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {movies.map((movie, i) => (
        <MovieCard key={movie.id} movie={movie} priority={i < priorityCount} />
      ))}
    </div>
  );
}
