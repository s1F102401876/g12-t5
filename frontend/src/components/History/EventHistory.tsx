"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: number;
  event_type: string;
  room_id: string;
  timestamp: string;
  confidence: number | null;
  details: string | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
}

interface EventHistoryProps {
  roomId?: string;
  eventType?: string;
  startDate?: Date;
  endDate?: Date;
}

export function EventHistory({
  roomId,
  eventType,
  startDate,
  endDate,
}: EventHistoryProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      });

      if (roomId) params.append("room_id", roomId);
      if (eventType) params.append("event_type", eventType);
      if (startDate) params.append("start_date", startDate.toISOString());
      if (endDate) params.append("end_date", endDate.toISOString());

      const response = await fetch(
        `http://localhost:8000/api/events?${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
    setLoading(false);
  }, [page, roomId, eventType, startDate, endDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAcknowledge = async (eventId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/events/${eventId}/acknowledge`,
        { method: "POST" }
      );
      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to acknowledge event:", error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate.toISOString());
      if (endDate) params.append("end_date", endDate.toISOString());

      const response = await fetch(
        `http://localhost:8000/api/events/export/csv?${params}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `safecare-events-${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  };

  const handleExportJSON = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate.toISOString());
      if (endDate) params.append("end_date", endDate.toISOString());

      const response = await fetch(
        `http://localhost:8000/api/events/export/json?${params}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `safecare-events-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export JSON:", error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            イベント履歴
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              CSVエクスポート
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              JSONエクスポート
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-8 w-8 mx-auto mb-2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p>イベントがありません</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {event.event_type === "FALL" ? (
                      <Badge variant="destructive">転倒</Badge>
                    ) : (
                      <Badge variant="secondary">{event.event_type}</Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{event.room_id}号室</p>
                      {event.confidence && (
                        <span className="text-xs text-muted-foreground">
                          信頼度: {Math.round(event.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.acknowledged ? (
                      <Badge variant="default">確認済み</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(event.id)}
                      >
                        確認
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ページネーション */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                全{total}件中 {(page - 1) * limit + 1}〜
                {Math.min(page * limit, total)}件を表示
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  前へ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  次へ
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
