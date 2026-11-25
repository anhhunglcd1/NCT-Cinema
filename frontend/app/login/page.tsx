import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <div className="flex justify-center px-4 py-12">
      <Suspense fallback={<Skeleton className="h-[420px] w-full max-w-md rounded-xl" />}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
