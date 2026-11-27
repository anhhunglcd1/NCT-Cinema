import type { Metadata } from "next";
import { MoviesAdmin } from "@/features/catalog/components/admin/movies-admin";

// Nội dung chỉ hiện sau khi xác nhận quyền ADMIN ở client (xem app/admin/layout.tsx).
export const instant = false;

export const metadata: Metadata = { title: "Phim" };

export default function AdminMoviesPage() {
  return <MoviesAdmin />;
}
