"use client";

import { RoomTile } from "./RoomTile";

interface Room {
  id: string;
  name: string;
  hasAlert: boolean;
}

interface GridViewProps {
  rooms: Room[];
}

export function GridView({ rooms }: GridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <RoomTile key={room.id} room={room} />
      ))}
    </div>
  );
}
