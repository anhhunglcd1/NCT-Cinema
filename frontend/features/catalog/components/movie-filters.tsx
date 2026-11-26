"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";

const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "nowPlaying", label: "Đang chiếu" },
  { value: "comingSoon", label: "Sắp chiếu" },
] as const;

/** Bộ lọc lưu trên URL (?query=&status=) để có thể chia sẻ/link lại. */
export function MovieFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("query") ?? "");
  const status = params.get("status") ?? "all";

  const update = (next: { query?: string; status?: string }) => {
    const search = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") search.delete(key);
      else search.set(key, value);
    }
    const qs = search.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  // Tìm kiếm sau khi người dùng ngừng gõ 300ms.
  useEffect(() => {
    const current = params.get("query") ?? "";
    if (query.trim() === current) return;
    const timer = setTimeout(() => update({ query: query.trim() }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:w-80">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên phim hoặc thể loại…"
          className="pl-8"
          aria-label="Tìm phim"
        />
        {pending && <Spinner className="absolute top-1/2 right-2.5 -translate-y-1/2" />}
      </div>
      <Tabs value={status} onValueChange={(value) => update({ status: value })}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
