# SafeCare-AI フロントエンド Dockerfile
# マルチステージビルドを使用してイメージサイズを最適化

# Stage 1: 依存関係のインストール
FROM node:20-alpine AS deps

WORKDIR /app

# package.jsonとlockファイルをコピー
COPY package.json package-lock.json* ./

# 依存関係のインストール
RUN npm ci --only=production

# Stage 2: ビルド
FROM node:20-alpine AS builder

WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 環境変数の設定
ENV NEXT_TELEMETRY_DISABLED=1

# ビルド実行
RUN npm run build

# Stage 3: 実行環境
FROM node:20-alpine AS runner

WORKDIR /app

# 環境変数の設定
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 非rootユーザーの作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ビルド成果物のコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 所有権の変更
RUN chown -R nextjs:nodejs /app

USER nextjs

# ポートの公開
EXPOSE 3000

# 環境変数
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# アプリケーションの起動
CMD ["node", "server.js"]