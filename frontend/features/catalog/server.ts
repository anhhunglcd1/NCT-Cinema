import "server-only";
import { cache } from "react";
import { serverGet } from "@/lib/api/server";
import type { Catalog, Movie, MovieStatus } from "@/lib/api/types";

/** Dữ liệu công khai đọc từ Server Component. Luôn mới (không cache) -> dùng trong <Suspense>. */

export async function getCatalog(): Promise<Catalog> {
  return (await serverGet<Catalog>("/api/catalog")) ?? { movies: [], cinemas: [], rooms: [], showtimes: [] };
}

export async function getMovies(params: { query?: string; status?: MovieStatus } = {}): Promise<Movie[]> {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();
  return (await serverGet<Movie[]>(`/api/movies${qs ? `?${qs}` : ""}`)) ?? [];
}

/** Bọc bằng React cache: trang và generateMetadata cùng gọi nhưng chỉ tốn 1 request mỗi lượt render. */
export const getMovie = cache(async (id: string): Promise<Movie | null> => {
  return serverGet<Movie>(`/api/movies/${encodeURIComponent(id)}`);
});

