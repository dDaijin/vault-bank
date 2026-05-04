import asyncio
import httpx
from fastapi import APIRouter
from datetime import datetime, timezone, timedelta

router = APIRouter()

async def fetch_rate(client: httpx.AsyncClient, valcode: str, date: str):
    """Отримує курс валюти за датою. Якщо немає — пробує попередній день."""
    for delta in range(5):  # пробуємо до 5 днів назад
        d = (datetime.strptime(date, "%Y%m%d") - timedelta(days=delta)).strftime("%Y%m%d")
        res = await client.get(
            f"https://bank.gov.ua/NBUStatService/v1/statdataportal/exchange"
            f"?valcode={valcode}&date={d}&json",
            timeout=10
        )
        data = res.json()
        if data and len(data) > 0 and data[0].get("rate"):
            return data[0]["rate"]
    return None

@router.get("/rates")
async def get_rates():
    """Отримує курси USD та EUR з НБУ API"""
    try:
        today = datetime.now(timezone.utc).strftime("%Y%m%d")
        async with httpx.AsyncClient() as client:
            usd, eur = await asyncio.gather(
                fetch_rate(client, "USD", today),
                fetch_rate(client, "EUR", today),
            )
        return {"usd": usd, "eur": eur}
    except Exception as e:
        return {"usd": None, "eur": None, "error": str(e)}