"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage } from "@/lib/api/http";
import type { Cinema, Room } from "@/lib/api/types";
import { useSaveCinema, useSaveRoom } from "../../admin-api";

const cinemaSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên rạp.").max(100),
  address: z.string().trim().min(1, "Nhập địa chỉ.").max(300),
});

export function CinemaForm({ cinema, onDone }: { cinema?: Cinema; onDone: () => void }) {
  const save = useSaveCinema();
  const form = useForm<z.infer<typeof cinemaSchema>>({
    resolver: zodResolver(cinemaSchema),
    defaultValues: { name: cinema?.name ?? "", address: cinema?.address ?? "" },
  });
  const errors = form.formState.errors;
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit((input) =>
        save.mutate({ id: cinema?.id, input }, { onSuccess: () => { toast.success("Đã lưu rạp."); onDone(); } }),
      )}
    >
      <FieldGroup className="gap-4">
        {save.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(save.error)}</AlertDescription>
          </Alert>
        )}
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="cinema-name">Tên rạp</FieldLabel>
          <Input id="cinema-name" {...form.register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.address}>
          <FieldLabel htmlFor="cinema-address">Địa chỉ</FieldLabel>
          <Input id="cinema-address" {...form.register("address")} />
          <FieldError errors={[errors.address]} />
        </Field>
      </FieldGroup>
      <FormButtons pending={save.isPending} label={cinema ? "Lưu" : "Thêm rạp"} />
    </form>
  );
}

const roomSchema = z.object({
  cinemaId: z.string().min(1, "Chọn rạp."),
  name: z.string().trim().min(1, "Nhập tên phòng.").max(80),
  rows: z.coerce.number<number>().int().min(1, "Tối thiểu 1 hàng.").max(20, "Tối đa 20 hàng (A–T)."),
  seatsPerRow: z.coerce.number<number>().int().min(1, "Tối thiểu 1 ghế.").max(24, "Tối đa 24 ghế mỗi hàng."),
});

export function RoomForm({
  room,
  cinemas,
  defaultCinemaId,
  onDone,
}: {
  room?: Room;
  cinemas: Cinema[];
  defaultCinemaId?: string;
  onDone: () => void;
}) {
  const save = useSaveRoom();
  const form = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      cinemaId: room?.cinemaId ?? defaultCinemaId ?? cinemas[0]?.id ?? "",
      name: room?.name ?? "",
      rows: room?.rows ?? 8,
      seatsPerRow: room?.seatsPerRow ?? 10,
    },
  });
  const errors = form.formState.errors;
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit((input) =>
        save.mutate({ id: room?.id, input }, { onSuccess: () => { toast.success("Đã lưu phòng chiếu."); onDone(); } }),
      )}
    >
      <FieldGroup className="gap-4">
        {save.isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage(save.error)}</AlertDescription>
          </Alert>
        )}
        <Field data-invalid={!!errors.cinemaId}>
          <FieldLabel>Rạp</FieldLabel>
          <Controller
            control={form.control}
            name="cinemaId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn rạp" />
                </SelectTrigger>
                <SelectContent>
                  {cinemas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.cinemaId]} />
        </Field>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="room-name">Tên phòng</FieldLabel>
          <Input id="room-name" {...form.register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.rows}>
            <FieldLabel htmlFor="room-rows">Số hàng</FieldLabel>
            <Input id="room-rows" type="number" min={1} max={20} {...form.register("rows")} />
            <FieldError errors={[errors.rows]} />
          </Field>
          <Field data-invalid={!!errors.seatsPerRow}>
            <FieldLabel htmlFor="room-cols">Ghế mỗi hàng</FieldLabel>
            <Input id="room-cols" type="number" min={1} max={24} {...form.register("seatsPerRow")} />
            <FieldError errors={[errors.seatsPerRow]} />
          </Field>
        </div>
        {room && (
          <FieldDescription>
            Đổi số hàng/ghế sẽ tạo lại sơ đồ ghế và bỏ các ghế đã khóa. Phòng đã có vé không đổi được sơ đồ.
          </FieldDescription>
        )}
      </FieldGroup>
      <FormButtons pending={save.isPending} label={room ? "Lưu" : "Thêm phòng"} />
    </form>
  );
}

function FormButtons({ pending, label }: { pending: boolean; label: string }) {
  return (
    <DialogFooter>
      <DialogClose asChild>
        <Button type="button" variant="outline">
          Hủy
        </Button>
      </DialogClose>
      <Button type="submit" disabled={pending}>
        {pending && <Spinner />} {label}
      </Button>
    </DialogFooter>
  );
}
