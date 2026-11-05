"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "@/lib/logger";

export type ConnectionState = "connecting" | "connected" | "disconnected";

export interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: MessageEvent) => void;
  onBinaryMessage?: (data: ArrayBuffer) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  exponentialBackoff?: boolean;
}

export function useWebSocket({
  url,
  onMessage,
  onBinaryMessage,
  reconnectInterval = 3000,
  maxReconnectAttempts = 10,
  exponentialBackoff = true,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualDisconnectRef = useRef(false);

  const getReconnectDelay = useCallback(() => {
    if (!exponentialBackoff) return reconnectInterval;

    // 指数バックオフ: 基本遅延 * 2^試行回数（最大30秒）
    const delay = Math.min(
      reconnectInterval * Math.pow(2, reconnectAttemptsRef.current),
      30000
    );
    return delay;
  }, [reconnectInterval, exponentialBackoff]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (isManualDisconnectRef.current) return;

    // 最大再接続試行回数をチェック
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      logger.error(
        "WebSocket: 最大再接続試行回数に達しました",
        { attempts: reconnectAttemptsRef.current },
        "WebSocket"
      );
      setConnectionState("disconnected");
      return;
    }

    setConnectionState("connecting");
    logger.info(
      "WebSocket: 接続試行中",
      { url, attempt: reconnectAttemptsRef.current + 1 },
      "WebSocket"
    );

    try {
      const ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        setConnectionState("connected");
        reconnectAttemptsRef.current = 0;
        logger.info("WebSocket: 接続成功", { url }, "WebSocket");
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer && onBinaryMessage) {
          onBinaryMessage(event.data);
        } else if (onMessage) {
          onMessage(event);
        }
      };

      ws.onclose = (event) => {
        setConnectionState("disconnected");
        logger.warn(
          "WebSocket: 接続切断",
          { code: event.code, reason: event.reason },
          "WebSocket"
        );

        // 手動切断でない場合は再接続
        if (!isManualDisconnectRef.current) {
          const delay = getReconnectDelay();
          reconnectAttemptsRef.current++;

          logger.info(
            "WebSocket: 再接続スケジュール",
            {
              delay,
              attempt: reconnectAttemptsRef.current,
              maxAttempts: maxReconnectAttempts,
            },
            "WebSocket"
          );

          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = (error) => {
        logger.error("WebSocket: エラー発生", { error }, "WebSocket");
        ws.close();
      };

      wsRef.current = ws;
    } catch (error) {
      logger.error(
        "WebSocket: 接続作成エラー",
        { error },
        "WebSocket"
      );
      setConnectionState("disconnected");
    }
  }, [
    url,
    onMessage,
    onBinaryMessage,
    maxReconnectAttempts,
    getReconnectDelay,
  ]);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionState("disconnected");
    reconnectAttemptsRef.current = 0;
    logger.info("WebSocket: 手動切断", { url }, "WebSocket");
  }, [url]);

  const sendMessage = useCallback((data: string | ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
      logger.debug(
        "WebSocket: メッセージ送信",
        {
          type: typeof data === "string" ? "text" : "binary",
          size: data instanceof ArrayBuffer ? data.byteLength : data.length,
        },
        "WebSocket"
      );
    } else {
      logger.warn(
        "WebSocket: メッセージ送信失敗（未接続）",
        { readyState: wsRef.current?.readyState },
        "WebSocket"
      );
    }
  }, []);

  // 再接続を許可する関数
  const reconnect = useCallback(() => {
    isManualDisconnectRef.current = false;
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    wsRef,
    reconnectAttempts: reconnectAttemptsRef.current,
  };
}