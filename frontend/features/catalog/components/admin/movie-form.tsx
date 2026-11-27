"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api/http";
import type { Movie } from "@/lib/api/types";
import { useSaveMovie } from "../../admin-api";

// Khớp Requests.MovieInput + kiểm tra trong CatalogService.saveMovie.
const schema = z.object({
  title: z.string().trim().min(1, "Nhập tên phim.").max(150),
  poster: z
    .string()
    .trim()
    .max(800)
    .refine((v) => v === "" || /^(https?:\/\/|\/(?!\/))/.test(v), "Dùng link http(s) hoặc đường dẫn bắt đầu bằng /."),
  status: z.enum(["nowPlaying", "comingSoon"]),
  genres: z
    .string()
    .refine((v) => splitGenres(v).length <= 12, "Tối đa 12 thể loại.")
    .refine((v) => splitGenres(v).every((g) => g.length <= 80), "Mỗi thể loại tối đa 80 ký tự."),
  duration: z.coerce.number<number>().int("Nhập số phút.").min(1, "Tối thiểu 1 phút.").max(600, "Tối đa 600 phút."),
  rating: z.enum(["P", "K", "T13", "T16", "T18"]),
  synopsis: z.string().trim().min(1, "Nhập tóm tắt.").max(3000),
  trailerUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (v) => v === "" || /^https:\/\/(www\.)?(youtube-nocookie\.com|youtube\.com)\/embed\/[A-Za-z0-9_-]{11}$/.test(v),
      "Dùng link nhúng YouTube dạng https://www.youtube.com/embed/<mã 11 ký tự>.",
    ),
});
type Values = z.infer<typeof schema>;

function splitGenres(value: string) {
  return value
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

export function MovieForm({ movie, onDone }: { movie?: Movie; onDone: () => void }) {
  const saveMovie = useSaveMovie();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: movie?.title ?? "",
      poster: movie?.poster ?? "",
      status: movie?.status ?? "nowPlaying",
      genres: movie?.genres.join(", ") ?? "",
      duration: movie?.duration ?? 120,
      rating: movie?.rating ?? "P",
      synopsis: movie?.synopsis ?? "",
      trailerUrl: movie?.trailerUrl ?? "",
    },
  });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) =>
    saveMovie.mutate(
      { id: movie?.id, input: { ...values, genres: splitGenres(values.genres) } },
      {
        onSuccess: () => {
          toast.success(movie ? "Đã cập nhật phim." : "Đã thêm phim.");
          onDone();
        },
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FieldGroup className="max-h-[65vh] gap-4 overflow-y-auto pr-1">
        {saveMovie.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(saveMovie.error)}</AlertDescription>
          </Alert>
        )}
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="movie-title">Tên phim</FieldLabel>
          <Input id="movie-title" {...form.register("title")} />
          <FieldError errors={[errors.title]} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={!!errors.status}>
            <FieldLabel>Trạng thái</FieldLabel>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nowPlaying">Đang chiếu</SelectItem>
                    <SelectItem value="comingSoon">Sắp chiếu</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field data-invalid={!!errors.rating}>
            <FieldLabel>Phân loại</FieldLabel>
            <Controller
              control={form.control}
              name="rating"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["P", "K", "T13", "T16", "T18"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field data-invalid={!!errors.duration}>
            <FieldLabel htmlFor="movie-duration">Thời lượng (phút)</FieldLabel>
            <Input id="movie-duration" type="number" min={1} max={600} {...form.register("duration")} />
            <FieldError errors={[errors.duration]} />
          </Field>
        </div>
        <Field data-invalid={!!errors.genres}>
          <FieldLabel htmlFor="movie-genres">Thể loại</FieldLabel>
          <Input id="movie-genres" placeholder="Hành động, Viễn tưởng" {...form.register("genres")} />
          <FieldDescription>Phân tách bằng dấu phẩy.</FieldDescription>
          <FieldError errors={[errors.genres]} />
        </Field>
        <Field data-invalid={!!errors.poster}>
          <FieldLabel htmlFor="movie-poster">Poster</FieldLabel>
          <Input id="movie-poster" placeholder="https://… hoặc /posters/ten-file.jpg" {...form.register("poster")} />
          <FieldError errors={[errors.poster]} />
        </Field>
        <Field data-invalid={!!errors.trailerUrl}>
          <FieldLabel htmlFor="movie-trailer">Trailer (link nhúng YouTube)</FieldLabel>
          <Input id="movie-trailer" placeholder="https://www.youtube.com/embed/xxxxxxxxxxx" {...form.register("trailerUrl")} />
          <FieldError errors={[errors.trailerUrl]} />
        </Field>
        <Field data-invalid={!!errors.synopsis}>
          <FieldLabel htmlFor="movie-synopsis">Tóm tắt</FieldLabel>
          <Textarea id="movie-synopsis" rows={5} {...form.register("synopsis")} />
          <FieldError errors={[errors.synopsis]} />
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Hủy
          </Button>
        </DialogClose>
        <Button type="submit" disabled={saveMovie.isPending}>
          {saveMovie.isPending && <Spinner />} {movie ? "Lưu thay đổi" : "Thêm phim"}
        </Button>
      </DialogFooter>
    </form>
  );
}
