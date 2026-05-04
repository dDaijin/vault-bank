import asyncio
import httpx
from fastapi import APIRouter

router = APIRouter()

@router.get("/rates")
async def get_rates():
    """Отримує курси USD та EUR з НБУ API"""
    try:
        from datetime import datetime, timezone
        today = datetime.now(timezone.utc).strftime("%Y%m%d")
        async with httpx.AsyncClient() as client:
            usd_res, eur_res = await asyncio.gather(
                client.get(f"https://bank.gov.ua/NBUStatService/v1/statdataportal/exchange?valcode=USD&date={today}&json", timeout=10),
                client.get(f"https://bank.gov.ua/NBUStatService/v1/statdataportal/exchange?valcode=EUR&date={today}&json", timeout=10),
            )
        usd_data = usd_res.json()
        eur_data = eur_res.json()
        return {
            "usd": usd_data[0]["rate"] if usd_data else None,
            "eur": eur_data[0]["rate"] if eur_data else None,
            "date": today,
        }
    except Exception as e:
        return {"usd": None, "eur": None, "error": str(e)}