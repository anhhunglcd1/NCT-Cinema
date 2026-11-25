import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <EmptyState
        title="Không tìm thấy trang"
        description="Trang bạn tìm không tồn tại hoặc đã bị xóa."
        action={
          <Button asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
        }
      />
    </div>
  );
}
