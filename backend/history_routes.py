"""Dashboard API: history of analyses and usage statistics."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

try:
    from backend import database
except ImportError:
    import database

router = APIRouter(tags=["dashboard"])


@router.get("/stats")
def stats(days: int = Query(30, ge=7, le=365)):
    return database.get_stats(days)


@router.get("/history")
def history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    input_type: Optional[str] = Query(None, pattern="^(text|url|document)$"),
    prediction: Optional[str] = None,
    search: Optional[str] = Query(None, max_length=200),
):
    return database.list_analyses(limit, offset, input_type, prediction, search)


@router.get("/history/{analysis_id}")
def history_item(analysis_id: int):
    item = database.get_analysis(analysis_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return item


@router.delete("/history/{analysis_id}")
def delete_history_item(analysis_id: int):
    if not database.delete_analysis(analysis_id):
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return {"deleted": analysis_id}


@router.delete("/history")
def clear_all_history():
    return {"deleted": database.clear_history()}