"""イベント管理APIルーター"""

import io
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from safecare.database import db

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("/")
async def get_events(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    room_id: str | None = None,
    event_type: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """イベント一覧を取得"""
    events = db.get_events(
        limit=limit,
        offset=offset,
        room_id=room_id,
        event_type=event_type,
        start_date=start_date,
        end_date=end_date,
    )
    total = db.get_event_count(
        room_id=room_id,
        event_type=event_type,
        start_date=start_date,
        end_date=end_date,
    )
    return {"events": events, "total": total}


@router.get("/statistics")
async def get_statistics(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """統計情報を取得"""
    stats = db.get_statistics(start_date=start_date, end_date=end_date)
    return stats


@router.post("/{event_id}/acknowledge")
async def acknowledge_event(
    event_id: int,
    acknowledged_by: str = "system",
):
    """イベントを確認済みにする"""
    success = db.acknowledge_event(event_id, acknowledged_by)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event acknowledged"}


@router.get("/export/csv")
async def export_events_csv(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """イベントをCSV形式でエクスポート"""
    csv_content = db.export_events_csv(start_date=start_date, end_date=end_date)

    # CSVファイルとしてダウンロードさせる
    filename = f"safecare-events-{datetime.now().strftime('%Y%m%d-%H%M%S')}.csv"

    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/export/json")
async def export_events_json(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """イベントをJSON形式でエクスポート"""
    events = db.get_events(
        limit=10000,
        start_date=start_date,
        end_date=end_date,
    )

    import json

    json_content = json.dumps(events, ensure_ascii=False, indent=2)

    filename = f"safecare-events-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"

    return StreamingResponse(
        io.StringIO(json_content),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
