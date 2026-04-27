import uuid
import httpx
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth_utils

router = APIRouter()

TELEGRAM_BOT_TOKEN = "8040863572:AAFz5ZUE3tGY9kw8J-w9ZGVkWo06Q84d0RU"
TELEGRAM_CHAT_ID   = "727081653"
TELEGRAM_API_URL   = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
KYIV_TZ = timezone(timedelta(hours=3))


def now_kyiv() -> str:
    return datetime.now(KYIV_TZ).strftime("%d.%m.%Y о %H:%M:%S")


def send_telegram(message: str):
    try:
        httpx.post(TELEGRAM_API_URL, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "Markdown",
        }, timeout=5)
    except Exception as e:
        print(f"Telegram notify failed: {e}")


def card_fmt(card: str) -> str:
    if not card:
        return "—"
    return " ".join(card[i:i+4] for i in range(0, 16, 4))


@router.post("/apply", response_model=schemas.LoanResponse)
def apply_for_loan(
    data: schemas.LoanCreate,
    current_user: models.AppUser = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    """Подача заявки на кредит"""
    existing_loan = db.query(models.Loan).filter(
        models.Loan.user_id == current_user.user_id,
        models.Loan.status == "active"
    ).first()

    if existing_loan:
        raise HTTPException(
            status_code=400,
            detail="У вас вже є активний кредит. Спочатку погасіть поточний."
        )

    account = db.query(models.Account).filter(
        models.Account.user_id == current_user.user_id,
        models.Account.status == "active"
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Активний рахунок не знайдено")

    now = datetime.now(timezone.utc)
    due_date = now + relativedelta(months=data.term_months)

    new_loan = models.Loan(
        loan_id=uuid.uuid4(),
        user_id=current_user.user_id,
        account_id=account.account_id,
        amount=data.amount,
        remaining_amount=data.amount,
        term_months=data.term_months,
        due_date=due_date,
        is_overdue=False,
    )

    account.balance = Decimal(str(account.balance)) + data.amount
    db.add(new_loan)

    try:
        db.commit()
        db.refresh(new_loan)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    # Telegram — оформлення кредиту
    send_telegram(
        f"💳 *Новий кредит оформлено*\n"
        f"{'─' * 30}\n"
        f"👤 *Клієнт:* `{current_user.username}`\n"
        f"📧 *Email:* `{current_user.email}`\n"
        f"📞 *Телефон:* `{current_user.phone_number or '—'}`\n"
        f"💳 *Картка:* `{card_fmt(account.card_number)}`\n"
        f"{'─' * 30}\n"
        f"💰 *Сума кредиту:* `{data.amount} UAH`\n"
        f"📅 *Термін:* `{data.term_months} міс.`\n"
        f"📆 *Дата погашення:* `{due_date.astimezone(KYIV_TZ).strftime('%d.%m.%Y')}`\n"
        f"📈 *Ставка:* `15% річних`\n"
        f"🕐 *Час:* `{now_kyiv()}`"
    )

    return new_loan


@router.get("/my", response_model=schemas.LoanResponse)
def get_my_loan(
    current_user: models.AppUser = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    """Отримання активного кредиту. Автоматично ставить is_overdue якщо термін минув."""
    loan = db.query(models.Loan).filter(
        models.Loan.user_id == current_user.user_id,
        models.Loan.status == "active"
    ).first()

    if not loan:
        raise HTTPException(status_code=404, detail="Активний кредит не знайдено")

    now = datetime.now(timezone.utc)
    if loan.due_date < now and loan.remaining_amount > 0 and not loan.is_overdue:
        loan.is_overdue = True
        db.commit()
        db.refresh(loan)

        # Telegram — прострочення кредиту
        account = db.query(models.Account).filter(
            models.Account.user_id == current_user.user_id,
            models.Account.status == "active"
        ).first()
        send_telegram(
            f"🚨 *Кредит прострочено!*\n"
            f"{'─' * 30}\n"
            f"👤 *Клієнт:* `{current_user.username}`\n"
            f"📧 *Email:* `{current_user.email}`\n"
            f"📞 *Телефон:* `{current_user.phone_number or '—'}`\n"
            f"💳 *Картка:* `{card_fmt(account.card_number if account else None)}`\n"
            f"{'─' * 30}\n"
            f"💸 *Залишок боргу:* `{loan.remaining_amount} UAH`\n"
            f"📆 *Дата була:* `{loan.due_date.astimezone(KYIV_TZ).strftime('%d.%m.%Y')}`\n"
            f"⚠️ *Операції клієнта заблоковано*\n"
            f"🕐 *Час виявлення:* `{now_kyiv()}`"
        )

    return loan


@router.post("/{loan_id}/repay")
def repay_loan(
    loan_id: uuid.UUID,
    current_user: models.AppUser = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    """Дострокове погашення кредиту. Знімає блокування операцій."""
    loan = db.query(models.Loan).filter(
        models.Loan.loan_id == loan_id,
        models.Loan.user_id == current_user.user_id
    ).first()

    if not loan or loan.status == "paid":
        raise HTTPException(status_code=404, detail="Активний кредит не знайдено")

    account = db.query(models.Account).filter(
        models.Account.user_id == current_user.user_id,
        models.Account.status == "active"
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Активний рахунок не знайдено")

    current_balance = Decimal(str(account.balance))
    if current_balance < loan.remaining_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Недостатньо коштів. Потрібно: {loan.remaining_amount} UAH, на рахунку: {account.balance} UAH"
        )

    repaid_amount = loan.remaining_amount
    was_overdue   = loan.is_overdue

    # Погашення
    account.balance      = current_balance - loan.remaining_amount
    loan.remaining_amount = Decimal("0.00")
    loan.status           = "paid"
    loan.is_overdue       = False

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    # Telegram — погашення кредиту
    send_telegram(
        f"{'🔓' if was_overdue else '✅'} *Кредит погашено*"
        f"{' (було прострочено)' if was_overdue else ''}\n"
        f"{'─' * 30}\n"
        f"👤 *Клієнт:* `{current_user.username}`\n"
        f"📧 *Email:* `{current_user.email}`\n"
        f"📞 *Телефон:* `{current_user.phone_number or '—'}`\n"
        f"💳 *Картка:* `{card_fmt(account.card_number)}`\n"
        f"{'─' * 30}\n"
        f"💰 *Сплачено:* `{repaid_amount} UAH`\n"
        f"💵 *Залишок балансу:* `{account.balance} UAH`\n"
        f"{'🔓 *Операції розблоковано*' + chr(10) if was_overdue else ''}"
        f"🕐 *Час:* `{now_kyiv()}`"
    )

    return {"message": "Кредит успішно погашено!"}