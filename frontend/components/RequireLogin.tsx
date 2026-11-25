"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states";
import { useMe } from "@/features/auth-payment/auth";
import { useHydrated } from "@/hooks/use-hydrated";
import { errorMessage } from "@/lib/api/http";

/**
 * Chỉ để hiển thị cho đúng; quyền thật sự do backend kiểm tra ở mọi API.
 * role="ADMIN" -> người không phải admin thấy thông báo không có quyền.
 */
export function RequireLogin({
  children,
  role,
}: {
  children: ReactNode;
  role?: "ADMIN";
}) {
  const pathname = usePathname();
  const me = useMe();
  const hydrated = useHydrated();

  if (!hydrated || me.isPending) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (me.error) return <ErrorState description={errorMessage(me.error)} />;
  if (!me.data) {
    return (
      <EmptyState
        title="Bạn cần đăng nhập"
        description="Đăng nhập để tiếp tục."
        action={
          <Button asChild>
            <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
              <LogIn /> Đăng nhập
            </Link>
          </Button>
        }
      />
    );
  }
  if (role && me.data.role !== role) {
    return <ErrorState title="Không có quyền truy cập" description="Trang này chỉ dành cho quản trị viên." />;
  }
  return <>{children}</>;
}
