import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminShell } from "@/components/admin/admin-shell";

export const instant = false;

export const metadata: Metadata = { title: { default: "Quản trị", template: "%s · Quản trị | NCT Cinema" } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </div>
  );
}
