# SafeCare-AI バックエンド Dockerfile
# マルチステージビルドを使用してイメージサイズを最適化

# Stage 1: ビルド環境
FROM python:3.13-slim as builder

WORKDIR /app

# システム依存関係のインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係のインストール
COPY pyproject.toml .
RUN pip install --no-cache-dir uv && \
    uv pip install --system --no-cache-dir .

# Stage 2: 実行環境
FROM python:3.13-slim

WORKDIR /app

# 実行に必要な依存関係のみインストール
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# アプリケーションコードのコピー
COPY src/ ./src/
COPY models/ ./models/

# データディレクトリの作成
RUN mkdir -p /app/data

# 非rootユーザーの作成
RUN useradd -m -u 1000 safecare && \
    chown -R safecare:safecare /app
USER safecare

# ポートの公開
EXPOSE 8000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# アプリケーションの起動
CMD ["uvicorn", "safecare.main:app", "--host", "0.0.0.0", "--port", "8000"]