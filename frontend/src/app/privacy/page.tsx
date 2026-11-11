"use client";

import { PrivacyDashboard } from "@/components/Privacy/PrivacyDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              プライバシー管理
            </h1>
            <p className="text-muted-foreground mt-1">
              システムのプライバシー設定を管理します
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">ダッシュボードに戻る</Button>
          </Link>
        </div>

        {/* プライバシーダッシュボード */}
        <PrivacyDashboard />

        {/* プライバシーポリシー */}
        <Card className="mt-6">
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              プライバシーポリシー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h3>1. データの取り扱い</h3>
              <p>
                SafeCare-AIは、介護見守り支援システムとして、入居者の安全を確保するために映像データを解析します。
                本システムは、以下の原則に従いデータを取り扱います。
              </p>

              <h3>2. ローカル処理の原則</h3>
              <p>
                すべての映像データは、施設内のサーバーで処理されます。
                データがインターネットを経由して外部に送信されることはありません。
                これにより、データ漏洩のリスクを物理的に排除しています。
              </p>

              <h3>3. 顔のぼかし処理</h3>
              <p>
                検知された人物の顔は、自動的にぼかし処理されます。
                これにより、個人が特定されるリスクを軽減しています。
              </p>

              <h3>4. データ保存</h3>
              <p>
                映像データは保存されず、解析結果（転倒検知イベントなど）のみが記録されます。
                記録されたデータは、施設の管理目的でのみ使用されます。
              </p>

              <h3>5. 同意と透明性</h3>
              <p>
                本システムの使用にあたり、入居者およびその家族からの同意を得ることを義務付けます。
                システムの動作原理、データの取り扱い方法について、分かりやすく説明する責任があります。
              </p>

              <h3>6. 法規制への準拠</h3>
              <p>
                本システムは、厚生労働省が公表している「介護施設における監視カメラの使用に関するガイドライン」に準拠しています。
                個人情報保護法、介護保険法などの関連法規を遵守します。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>SafeCare-AI v0.1.0 | ローカル完結型介護見守りシステム</p>
          <p className="mt-1">
            プライバシーに関するご質問は、施設の管理者にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
}
