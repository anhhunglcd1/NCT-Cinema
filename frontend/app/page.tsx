import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="rounded-2xl border bg-gradient-to-br from-primary/25 via-background to-background px-6 py-12 sm:px-10">
        <div className="max-w-xl space-y-4">
          <p className="text-sm font-medium text-primary">NCT Cinema</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Hệ thống đặt vé xem phim NCT Cinema</h1>
          <p className="text-muted-foreground">
            Đăng nhập hoặc tạo tài khoản để sẵn sàng cho phần danh mục phim và đặt vé sắp tới.
          </p>
          <Button asChild size="lg">
            <Link href="/login">Đăng nhập</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
