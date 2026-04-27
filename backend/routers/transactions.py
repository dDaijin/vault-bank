import uuid
import httpx
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
import auth_utils

router = APIRouter()

TELEGRAM_BOT_TOKEN = "8040863572:AAFz5ZUE3tGY9kw8J-w9ZGVkWo06Q84d0RU"
TELEGRAM_CHAT_ID   = "727081653"
TELEGRAM_API_URL   = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"


def send_telegram(message: str):
    """Надсилає сповіщення в Telegram. Не кидає виключень — тихо логує."""
    try:
        httpx.post(TELEGRAM_API_URL, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "Markdown",
        }, timeout=5)
    except Exception as e:
        print(f"Telegram notify failed: {e}")


@router.post("/transfer", response_model=schemas.TransactionResponse)
def transfer(
    data: schemas.TransferRequest,
    current_user: models.AppUser = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Рахунок відправника
    from_account = db.query(models.Account).filter(
        models.Account.user_id == current_user.user_id,
        models.Account.status == "active"
    ).first()

    if not from_account:
        raise HTTPException(status_code=404, detail="Ваш активний рахунок не знайдено")

    # 2. Рахунок отримувача за номером картки
    to_account = db.query(models.Account).filter(
        models.Account.card_number == data.to_card_number,
        models.Account.status == "active"
    ).first()

    if not to_account:
        raise HTTPException(status_code=404, detail="Картку отримувача не знайдено або вона неактивна")

    # 3. Не переказувати собі
    if from_account.account_id == to_account.account_id:
        raise HTTPException(status_code=400, detail="Неможливо переказати кошти на власну картку")

    # 4. Перевірка балансу
    current_balance = Decimal(str(from_account.balance))
    if current_balance < data.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Недостатньо коштів. На вашому рахунку: {from_account.balance} UAH"
        )

    # 5. Виконуємо переказ
    from_account.balance = current_balance - data.amount
    to_account.balance = Decimal(str(to_account.balance)) + data.amount

    # 6. Запис транзакції
    transaction = models.BankTransaction(
        transaction_id=uuid.uuid4(),
        from_account_id=from_account.account_id,
        to_account_id=to_account.account_id,
        amount=data.amount,
        type="transfer",
        status="success",
        description=data.description,
    )

    db.add(transaction)

    try:
        db.commit()
        db.refresh(transaction)
    except Exception as e:
        db.rollback()
        print(f"\n❌ КРИТИЧНА ПОМИЛКА БАЗИ: {e}\n")
        raise HTTPException(status_code=500, detail=str(e))

    # 7. Telegram-сповіщення після успішного переказу
    to_user = db.query(models.AppUser).filter(
        models.AppUser.user_id == to_account.user_id
    ).first()

    card_fmt = lambda c: " ".join(c[i:i+4] for i in range(0, 16, 4)) if c else "—"

    send_telegram(
        f"💸 *Новий переказ*\n"
        f"{'─' * 28}\n"
        f"👤 *Від:* `{current_user.username}`\n"
        f"💳 *Картка відправника:* `{card_fmt(from_account.card_number)}`\n"
        f"👤 *Кому:* `{to_user.username if to_user else '—'}`\n"
        f"💳 *Картка отримувача:* `{card_fmt(to_account.card_number)}`\n"
        f"💰 *Сума:* `{data.amount} UAH`\n"
        f"📝 *Призначення:* {data.description or '—'}"
    )

    return transaction


@router.get("/history", response_model=List[schemas.TransactionResponse])
def get_history(
    current_user: models.AppUser = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(models.Account).filter(
        models.Account.user_id == current_user.user_id
    ).first()

    if not account:
        return []

    transactions = db.query(models.BankTransaction).filter(
        (models.BankTransaction.from_account_id == account.account_id) |
        (models.BankTransaction.to_account_id == account.account_id)
    ).order_by(models.BankTransaction.created_at.desc()).limit(50).all()

    return transactions