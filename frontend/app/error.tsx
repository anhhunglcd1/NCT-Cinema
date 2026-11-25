"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/states";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <ErrorState
        title="Đã xảy ra lỗi"
        description="Trang gặp sự cố khi hiển thị. Vui lòng thử lại."
        action={<Button onClick={reset}>Thử lại</Button>}
      />
    </div>
  );
}
