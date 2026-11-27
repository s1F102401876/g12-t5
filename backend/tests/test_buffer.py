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

    def test_should_alert_when_threshold_met(self) -> None:
        """閾値以上にFallenが検出された場合にアラートが発せられることを確認"""
        buf = FrameBuffer(size=5, threshold=3)
        buf.add("Fallen")
        buf.add("Fallen")
        assert buf.should_alert() is False
        buf.add("Fallen")
        assert buf.should_alert() is True

    def test_should_not_alert_below_threshold(self) -> None:
        """閾値未満の場合はアラートが発せられないことを確認"""
        buf = FrameBuffer(size=5, threshold=3)
        buf.add("Fallen")
        buf.add("Sitting")
        buf.add("Fallen")
        assert buf.should_alert() is False

    def test_dominant_class(self) -> None:
        """最頻出クラスが正しく返されることを確認"""
        buf = FrameBuffer(size=5, threshold=3)
        buf.add("Standing")
        buf.add("Standing")
        buf.add("Sitting")
        buf.add("Standing")
        assert buf.get_dominant_class() == "Standing"

    def test_buffer_overflow(self) -> None:
        """バッファサイズを超えた場合に古いデータが消えることを確認"""
        buf = FrameBuffer(size=3, threshold=2)
        buf.add("Standing")
        buf.add("Standing")
        buf.add("Fallen")
        buf.add("Fallen")  # 最古のStandingが消れる -> [Standing, Fallen, Fallen]
        stats = buf.get_stats()
        assert stats["total_frames"] == 3
        assert stats["counts"]["Fallen"] == 2
        assert stats["counts"]["Standing"] == 1

    def test_clear(self) -> None:
        """clear()でバッファがクリアされることを確認"""
        buf = FrameBuffer(size=5, threshold=3)
        buf.add("Fallen")
        buf.add("Fallen")
        buf.clear()
        assert buf.get_dominant_class() is None
        assert buf.should_alert() is False

    def test_get_stats(self) -> None:
        """get_stats()が正しい統計情報を返すことを確認"""
        buf = FrameBuffer(size=5, threshold=3)
        buf.add("Fallen")
        buf.add("Standing")
        buf.add("Sitting")
        stats = buf.get_stats()
        assert stats["total_frames"] == 3
        assert stats["fall_count"] == 1
        assert stats["should_alert"] is False
