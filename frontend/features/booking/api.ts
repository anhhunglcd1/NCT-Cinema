"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import type { Availability, BookingInput, Ticket } from "@/lib/api/types";

export const seatsKey = (showtimeId: string) => ["seats", showtimeId] as const;
export const ticketsKey = ["tickets"] as const;
export const ticketKey = (id: string) => ["ticket", id] as const;

export function useSeats(showtimeId: string) {
  return useQuery({
    queryKey: seatsKey(showtimeId),
    queryFn: () => api<Availability>(`/api/showtimes/${encodeURIComponent(showtimeId)}/seats`),
    refetchInterval: 15_000,
    staleTime: 5_000,
  });
}

export function useReserve() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: BookingInput) => api<Ticket>("/api/tickets", { method: "POST", body: input }),
    onSuccess: (ticket) => {
      client.setQueryData(ticketKey(ticket.id), ticket);
      client.invalidateQueries({ queryKey: ticketsKey });
      client.invalidateQueries({ queryKey: seatsKey(ticket.showtimeId) });
    },
  });
}
