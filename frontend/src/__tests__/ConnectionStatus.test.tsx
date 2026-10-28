import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ConnectionStatus } from "@/components/ConnectionStatus";

describe("ConnectionStatus", () => {
  it("should display connected status", () => {
    render(<ConnectionStatus state="connected" />);
    expect(screen.getByText("接続中")).toBeTruthy();
  });

  it("should display disconnected status", () => {
    render(<ConnectionStatus state="disconnected" />);
    expect(screen.getByText("切断")).toBeTruthy();
  });

  it("should display connecting status", () => {
    render(<ConnectionStatus state="connecting" />);
    expect(screen.getByText("接続中...")).toBeTruthy();
  });
});