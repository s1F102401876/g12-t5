"use client";

import { useCallback, useEffect, useRef } from "react";

interface VideoSenderProps {
  roomId: string;
  wsRef: React.RefObject<WebSocket | null>;
}

export function VideoSender({ roomId, wsRef }: VideoSenderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const sendFrame = useCallback(() => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      animationFrameRef.current = requestAnimationFrame(sendFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // カメラ映像をCanvasに描画
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // JPEGに圧縮してバイナリで送信
    canvas.toBlob(
      (blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(blob);
        }
      },
      "image/jpeg",
      0.8
    );

    animationFrameRef.current = requestAnimationFrame(sendFrame);
  }, [wsRef]);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 640, frameRate: { ideal: 15 } },
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        // フレーム送信開始
        animationFrameRef.current = requestAnimationFrame(sendFrame);
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [sendFrame]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-lg"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}