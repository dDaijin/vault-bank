import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
import models
import auth_utils

router = APIRouter()

TELEGRAM_BOT_TOKEN = "8040863572:AAFz5ZUE3tGY9kw8J-w9ZGVkWo06Q84d0RU"
TELEGRAM_CHAT_ID   = "727081653"
TELEGRAM_API_URL   = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"


class SupportRequest(BaseModel):
    problem: str


@router.post("/send")
def send_support_message(
    data: SupportRequest,
    current_user: models.AppUser = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    """Надсилає звернення до підтримки у Telegram"""
    if not data.problem or len(data.problem.strip()) < 10:
        raise HTTPException(status_code=400, detail="Опис проблеми занадто короткий")

    # Отримуємо рахунок для номера картки
    account = db.query(models.Account).filter(
        models.Account.user_id == current_user.user_id,
        models.Account.status == "active"
    ).first()

    card = account.card_number if account else "—"
    # Форматуємо номер картки з пробілами
    if card and card != "—":
        card = " ".join(card[i:i+4] for i in range(0, 16, 4))

    # Формуємо повідомлення для Telegram
    message = (
        f"🆘 *Нове звернення до підтримки*\n"
        f"{'─' * 30}\n"
        f"👤 *Користувач:* `{current_user.username}`\n"
        f"📧 *Email:* `{current_user.email}`\n"
        f"📞 *Телефон:* `{current_user.phone_number or '—'}`\n"
        f"💳 *Картка:* `{card}`\n"
        f"{'─' * 30}\n"
        f"📝 *Проблема:*\n{data.problem.strip()}"
    )

    try:
        response = httpx.post(TELEGRAM_API_URL, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "Markdown",
        }, timeout=10)

        if not response.is_success:
            raise HTTPException(
                status_code=502,
                detail=f"Помилка Telegram API: {response.text}"
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Telegram не відповідає, спробуйте пізніше")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Помилка з'єднання: {str(e)}")

    return {"message": "Звернення успішно надіслано"}