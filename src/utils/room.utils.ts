import { RoomCategory } from "@/types/device.types";

export function reorderRooms(
  rooms: RoomCategory[],
  fromIndex: number,
  toIndex: number
) {
  const next = [...rooms];
  const boundedToIndex = Math.max(0, Math.min(next.length - 1, toIndex));
  const [item] = next.splice(fromIndex, 1);
  next.splice(boundedToIndex, 0, item);
  return next;
}
