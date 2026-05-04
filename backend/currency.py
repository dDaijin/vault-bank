import asyncio
import httpx
from fastapi import APIRouter

router = APIRouter()

@router.get("/rates")
async def get_rates():
    """Отримує курси USD та EUR відносно UAH"""
    try:
        async with httpx.AsyncClient() as client:
            # Безкоштовне API без ключа — курс відносно UAH
            res = await client.get(
                "https://api.exchangerate-api.com/v4/latest/UAH",
                timeout=10
            )
            data = res.json()
            rates = data.get("rates", {})
            # Нам потрібно скільки UAH за 1 USD/EUR
            # API дає скільки USD за 1 UAH, тому берем обернене
            usd_per_uah = rates.get("USD")
            eur_per_uah = rates.get("EUR")
            return {
                "usd": round(1 / usd_per_uah, 2) if usd_per_uah else None,
                "eur": round(1 / eur_per_uah, 2) if eur_per_uah else None,
                "source": "exchangerate-api.com",
            }
    except Exception as e:
        return {"usd": None, "eur": None, "error": str(e)}