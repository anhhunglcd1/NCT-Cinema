import { CalendarClock, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Poster } from "@/features/catalog/components/poster";
import { formatDuration, RATING_LABEL } from "@/lib/format";
import type { Movie } from "@/lib/api/types";

export function MovieDetails({ movie }: { movie: Movie }) {
  return (
    <div className="grid gap-8 md:grid-cols-[260px_1fr]">
      <Poster src={movie.poster} title={movie.title} priority sizes="260px" className="mx-auto w-full max-w-[260px]" />
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge>{movie.status === "nowPlaying" ? "Đang chiếu" : "Sắp chiếu"}</Badge>
            <Badge variant="secondary" title={RATING_LABEL[movie.rating]}>
              {movie.rating}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{movie.title}</h1>
        </div>
        <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <dt className="sr-only">Thời lượng</dt>
            <dd>{formatDuration(movie.duration)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="size-4" />
            <dt className="sr-only">Thể loại</dt>
            <dd>{movie.genres.join(", ")}</dd>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <CalendarClock className="size-4" />
            <dt className="sr-only">Phân loại</dt>
            <dd>{RATING_LABEL[movie.rating] ?? movie.rating}</dd>
          </div>
        </dl>
        <p className="leading-relaxed whitespace-pre-line">{movie.synopsis}</p>
        {movie.trailerUrl && (
          <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
            <iframe
              src={movie.trailerUrl}
              title={`Trailer ${movie.title}`}
              className="size-full"
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
