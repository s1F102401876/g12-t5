"use client";

import { useState } from "react";
import { EventHistory } from "@/components/History/EventHistory";
import { EventStatistics } from "@/components/History/EventStatistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function HistoryPage() {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>();
  const [selectedEventType, setSelectedEventType] = useState<
    string | undefined
  >();

  const handleDateChange = (type: "start" | "end", value: string) => {
    const date = value ? new Date(value) : undefined;
    if (type === "start") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              イベント履歴
            </h1>
            <p className="text-muted-foreground mt-1">
              過去のイベントと統計情報を確認します
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">ダッシュボードに戻る</Button>
          </Link>
        </div>

        {/* フィルター */}
        <Card className="mb-6">
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
                className="h-5 w-5 text-blue-500"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              フィルター
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* 開始日 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">開始日</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md bg-background"
                  onChange={(e) => handleDateChange("start", e.target.value)}
                />
              </div>

              {/* 終了日 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">終了日</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md bg-background"
                  onChange={(e) => handleDateChange("end", e.target.value)}
                />
              </div>

              {/* 部屋選択 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">部屋</label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  onChange={(e) =>
                    setSelectedRoom(e.target.value || undefined)
                  }
                >
                  <option value="">すべて</option>
                  <option value="101">101号室</option>
                  <option value="102">102号室</option>
                  <option value="103">103号室</option>
                  <option value="104">104号室</option>
                </select>
              </div>

              {/* イベントタイプ */}
              <div className="space-y-2">
                <label className="text-sm font-medium">イベントタイプ</label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  onChange={(e) =>
                    setSelectedEventType(e.target.value || undefined)
                  }
                >
                  <option value="">すべて</option>
                  <option value="FALL">転倒検知</option>
                  <option value="SITTING">着座</option>
                  <option value="STANDING">直立</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計情報 */}
        <div className="mb-6">
          <EventStatistics startDate={startDate} endDate={endDate} />
        </div>

        {/* イベント履歴 */}
        <EventHistory
          roomId={selectedRoom}
          eventType={selectedEventType}
          startDate={startDate}
          endDate={endDate}
        />

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>SafeCare-AI v0.1.0 | ローカル完結型介護見守りシステム</p>
        </div>
      </div>
    </div>
  );
}
