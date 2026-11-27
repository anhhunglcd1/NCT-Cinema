"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clapperboard, LogOut, Menu, Shield, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLogout, useMe } from "@/features/auth-payment/auth";
import { useHydrated } from "@/hooks/use-hydrated";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/movies", label: "Phim" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight whitespace-nowrap">
          <Clapperboard className="size-5 text-primary" />
          <span>NCT Cinema</span>
        </Link>
        <Skeleton className="ml-auto h-8 w-24" />
      </div>
    </header>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const me = useMe();
  const hydrated = useHydrated();
  const user = hydrated ? me.data : undefined;
  const isPending = !hydrated || me.isPending;
  const logout = useLogout();

  const onLogout = () =>
    logout.mutate(undefined, {
      onSuccess: () => toast.success("Đã đăng xuất."),
      onSettled: () => router.push("/"),
    });

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Mở menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>NCT Cinema</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {[...NAV, ...(user?.role === "ADMIN" ? [{ href: "/admin/movies", label: "Quản trị" }] : [])].map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm",
                      isActive(pathname, item.href) ? "bg-muted font-medium" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight whitespace-nowrap">
          <Clapperboard className="size-5 text-primary" />
          <span>NCT Cinema</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors hover:text-foreground",
                isActive(pathname, item.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin/movies"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors hover:text-foreground",
                isActive(pathname, "/admin") ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Quản trị
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isPending ? (
            <Skeleton className="h-8 w-24" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="max-w-48" aria-label={`Tài khoản ${user.name}`}>
                  <UserRound />
                  <span className="hidden truncate sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/movies">
                      <Shield /> Trang quản trị
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onLogout} disabled={logout.isPending}>
                  <LogOut /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href={`/login?next=${encodeURIComponent(pathname)}`}>Đăng nhập</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
