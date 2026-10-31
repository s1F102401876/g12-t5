"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Statistics {
  total_events: number;
  event_type_stats: Record<string, number>;
  room_stats: Record<string, number>;
}

interface EventStatisticsProps {
  startDate?: Date;
  endDate?: Date;
}

export function EventStatistics({ startDate, endDate }: EventStatisticsProps) {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("start_date", startDate.toISOString());
        if (endDate) params.append("end_date", endDate.toISOString());

        const response = await fetch(
          `http://localhost:8000/api/events/statistics?${params}`
        );
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
      setLoading(false);
    };

    fetchStats();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const eventTypeLabels: Record<string, string> = {
    FALL: "転倒検知",
    SITTING: "着座",
    STANDING: "直立",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 総イベント数 */}
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
              className="h-5 w-5 text-blue-500"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            総イベント数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.total_events}</div>
          <p className="text-sm text-muted-foreground mt-1">件</p>
        </CardContent>
      </Card>

      {/* イベントタイプ別統計 */}
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
              className="h-5 w-5 text-green-500"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            イベントタイプ別
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.event_type_stats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <Badge variant={type === "FALL" ? "destructive" : "secondary"}>
                  {eventTypeLabels[type] || type}
                </Badge>
                <span className="font-medium">{count}件</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 部屋別統計 */}
      <Card className="md:col-span-2">
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
              className="h-5 w-5 text-purple-500"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            部屋別統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(stats.room_stats).map(([room, count]) => (
              <div
                key={room}
                className="flex flex-col items-center p-4 bg-muted rounded-lg"
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">{room}号室</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
