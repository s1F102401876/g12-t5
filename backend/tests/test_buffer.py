"""フレームバッファのテスト"""

from safecare.inference.buffer import FrameBuffer


class TestFrameBuffer:
    """FrameBufferクラスのテスト"""

    def test_initial_state(self) -> None:
        """初期状態が正しいことを確認"""
        buf = FrameBuffer(size=5, threshold=3)
        assert buf.size == 5
        assert buf.threshold == 3
        assert buf.is_ready is False
        assert buf.get_dominant_class() is None

    def test_add_and_ready(self) -> None:
        """要素追加とis_readyの確認"""
        buf = FrameBuffer(size=3, threshold=2)
        buf.add("Standing")
        assert buf.is_ready is False
        buf.add("Standing")
        assert buf.is_ready is False
        buf.add("Standing")
        assert buf.is_ready is True
