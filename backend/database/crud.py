import json

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from .connection import engine
from .models import Analysis


def _summary(row: Analysis) -> dict:
    return {
        "id": row.id,
        "created_at": row.created_at.isoformat()
        if row.created_at else None,

        "input_type": row.input_type,
        "title": row.title,
        "source": row.source,

        "prediction": row.prediction,

        "fake_probability": row.fake_probability,
        "real_probability": row.real_probability,

        "word_count": row.word_count,
        "article_count": row.article_count,

        "fake_count": row.fake_count,
        "real_count": row.real_count,
        "uncertain_count": row.uncertain_count,

        "text_preview": row.text_preview,
    }
    
    
def save_analysis(
    input_type: str,
    result: dict,
    *,
    text: str = "",
    source: str = ""
) -> int | None:

    try:

        if input_type == "document":

            title = result.get("filename") or "Document"

            preview = ", ".join(
                a.get("title", "")
                for a in result.get("articles", [])[:5]
            )

        else:

            title = (
                result.get("title")
                or " ".join(text.split()[:12])
            )

            preview = text[:500]

        row = Analysis(
            input_type=input_type,

            title=title[:300],

            source=source[:2000],

            prediction=result.get(
                "prediction",
                "Unknown"
            ),

            fake_probability=result.get(
                "fake_probability"
            ),

            real_probability=result.get(
                "real_probability"
            ),

            word_count=result.get(
                "word_count"
            ),

            article_count=result.get(
                "article_count"
            ),

            fake_count=result.get(
                "fake_count"
            ),

            real_count=result.get(
                "real_count"
            ),

            uncertain_count=result.get(
                "uncertain_count"
            ),

            text_preview=preview,

            result_json=json.dumps(
                {
                    **result,
                    "source_text": text[:20000]
                }
                if text
                else result
            ),
        )

        with Session(engine) as session:

            session.add(row)

            session.commit()

            return row.id

    except Exception as exc:

        print(
            f"[TrustLens] Could not save analysis: {exc}"
        )

        return None
    

def list_analyses(
    limit=20,
    offset=0,
    input_type=None,
    prediction=None,
    search=None
) -> dict:

    query = select(Analysis)

    if input_type:
        query = query.where(
            Analysis.input_type == input_type
        )

    if prediction:
        query = query.where(
            Analysis.prediction == prediction
        )

    if search:

        like = f"%{search}%"

        query = query.where(
            or_(
                Analysis.title.ilike(like),
                Analysis.text_preview.ilike(like),
                Analysis.source.ilike(like)
            )
        )

    with Session(engine) as session:

        total = session.scalar(
            select(func.count())
            .select_from(query.subquery())
        )

        rows = session.scalars(
            query
            .order_by(
                Analysis.created_at.desc()
            )
            .limit(limit)
            .offset(offset)
        ).all()

        return {
            "total": total,
            "items": [
                _summary(row)
                for row in rows
            ]
        }
        

def get_analysis(
    analysis_id: int
) -> dict | None:

    with Session(engine) as session:

        row = session.get(
            Analysis,
            analysis_id
        )

        if row is None:
            return None

        return {
            **_summary(row),

            "result": json.loads(
                row.result_json
            )
        }
        
        
def delete_analysis(
    analysis_id: int
) -> bool:

    with Session(engine) as session:

        row = session.get(
            Analysis,
            analysis_id
        )

        if row is None:
            return False

        session.delete(row)

        session.commit()

        return True
    
    
def clear_history() -> int:

    with Session(engine) as session:

        count = session.query(
            Analysis
        ).delete()

        session.commit()

        return count
    
