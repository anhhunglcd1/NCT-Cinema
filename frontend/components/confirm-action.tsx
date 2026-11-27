"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/** Hộp thoại "Bạn chắc chứ?" dùng chung cho hủy vé, hủy giữ ghế, xóa dữ liệu... */
export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel,
  destructive,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Không</AlertDialogCancel>
          <AlertDialogAction variant={destructive ? "destructive" : "default"} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Nút thùng rác + xác nhận, dùng trong các bảng quản trị. */
export function ConfirmDelete({
  title,
  description = "Thao tác không thể hoàn tác. Dữ liệu đã có vé sẽ không xóa được.",
  onConfirm,
  disabled,
}: {
  title: string;
  description?: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  return (
    <ConfirmAction
      title={title}
      description={description}
      confirmLabel="Xóa"
      destructive
      onConfirm={onConfirm}
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label="Xóa" disabled={disabled}>
          <Trash2 className="text-destructive" />
        </Button>
      }
    />
  );
}
