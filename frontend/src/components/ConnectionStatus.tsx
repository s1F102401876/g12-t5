"use client";

import { ConnectionState } from "@/hooks/useWebSocket";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  state: ConnectionState;
}

const STATUS_CONFIG: Record<
  ConnectionState,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  connecting: {
    label: "接続中...",
    variant: "secondary",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        className="h-3 w-3 animate-spin"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ),
  },
  connected: {
    label: "接続中",
    variant: "default",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        className="h-3 w-3"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  disconnected: {
    label: "切断",
    variant: "destructive",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        className="h-3 w-3"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
};

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  const config = STATUS_CONFIG[state];
  return (
    <Badge
      variant={config.variant}
      className={cn(
        "gap-1.5",
        state === "connected" && "bg-green-500 hover:bg-green-600"
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}