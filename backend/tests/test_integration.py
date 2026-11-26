"""結合テスト: WebSocket通信と推論パイプラインの統合"""

import json
from unittest.mock import MagicMock, patch

from starlette.testclient import TestClient

from safecare.main import app


class TestHealthEndpoint:
    """ヘルスチェックエンドポイントの結合テスト"""

    def test_health_returns_ok(self) -> None:
        """GET /health が200を返すことを確認"""
        client = TestClient(app)
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestCameraWebSocket:
    """カメラWebSocketの結合テスト"""

    def test_camera_ws_connection(self) -> None:
        """WebSocket接続が成功することを確認"""
        client = TestClient(app)
        with client.websocket_connect("/ws/camera/101") as websocket:
            assert websocket is not None

    @patch("safecare.routers.camera._get_pipeline")
    def test_camera_ws_receives_frame_response(self, mock_get_pipeline: MagicMock) -> None:
        """フレーム送信時に正しいレスポンスが返されることを確認"""
        import cv2
        import numpy as np

        # モックパイプラインを設定
        mock_pipeline = MagicMock()
        dummy_frame = np.zeros((100, 100, 3), dtype=np.uint8)
        mock_pipeline.process_frame.return_value = {
            "success": True,
            "detections": [{"class_name": "Standing", "confidence": 0.9, "bbox": [10, 10, 50, 50]}],
            "annotated_frame": dummy_frame,
            "should_alert": False,
            "dominant_class": "Standing",
            "error": None,
        }
        mock_get_pipeline.return_value = mock_pipeline

        client = TestClient(app)
        with client.websocket_connect("/ws/camera/101") as websocket:
            _, jpeg_data = cv2.imencode(".jpg", dummy_frame)
            websocket.send_bytes(jpeg_data.tobytes())

            data = websocket.receive_text()
            result = json.loads(data)
            assert result["type"] == "frame"
            assert result["room_id"] == "101"
            assert "detections" in result
            assert "should_alert" in result


class TestDashboardWebSocket:
    """ダッシュボードWebSocketの結合テスト"""

    def test_dashboard_ws_connection(self) -> None:
        """WebSocket接続が成功することを確認"""
        client = TestClient(app)
        with client.websocket_connect("/ws/dashboard") as websocket:
            assert websocket is not None


class TestInferencePipelineMocked:
    """モックを使用した推論パイプラインの結合テスト"""

    @patch("safecare.inference.detector.FallDetector._load_model")
    def test_pipeline_decode_valid_jpeg(self, mock_load: MagicMock) -> None:
        """有効なJPEGが正しくデコードされることを確認"""
        import cv2
        import numpy as np

        from safecare.inference.pipeline import InferencePipeline

        pipeline = InferencePipeline()
        dummy_frame = np.zeros((100, 100, 3), dtype=np.uint8)
        _, jpeg_data = cv2.imencode(".jpg", dummy_frame)

        decoded = pipeline.decode_frame(jpeg_data.tobytes())
        assert decoded is not None
        assert decoded.shape == (100, 100, 3)

    def test_pipeline_decode_invalid_data(self) -> None:
        """無効なデータでNoneが返されることを確認"""
        from safecare.inference.pipeline import InferencePipeline

        pipeline = InferencePipeline()
        decoded = pipeline.decode_frame(b"invalid")
        assert decoded is None

    def test_pipeline_reset(self) -> None:
        """reset()で状態がリセットされることを確認"""
        from safecare.inference.pipeline import InferencePipeline

        pipeline = InferencePipeline()
        pipeline.buffer.add("Fallen")
        pipeline.reset()
        assert pipeline.buffer.get_dominant_class() is None
