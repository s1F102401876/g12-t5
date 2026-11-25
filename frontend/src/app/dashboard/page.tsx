"use client";

import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { GridView } from "@/components/Dashboard/GridView";
import { AlertOverlay } from "@/components/Dashboard/AlertOverlay";
import { EventLog } from "@/components/Dashboard/EventLog";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { alertSoundPlayer } from "@/lib/sounds";
import {
  AlertEvent,
  LogEntry,
  createLogEntry,
  DEFAULT_ROOMS,
} from "@/lib/alerts";

const WS_URL = "ws://localhost:8000/ws/dashboard";

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [stats, setStats] = useState({
    totalRooms: DEFAULT_ROOMS.length,
    activeAlerts: 0,
    connectedRooms: 0,
  });
  const { toast } = useToast();

  const onMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data: AlertEvent = JSON.parse(event.data);
        if (data.event === "FALL") {
          setAlerts((prev) => [...prev, data]);
          setLogs((prev) => [createLogEntry(data), ...prev]);

          // 該当居室のアラート状態を更新
          setRooms((prev) =>
            prev.map((room) =>
              room.id === data.room_id ? { ...room, hasAlert: true } : room
            )
          );

          // アラート音を再生
          alertSoundPlayer?.playAlert();

          // Toast通知を表示
          toast({
            title: "⚠️ 転倒検知",
            description: `${data.room_id}号室で転倒を検知しました`,
            variant: "destructive",
          });
        }
      } catch {
        // JSONパースエラーは無視
      }
    },
    [toast]
  );

  const { connectionState, connect } = useWebSocket({
    url: WS_URL,
    onMessage,
  });

  useEffect(() => {
    connect();
  }, [connect]);

  // 統計情報の更新
  useEffect(() => {
    setStats({
      totalRooms: rooms.length,
      activeAlerts: rooms.filter((r) => r.hasAlert).length,
      connectedRooms: rooms.length, // 本来は接続状態から計算
    });
  }, [rooms]);

  const dismissAlert = useCallback((index: number) => {
    setAlerts((prev) => {
      const removed = prev[index];
      if (removed) {
        // 居室のアラート状態をリセット
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === removed.room_id ? { ...room, hasAlert: false } : room
          )
        );
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              SafeCare-AI ダッシュボード
            </h1>
            <p className="text-muted-foreground mt-1">
              介護見守り支援システム
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatus state={connectionState} />
          </div>
        </div>

        {/* 統計情報カード */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">監視居室数</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
              <p className="text-xs text-muted-foreground">室</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                アラート発生中
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stats.activeAlerts}</div>
                {stats.activeAlerts > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    要対応
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">件</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                接続状態
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    connectionState === "connected"
                      ? "bg-green-500"
                      : connectionState === "connecting"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-sm">
                  {connectionState === "connected"
                    ? "接続中"
                    : connectionState === "connecting"
                    ? "接続中..."
                    : "切断"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* アラートオーバーレイ */}
        <AlertOverlay alerts={alerts} onDismiss={dismissAlert} />

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* グリッドビュー */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  居室一覧
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GridView rooms={rooms} />
              </CardContent>
            </Card>
          </div>

          {/* イベントログ */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  イベントログ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventLog logs={logs} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>SafeCare-AI v0.1.0 | ローカル完結型介護見守りシステム</p>
        </div>
      </div>
    </div>
  );
}
