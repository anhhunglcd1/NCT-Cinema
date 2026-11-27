"use client";

import { useState } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDelete } from "@/components/confirm-action";
import { ErrorState, PageTitle } from "@/components/states";
import { errorMessage } from "@/lib/api/http";
import { formatDuration } from "@/lib/format";
import type { Movie } from "@/lib/api/types";
import { useAdminCatalog, useDeleteMovie } from "../../admin-api";
import { Poster } from "../poster";
import { MovieForm } from "./movie-form";

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");

export function MoviesAdmin() {
  const catalog = useAdminCatalog();
  const deleteMovie = useDeleteMovie();
  const [editing, setEditing] = useState<Movie | "new" | null>(null);
  const [query, setQuery] = useState("");

  if (catalog.isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (catalog.error) return <ErrorState description={errorMessage(catalog.error)} />;

  const showCount = new Map<string, number>();
  for (const s of catalog.data.showtimes) showCount.set(s.movieId, (showCount.get(s.movieId) ?? 0) + 1);
  const movies = catalog.data.movies.filter((m) => normalize(`${m.title} ${m.genres.join(" ")}`).includes(normalize(query.trim())));

  return (
    <div>
      <PageTitle title="Phim" description={`${catalog.data.movies.length} phim trong danh mục.`}>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm phim…" className="w-48 pl-8" aria-label="Tìm phim" />
          </div>
          <Button onClick={() => setEditing("new")}>
            <Plus /> Thêm phim
          </Button>
        </div>
      </PageTitle>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Tên phim</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden md:table-cell">Thời lượng</TableHead>
              <TableHead className="hidden lg:table-cell">Thể loại</TableHead>
              <TableHead className="text-right">Suất</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {movies.map((movie) => (
              <TableRow key={movie.id}>
                <TableCell>
                  <Poster src={movie.poster} title={movie.title} className="w-10" sizes="40px" />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{movie.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {movie.rating} · <span className="font-mono">{movie.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={movie.status === "nowPlaying" ? "default" : "secondary"}>
                    {movie.status === "nowPlaying" ? "Đang chiếu" : "Sắp chiếu"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDuration(movie.duration)}</TableCell>
                <TableCell className="hidden max-w-56 truncate lg:table-cell">{movie.genres.join(", ")}</TableCell>
                <TableCell className="text-right tabular-nums">{showCount.get(movie.id) ?? 0}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" aria-label={`Sửa ${movie.title}`} onClick={() => setEditing(movie)}>
                      <Pencil />
                    </Button>
                    <ConfirmDelete
                      title={`Xóa phim "${movie.title}"?`}
                      description="Các suất chiếu chưa có vé của phim cũng sẽ bị xóa. Phim đã có vé sẽ không xóa được."
                      disabled={deleteMovie.isPending}
                      onConfirm={() =>
                        deleteMovie.mutate(movie.id, {
                          onSuccess: () => toast.success("Đã xóa phim."),
                          onError: (e) => toast.error(errorMessage(e)),
                        })
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {movies.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Không có phim phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Thêm phim" : "Sửa phim"}</DialogTitle>
            <DialogDescription>Thời lượng dùng để kiểm tra trùng lịch trong cùng phòng chiếu.</DialogDescription>
          </DialogHeader>
          {editing !== null && (
            <MovieForm key={editing === "new" ? "new" : editing.id} movie={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
