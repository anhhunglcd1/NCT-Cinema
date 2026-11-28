"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import type {
  AdminCatalog,
  Cinema,
  CinemaInput,
  Movie,
  MovieInput,
  Room,
  RoomInput,
} from "@/lib/api/types";
import { catalogKey } from "./api";

const adminCatalogKey = ["admin", "catalog"] as const;

export function useAdminCatalog() {
  return useQuery({
    queryKey: adminCatalogKey,
    queryFn: () => api<AdminCatalog>("/api/admin/catalog"),
  });
}

function useAdminMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin"] });
      client.invalidateQueries({ queryKey: catalogKey });
    },
  });
}

type Upsert<T> = { id?: string; input: T };
const save = <TIn, TOut>(base: string) => ({ id, input }: Upsert<TIn>) =>
  api<TOut>(id ? `${base}/${encodeURIComponent(id)}` : base, { method: id ? "PUT" : "POST", body: input });
const remove = (base: string) => (id: string) => api<void>(`${base}/${encodeURIComponent(id)}`, { method: "DELETE" });

export const useSaveMovie = () => useAdminMutation(save<MovieInput, Movie>("/api/admin/movies"));
export const useDeleteMovie = () => useAdminMutation(remove("/api/admin/movies"));
export const useSaveCinema = () => useAdminMutation(save<CinemaInput, Cinema>("/api/admin/cinemas"));
export const useDeleteCinema = () => useAdminMutation(remove("/api/admin/cinemas"));
export const useSaveRoom = () => useAdminMutation(save<RoomInput, Room>("/api/admin/rooms"));
export const useDeleteRoom = () => useAdminMutation(remove("/api/admin/rooms"));

export const useToggleSeat = () =>
  useAdminMutation(({ roomId, label, enabled }: { roomId: string; label: string; enabled: boolean }) =>
    api<Room>(`/api/admin/rooms/${encodeURIComponent(roomId)}/seats/${encodeURIComponent(label)}`, {
      method: "PATCH",
      body: { enabled },
    }),
  );
