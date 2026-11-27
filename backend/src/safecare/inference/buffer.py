"""フレームバッファ（判定安定化ロジック）"""

from __future__ import annotations

from collections import deque
from typing import Any


class FrameBuffer:
    """直近Nフレームの検出結果を保持し、多数決による判定を提供する

    単一フレームの誤検知による誤報を防ぐため、
    直近Nフレームの検出結果を集約して判定する。

    Attributes:
        size: バッファサイズ（直近何フレームを保持するか）
        threshold: 転倒確定に必要な最小検出回数
    """

    def __init__(self, size: int = 10, threshold: int = 7) -> None:
        """バッファを初期化する

        Args:
            size: バッファサイズ
            threshold: 転倒確定に必要な最小検出回数
        """
        self.size = size
        self.threshold = threshold
        self._buffer: deque[str] = deque(maxlen=size)

    def add(self, class_name: str) -> None:
        """検出結果をバッファに追加する

        Args:
            class_name: 検出されたクラス名
        """
        self._buffer.append(class_name)

    def should_alert(self) -> bool:
        """アラートを発すべきかを判定する

        直近Nフレームのうち、M回以上「Fallen」が検出された場合にTrueを返す。

        Returns:
            True: 転倒確定（アラートを発すべき）
            False: まだ確定しない
        """
        fall_count = sum(1 for c in self._buffer if c == "Fallen")
        return fall_count >= self.threshold

    def get_dominant_class(self) -> str | None:
        """直近Nフレームで最も多く検出されたクラスを返す

        Returns:
            最頻出クラス名。バッファが空の場合はNone
        """
        if not self._buffer:
            return None

        counts: dict[str, int] = {}
        for cls in self._buffer:
            counts[cls] = counts.get(cls, 0) + 1

        return max(counts, key=lambda k: counts[k])

    @property
    def is_ready(self) -> bool:
        """バッファが満杯かどうかを返す"""
        return len(self._buffer) >= self.size
