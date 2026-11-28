"use client";

import { useMutation, useQuery, useQueryClient, type Query } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import type { Availability, BookingInput, Ticket } from "@/lib/api/types";

/**
 * Vé hủy được khi: đang giữ chỗ, hoặc đã xác nhận nhưng không phải thanh toán VNPAY thật
 * (vé VNPAY đã trả tiền phải để rạp xử lý hoàn tiền — backend cũng chặn). Gọi kèm điều kiện suất chưa chiếu.
 */
export function canCancel(ticket: Ticket): boolean {
  if (ticket.status === "pending") return true;
  return ticket.status === "confirmed" && !(ticket.paymentStatus === "paid" && ticket.paymentProvider === "vnpay");
}

export const seatsKey =(showtimeId: string) => ["seats", showtimeId] as const;
export const ticketsKey = ["tickets"] as const;
export const ticketKey = (id: string) => ["ticket", id] as const;

/**
 * Sơ đồ ghế của một suất. Mỗi lần gọi backend khóa phòng để dọn vé hết hạn,
 * nên chỉ làm mới mỗi 15 giây (và khi quay lại tab).
 */
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

export function useMyTickets(enabled = true) {
  return useQuery({
    queryKey: ticketsKey,
    queryFn: () => api<Ticket[]>("/api/tickets"),
    enabled,
    // Còn vé đang giữ chỗ thì cập nhật định kỳ (vé có thể hết hạn hoặc được thanh toán ở tab khác).
    refetchInterval: (query) => (query.state.data?.some((t) => t.status === "pending") ? 15_000 : false),
  });
}

type TicketQuery = Query<Ticket, Error, Ticket, ReturnType<typeof ticketKey>>;
type Interval = number | false | ((query: TicketQuery) => number | false | undefined);

export function useTicket(id: string, options: { enabled?: boolean; refetchInterval?: Interval } = {}) {
  return useQuery({
    queryKey: ticketKey(id),
    queryFn: () => api<Ticket>(`/api/tickets/${encodeURIComponent(id)}`),
    enabled: options.enabled ?? true,
    // Mặc định: vé đang giữ chỗ thì cập nhật mỗi 10 giây.
    refetchInterval: options.refetchInterval ?? ((query) => (query.state.data?.status === "pending" ? 10_000 : false)),
  });
}

export function useCancelTicket() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<Ticket>(`/api/tickets/${encodeURIComponent(id)}/cancel`, { method: "POST" }),
    onSuccess: (ticket) => {
      client.setQueryData(ticketKey(ticket.id), ticket);
      client.invalidateQueries({ queryKey: ticketsKey });
      client.invalidateQueries({ queryKey: ["payment", ticket.id] });
      client.invalidateQueries({ queryKey: seatsKey(ticket.showtimeId) });
      client.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
