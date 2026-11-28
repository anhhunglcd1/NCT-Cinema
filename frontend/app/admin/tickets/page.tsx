import type { Metadata } from "next";
import { AdminTickets } from "@/features/booking/components/admin-tickets";

// Nội dung chỉ hiện sau khi xác nhận quyền ADMIN ở client (xem app/admin/layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Vé" };

export default function AdminTicketsPage() {
  return <AdminTickets />;
}
