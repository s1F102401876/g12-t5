"use client";

import { Camera } from "@/components/Camera";
import { useParams } from "next/navigation";

export default function CameraPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  return <Camera roomId={roomId} />;
}