"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PrivacyModeProps {
  onConsent: () => void;
  onDecline: () => void;
}

export function PrivacyMode({ onConsent, onDecline }: PrivacyModeProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            プライバシーに関する同意
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              このシステムは介護見守りのために映像を解析します。以下の点をご確認ください。
            </p>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-sm">
                  <strong>ローカル処理:</strong> 映像は施設内のサーバーで処理され、外部に送信されません
                </p>
              </div>

              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-sm">
                  <strong>顔のぼかし:</strong> 検知された人物の顔は自動的にぼかし処理されます
                </p>
              </div>

              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-sm">
                  <strong>データ保存:</strong> 映像データは保存されず、解析結果のみが記録されます
                </p>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                このシステムは厚生労働省のガイドラインに準拠しています。
                いつでもカメラの電源を切るか、システムを停止することができます。
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                setIsVisible(false);
                onConsent();
              }}
              className="w-full"
              disabled={countdown > 0}
            >
              {countdown > 0 ? `同意する (${countdown}秒後)` : "同意する"}
            </Button>
            <Button variant="outline" onClick={onDecline} className="w-full">
              同意しない
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
