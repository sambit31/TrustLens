import json
from collections import Counter
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .connection import engine
from .models import Analysis


def get_stats(days: int = 30) -> dict:

    with Session(engine) as session:

        total = session.scalar(select(func.count(Analysis.id))) or 0

        by_prediction = dict(session.execute(
            select(Analysis.prediction, func.count())
            .group_by(Analysis.prediction)
        ).all())

        by_input_type = dict(session.execute(
            select(Analysis.input_type, func.count())
            .group_by(Analysis.input_type)
        ).all())

        # Articles inside PDFs count too
        doc_fake, doc_real, doc_unc, doc_articles = session.execute(
            select(
                func.coalesce(func.sum(Analysis.fake_count), 0),
                func.coalesce(func.sum(Analysis.real_count), 0),
                func.coalesce(func.sum(Analysis.uncertain_count), 0),
                func.coalesce(func.sum(Analysis.article_count), 0),
            ).where(Analysis.input_type == "document")
        ).one()

        # Analyses of the last `days` days, for the activity chart
        since = datetime.now(timezone.utc) - timedelta(days=days - 1)
        since = since.replace(hour=0, minute=0, second=0, microsecond=0)

        recent = session.execute(
            select(Analysis.created_at, Analysis.prediction)
            .where(Analysis.created_at >= since)
        ).all()

        # Latest 300 results, for the "common fake signals" words
        rows_for_words = session.execute(
            select(Analysis.result_json)
            .order_by(Analysis.created_at.desc())
            .limit(300)
        ).scalars().all()

    # ---- Top "fake" words (single analyses + every PDF article)
    word_counter: Counter = Counter()

    for raw in rows_for_words:
        try:
            result = json.loads(raw)
        except ValueError:
            continue

        items = result.get("articles") or [result]

        for item in items:
            if item.get("prediction") != "Likely Fake":
                continue
            for w in (item.get("explanation") or {}).get("fake_words", [])[:5]:
                word_counter[w["word"]] += 1

    # ---- Daily timeline, with empty days filled in
    today = datetime.now(timezone.utc).date()

    timeline = {
        (today - timedelta(days=i)).isoformat(): {
            "fake": 0, "real": 0, "uncertain": 0, "document": 0,
        }
        for i in range(days - 1, -1, -1)
    }

    keys = {"Likely Fake": "fake", "Likely Real": "real", "Uncertain": "uncertain"}

    for created_at, prediction in recent:
        day = created_at.date().isoformat() if created_at else None
        if day in timeline:
            timeline[day][keys.get(prediction, "document")] += 1

    return {
        "total_analyses": total,

        "by_input_type": {
            "text": by_input_type.get("text", 0),
            "url": by_input_type.get("url", 0),
            "document": by_input_type.get("document", 0),
        },

        # Every verdict: texts/URLs plus each article inside PDFs
        "verdicts": {
            "fake": by_prediction.get("Likely Fake", 0) + int(doc_fake),
            "real": by_prediction.get("Likely Real", 0) + int(doc_real),
            "uncertain": by_prediction.get("Uncertain", 0) + int(doc_unc),
        },

        "articles_in_documents": int(doc_articles),

        "timeline": [{"date": d, **v} for d, v in timeline.items()],

        "top_fake_words": [
            {"word": w, "count": c}
            for w, c in word_counter.most_common(15)
        ],
    }