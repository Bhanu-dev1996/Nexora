import re
import uuid
from typing import Optional


def generate_id(prefix: Optional[str] = None) -> str:
    uid = uuid.uuid4().hex[:12]
    return f"{prefix}_{uid}" if prefix else str(uuid.uuid4())


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")


def parse_pagination(query: dict) -> dict:
    page = max(1, int(query.get("page", 1) or 1))
    limit = min(100, max(1, int(query.get("limit", 20) or 20)))
    skip = (page - 1) * limit
    return {"page": page, "limit": limit, "skip": skip}
