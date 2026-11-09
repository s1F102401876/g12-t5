"""検出器のテスト（モデルなしの動作確認）"""

import numpy as np

from safecare.inference.detector import FallDetector


class TestFallDetector:
    """FallDetectorクラスのテスト"""

    def test_class_names(self) -> None:
        """クラス名が正しく定義されていることを確認"""
        assert FallDetector.CLASS_NAMES[0] == "Fallen"
        assert FallDetector.CLASS_NAMES[1] == "Sitting"
        assert FallDetector.CLASS_NAMES[2] == "Standing"

    def test_init_defaults(self) -> None:
        """デフォルトの初期化パラメータが正しいことを確認"""
        detector = FallDetector()
        assert detector.confidence == 0.5

    def test_init_custom_confidence(self) -> None:
        """カスタム信心度で初期化できることを確認"""
        detector = FallDetector(confidence=0.8)
        assert detector.confidence == 0.8

    def test_draw_detections(self) -> None:
        """検出結果が正しく描画されることを確認"""
        detector = FallDetector()
        frame = np.zeros((200, 200, 3), dtype=np.uint8)
        detections = [
            {"class_name": "Fallen", "confidence": 0.9, "bbox": [10, 10, 50, 50]},
            {"class_name": "Standing", "confidence": 0.8, "bbox": [100, 100, 150, 150]},
        ]
        result = detector.draw_detections(frame, detections)
        assert result.shape == frame.shape
        # 描画された画像が元の画像と異なることを確認
        assert not np.array_equal(result, frame)

