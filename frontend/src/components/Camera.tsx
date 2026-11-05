"use client";

import { useCallback, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ConnectionStatus } from "./ConnectionStatus";
import { VideoSender } from "./VideoSender";

interface CameraProps {
  roomId: string;
}

interface Detection {
  class_name: string;
  confidence: number;
  bbox: number[];
}

interface FrameResponse {
  type: string;
  room_id: string;
  frame: string;
  detections: Detection[];
  dominant_class: string;
  should_alert: boolean;
}

export function Camera({ roomId }: CameraProps) {
  const [lastDetection, setLastDetection] = useState<Detection | null>(null);
  const [isAlert, setIsAlert] = useState(false);

  const WS_URL = `ws://localhost:8000/ws/camera/${roomId}`;

  const onMessage = useCallback((event: MessageEvent) => {
    try {
      const data: FrameResponse = JSON.parse(event.data);
      if (data.type === "frame" && data.detections.length > 0) {
        setLastDetection(data.detections[0]);
        setIsAlert(data.should_alert);
      }
    } catch {
      // JSONパースエラーは無視
    }
  }, []);

  const { connectionState, connect, wsRef } = useWebSocket({
    url: WS_URL,
    onMessage,
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{roomId}号室 カメラ</h1>
          <ConnectionStatus state={connectionState} />
        </div>

        {/* カメラ映像 */}
        <div
          className={`relative rounded-lg overflow-hidden border-4 ${
            isAlert ? "border-red-500 animate-pulse" : "border-gray-700"
          }`}
        >
          <VideoSender roomId={roomId} wsRef={wsRef} />

          {/* 検出結果オーバーレイ */}
          {lastDetection && (
            <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-sm">
              <span
                className={
                  lastDetection.class_name === "Fallen"
                    ? "text-red-400"
                    : lastDetection.class_name === "Sitting"
                    ? "text-yellow-400"
                    : "text-green-400"
                }
              >
                {lastDetection.class_name}
              </span>
              <span className="text-gray-400 ml-2">
                {(lastDetection.confidence * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* 接続ボタン */}
        {connectionState === "disconnected" && (
          <button
            onClick={connect}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            接続する
          </button>
        )}

        {/* アラート表示 */}
        {isAlert && (
          <div className="mt-4 p-4 bg-red-600 rounded-lg animate-pulse">
            <p className="text-xl font-bold">⚠️ 転倒検知</p>
            <p className="text-sm mt-1">
              {roomId}号室で転倒が検知されました
            </p>
          </div>
        )}
      </div>
    </div>
  );
}