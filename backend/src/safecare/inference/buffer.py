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

    @property
    def is_ready(self) -> bool:
        """バッファが満杯かどうかを返す"""
        return len(self._buffer) >= self.size
