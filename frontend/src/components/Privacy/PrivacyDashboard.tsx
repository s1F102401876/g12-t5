"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrivacySettings } from "./PrivacySettings";

interface PrivacySettingsType {
  faceBlurring: boolean;
  dataRetention: "none" | "logs-only" | "anonymized";
  externalTransmission: boolean;
  consentRequired: boolean;
}

interface PrivacyStatus {
  faceBlurring: boolean;
  dataRetention: "none" | "logs-only" | "anonymized";
  externalTransmission: boolean;
  consentRequired: boolean;
  lastAudit: string;
}

export function PrivacyDashboard() {
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<PrivacyStatus>({
    faceBlurring: true,
    dataRetention: "logs-only",
    externalTransmission: false,
    consentRequired: true,
    lastAudit: new Date().toISOString(),
  });

  const handleSaveSettings = (settings: PrivacySettingsType) => {
    setStatus((prev) => ({
      ...prev,
      ...settings,
      lastAudit: new Date().toISOString(),
    }));
    setShowSettings(false);
  };

  return (
    <div className="space-y-4">
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              プライバシー状態
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              設定変更
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">顔のぼかし</p>
              <Badge variant={status.faceBlurring ? "default" : "destructive"}>
                {status.faceBlurring ? "ON" : "OFF"}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">データ保存</p>
              <Badge variant="secondary">
                {status.dataRetention === "none"
                  ? "保存しない"
                  : status.dataRetention === "logs-only"
                  ? "ログのみ"
                  : "匿名化データ"}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">外部送信</p>
              <Badge
                variant={
                  status.externalTransmission ? "destructive" : "default"
                }
              >
                {status.externalTransmission ? "許可" : "禁止"}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">同意確認</p>
              <Badge variant={status.consentRequired ? "default" : "outline"}>
                {status.consentRequired ? "必須" : "任意"}
              </Badge>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              最終監査: {new Date(status.lastAudit).toLocaleString("ja-JP")}
            </p>
          </div>
        </CardContent>
      </Card>

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <PrivacySettings
            onSave={handleSaveSettings}
            onCancel={() => setShowSettings(false)}
          />
        </div>
      )}
    </div>
  );
}
