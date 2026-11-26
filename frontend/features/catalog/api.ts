"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import type { Catalog, Cinema, Movie, Room, Showtime } from "@/lib/api/types";

export const catalogKey = ["catalog"] as const;

/** Toàn bộ danh mục công khai (phim, rạp, phòng, suất). Dùng để ghép tên cho vé, trang đặt vé... */
export function useCatalog() {
  return useQuery({
    queryKey: catalogKey,
    queryFn: () => api<Catalog>("/api/catalog"),
    staleTime: 60_000,
  });
}

export interface CatalogIndex {
  movie: (id: string) => Movie | undefined;
  cinema: (id: string) => Cinema | undefined;
  room: (id: string) => Room | undefined;
  showtime: (id: string) => Showtime | undefined;
}

export function indexCatalog(catalog: Catalog | undefined): CatalogIndex {
  const movies = new Map(catalog?.movies.map((m) => [m.id, m]));
  const cinemas = new Map(catalog?.cinemas.map((c) => [c.id, c]));
  const rooms = new Map(catalog?.rooms.map((r) => [r.id, r]));
  const showtimes = new Map(catalog?.showtimes.map((s) => [s.id, s]));
  return {
    movie: (id) => movies.get(id),
    cinema: (id) => cinemas.get(id),
    room: (id) => rooms.get(id),
    showtime: (id) => showtimes.get(id),
  };
}
