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

    def detect(self, frame: np.ndarray) -> list[dict[str, Any]]:
        """フレームに対して転倒検出を実行する

        Args:
            frame: BGR形式の画像（NumPy配列）

        Returns:
            検出結果のリスト。各要素は以下のキーを含む:
                - class_name: クラス名（"Fallen", "Sitting", "Standing"）
                - confidence: 信心度
                - bbox: バウンディングボックス [x1, y1, x2, y2]
        """
        model = self._load_model()
        results = model(frame, conf=self.confidence, verbose=False)

        detections: list[dict[str, Any]] = []
        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                cls_id = int(box.cls[0])
                class_name = self.CLASS_NAMES.get(cls_id, f"class_{cls_id}")
                confidence = float(box.conf[0])
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                detections.append({
                    "class_name": class_name,
                    "confidence": confidence,
                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                })

        return detections
