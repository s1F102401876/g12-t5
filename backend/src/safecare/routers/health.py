"""ヘルスチェックルーター"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """サーバーの状態を返す"""
    return {"status": "ok"}