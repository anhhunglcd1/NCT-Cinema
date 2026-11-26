"use client";

import { useState } from "react";
import Image from "next/image";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

/** Poster phim, tự hiện khung thay thế khi ảnh lỗi hoặc không có. */
export function Poster({
  src,
  title,
  className,
  priority,
  sizes = "(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw",
}: {
  src: string;
  title: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative aspect-[2/3] overflow-hidden rounded-lg bg-muted", className)}>
      {showImage ? (
        <Image
          src={src}
          alt={`Poster phim ${title}`}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/30 via-muted to-background p-4 text-center">
          <Film className="size-8 text-muted-foreground" />
          <span className="line-clamp-3 text-sm font-medium">{title}</span>
        </div>
      )}
    </div>
  );
}
