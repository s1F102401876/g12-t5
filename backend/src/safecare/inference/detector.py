"""YOLOv11転倒検出器"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import cv2
import numpy as np

from safecare.config import settings


class FallDetector:
    """YOLOv11を用いた転倒検出器

    Attributes:
        model: YOLOv11モデルインスタンス
        confidence: 検出信心度の閾値
    """

    # YOLOv11 human-fall-detection のクラス名
    CLASS_NAMES: dict[int, str] = {
        0: "Fallen",
        1: "Sitting",
        2: "Standing",
    }

    def __init__(self, model_path: str | Path | None = None, confidence: float | None = None) -> None:
        """検出器を初期化する

        Args:
            model_path: モデルファイルのパス。Noneの場合はHugging Faceからロード
            confidence: 検出信心度の閾値。Noneの場合は設定値を使用
        """
        self.confidence = confidence or settings.CONFIDENCE_THRESHOLD
        self._model: Any = None
        self._model_path = model_path

    def _load_model(self) -> Any:
        """モデルをロードする（遅延ロード）

        優先順位:
            1. 明示的に指定されたモデルパス
            2. 設定のローカルモデルパス（settings.MODEL_PATH）
            3. Hugging Faceからダウンロード
        """
        if self._model is not None:
            return self._model

        from ultralytics import YOLO

        # 明示的なパス指定
        if self._model_path is not None:
            self._model = YOLO(str(self._model_path))
        # 設定のローカルモデル
        elif settings.MODEL_PATH and settings.MODEL_PATH.exists():
            self._model = YOLO(str(settings.MODEL_PATH))
        # Hugging Faceからダウンロード
        else:
            self._model = YOLO(settings.MODEL_NAME)
        return self._model
