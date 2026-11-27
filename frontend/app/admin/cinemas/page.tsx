import type { Metadata } from "next";
import { CinemasAdmin } from "@/features/catalog/components/admin/cinemas-admin";

// Nội dung chỉ hiện sau khi xác nhận quyền ADMIN ở client (xem app/admin/layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Rạp & phòng" };

export default function AdminCinemasPage() {
  return <CinemasAdmin />;
}
