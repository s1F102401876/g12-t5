"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PrivacySettingsProps {
  onSave: (settings: PrivacySettings) => void;
  onCancel: () => void;
}

interface PrivacySettings {
  faceBlurring: boolean;
  dataRetention: "none" | "logs-only" | "anonymized";
  externalTransmission: boolean;
  consentRequired: boolean;
}

export function PrivacySettings({ onSave, onCancel }: PrivacySettingsProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    faceBlurring: true,
    dataRetention: "logs-only",
    externalTransmission: false,
    consentRequired: true,
  });

  const handleSave = () => {
    onSave(settings);
  };

  return (
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          プライバシー設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* 顔ぼかし設定 */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">顔のぼかし処理</p>
              <p className="text-xs text-muted-foreground">
                検知された人物の顔を自動的にぼかし処理します
              </p>
            </div>
            <Button
              variant={settings.faceBlurring ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  faceBlurring: !prev.faceBlurring,
                }))
              }
            >
              {settings.faceBlurring ? "ON" : "OFF"}
            </Button>
          </div>

          {/* データ保存設定 */}
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">データ保存</p>
            <p className="text-xs text-muted-foreground mb-2">
              保存するデータの種類を選択してください
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "none", label: "保存しない" },
                { value: "logs-only", label: "ログのみ" },
                { value: "anonymized", label: "匿名化データ" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={
                    settings.dataRetention === option.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      dataRetention: option.value as PrivacySettings["dataRetention"],
                    }))
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 外部送信設定 */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">外部データ送信</p>
              <p className="text-xs text-muted-foreground">
                データを施設外に送信することを許可します
              </p>
            </div>
            <Button
              variant={settings.externalTransmission ? "default" : "destructive"}
              size="sm"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  externalTransmission: !prev.externalTransmission,
                }))
              }
            >
              {settings.externalTransmission ? "許可" : "禁止"}
            </Button>
          </div>

          {/* 同意必須設定 */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">同意確認</p>
              <p className="text-xs text-muted-foreground">
                利用前にプライバシー同意を必須とします
              </p>
            </div>
            <Button
              variant={settings.consentRequired ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  consentRequired: !prev.consentRequired,
                }))
              }
            >
              {settings.consentRequired ? "必須" : "任意"}
            </Button>
          </div>
        </div>

        <div className="bg-blue-500/10 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-xs text-blue-500">
              これらの設定は厚生労働省のガイドラインに準拠しています。
              設定はいつでも変更可能です。
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            設定を保存
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            キャンセル
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
