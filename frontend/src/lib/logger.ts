"use client";

// 構造化ログシステム
// ログレベル: DEBUG, INFO, WARN, ERROR

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  source?: string;
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private log(level: LogLevel, message: string, data?: unknown, source?: string) {
    if (level < this.level) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      source,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // コンソールにも出力
    const levelName = LogLevel[level];
    const prefix = source ? `[${source}]` : "";
    const logMessage = `${entry.timestamp} ${levelName} ${prefix} ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data);
        break;
    }
  }

  debug(message: string, data?: unknown, source?: string) {
    this.log(LogLevel.DEBUG, message, data, source);
  }

  info(message: string, data?: unknown, source?: string) {
    this.log(LogLevel.INFO, message, data, source);
  }

  warn(message: string, data?: unknown, source?: string) {
    this.log(LogLevel.WARN, message, data, source);
  }

  error(message: string, data?: unknown, source?: string) {
    this.log(LogLevel.ERROR, message, data, source);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter((log) => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// シングルトンインスタンス
export const logger = new Logger();

// ログレベルの設定（環境変数から取得）
if (typeof window !== "undefined") {
  const logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || "INFO";
  logger.setLevel(LogLevel[logLevel as keyof typeof LogLevel] || LogLevel.INFO);
}