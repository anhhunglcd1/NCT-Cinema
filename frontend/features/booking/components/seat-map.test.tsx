import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { statusMap } from "@/lib/booking-state";
import { SeatMap } from "./seat-map";

const statuses = statusMap([
  { label: "A1", status: "available" },
  { label: "A2", status: "occupied" },
  { label: "B1", status: "blocked" },
  { label: "B2", status: "available" },
]);

describe("SeatMap", () => {
  it("vẽ đủ ghế và khóa ghế không trống", () => {
    render(<SeatMap rows={2} seatsPerRow={2} statuses={statuses} selected={[]} onToggle={() => {}} />);
    expect(screen.getAllByRole("button")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Ghế A1" })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Ghế A2/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Ghế B1/ })).toBeDisabled();
  });

  it("bấm ghế gọi onToggle và đánh dấu ghế đang chọn", async () => {
    const onToggle = vi.fn();
    render(<SeatMap rows={2} seatsPerRow={2} statuses={statuses} selected={["B2"]} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button", { name: "Ghế A1" }));
    expect(onToggle).toHaveBeenCalledWith("A1");
    expect(screen.getByRole("button", { name: /Ghế B2/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("ghế đang chọn nhưng vừa bị chiếm vẫn bấm được để bỏ chọn", () => {
    render(<SeatMap rows={2} seatsPerRow={2} statuses={statuses} selected={["A2"]} onToggle={() => {}} />);
    expect(screen.getByRole("button", { name: /Ghế A2/ })).toBeEnabled();
  });
});
