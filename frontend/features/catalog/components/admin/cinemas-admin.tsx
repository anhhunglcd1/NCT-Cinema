"use client";

import { useState } from "react";
import { Armchair, MapPin, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDelete } from "@/components/confirm-action";
import { EmptyState, ErrorState, PageTitle } from "@/components/states";
import { errorMessage } from "@/lib/api/http";
import type { Cinema, Room } from "@/lib/api/types";
import { useAdminCatalog, useDeleteCinema, useDeleteRoom } from "../../admin-api";
import { CinemaForm, RoomForm } from "./cinema-forms";
import { SeatLayoutEditor } from "./seat-layout-editor";

type DialogState =
  | { kind: "cinema"; cinema?: Cinema }
  | { kind: "room"; room?: Room; cinemaId?: string }
  | { kind: "seats"; roomId: string }
  | null;

export function CinemasAdmin() {
  const catalog = useAdminCatalog();
  const deleteCinema = useDeleteCinema();
  const deleteRoom = useDeleteRoom();
  const [dialog, setDialog] = useState<DialogState>(null);

  if (catalog.isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (catalog.error) return <ErrorState description={errorMessage(catalog.error)} />;

  const { cinemas, rooms, showtimes } = catalog.data;
  const showCount = new Map<string, number>();
  for (const s of showtimes) showCount.set(s.roomId, (showCount.get(s.roomId) ?? 0) + 1);
  const seatRoom = dialog?.kind === "seats" ? rooms.find((r) => r.id === dialog.roomId) : undefined;
  const close = () => setDialog(null);
  const onDeleteError = (e: unknown) => toast.error(errorMessage(e));

  return (
    <div>
      <PageTitle title="Rạp & phòng chiếu" description="Quản lý rạp, phòng và sơ đồ ghế.">
        <Button onClick={() => setDialog({ kind: "cinema" })}>
          <Plus /> Thêm rạp
        </Button>
      </PageTitle>

      {cinemas.length === 0 && <EmptyState title="Chưa có rạp" />}

      <div className="space-y-4">
        {cinemas.map((cinema) => {
          const cinemaRooms = rooms.filter((r) => r.cinemaId === cinema.id);
          return (
            <Card key={cinema.id}>
              <CardHeader>
                <CardTitle>{cinema.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="size-3" /> {cinema.address}
                </CardDescription>
                <CardAction className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setDialog({ kind: "room", cinemaId: cinema.id })}>
                    <Plus /> Phòng
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Sửa ${cinema.name}`} onClick={() => setDialog({ kind: "cinema", cinema })}>
                    <Pencil />
                  </Button>
                  <ConfirmDelete
                    title={`Xóa rạp "${cinema.name}"?`}
                    description="Xóa cả các phòng và suất chiếu chưa có vé của rạp. Rạp có dữ liệu vé sẽ không xóa được."
                    disabled={deleteCinema.isPending}
                    onConfirm={() => deleteCinema.mutate(cinema.id, { onSuccess: () => toast.success("Đã xóa rạp."), onError: onDeleteError })}
                  />
                </CardAction>
              </CardHeader>
              <CardContent>
                {cinemaRooms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có phòng chiếu.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phòng</TableHead>
                        <TableHead>Sơ đồ</TableHead>
                        <TableHead className="hidden sm:table-cell">Ghế khóa</TableHead>
                        <TableHead className="text-right">Suất</TableHead>
                        <TableHead className="w-32" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cinemaRooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.name}</TableCell>
                          <TableCell>
                            {room.rows} × {room.seatsPerRow} = {room.rows * room.seatsPerRow} ghế
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{room.blockedSeats.length}</TableCell>
                          <TableCell className="text-right tabular-nums">{showCount.get(room.id) ?? 0}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon-sm" aria-label={`Sơ đồ ghế ${room.name}`} onClick={() => setDialog({ kind: "seats", roomId: room.id })}>
                                <Armchair />
                              </Button>
                              <Button variant="ghost" size="icon-sm" aria-label={`Sửa ${room.name}`} onClick={() => setDialog({ kind: "room", room })}>
                                <Pencil />
                              </Button>
                              <ConfirmDelete
                                title={`Xóa ${room.name}?`}
                                description="Xóa cả các suất chiếu chưa có vé của phòng. Phòng có lịch sử vé sẽ không xóa được."
                                disabled={deleteRoom.isPending}
                                onConfirm={() => deleteRoom.mutate(room.id, { onSuccess: () => toast.success("Đã xóa phòng."), onError: onDeleteError })}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className={dialog?.kind === "seats" ? "sm:max-w-3xl" : undefined}>
          {dialog?.kind === "cinema" && (
            <>
              <DialogHeader>
                <DialogTitle>{dialog.cinema ? "Sửa rạp" : "Thêm rạp"}</DialogTitle>
                <DialogDescription>Tên và địa chỉ hiển thị cho khách khi chọn suất chiếu.</DialogDescription>
              </DialogHeader>
              <CinemaForm cinema={dialog.cinema} onDone={close} />
            </>
          )}
          {dialog?.kind === "room" && (
            <>
              <DialogHeader>
                <DialogTitle>{dialog.room ? "Sửa phòng chiếu" : "Thêm phòng chiếu"}</DialogTitle>
                <DialogDescription>Ghế được đặt tên theo hàng A–T và số 1–24.</DialogDescription>
              </DialogHeader>
              <RoomForm room={dialog.room} cinemas={cinemas} defaultCinemaId={dialog.cinemaId} onDone={close} />
            </>
          )}
          {dialog?.kind === "seats" && seatRoom && (
            <>
              <DialogHeader>
                <DialogTitle>Sơ đồ ghế · {seatRoom.name}</DialogTitle>
                <DialogDescription>Bấm vào ghế để khóa hoặc mở lại.</DialogDescription>
              </DialogHeader>
              <SeatLayoutEditor room={seatRoom} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
