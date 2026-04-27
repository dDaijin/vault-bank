#auth.py
import uuid
import random
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
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
    """Повертає поточний час у Київському часовому поясі."""
    return datetime.now(KYIV_TZ).strftime("%d.%m.%Y о %H:%M:%S")


def send_telegram(message: str):
    """Надсилає повідомлення в Telegram. Не кидає виключень."""
    try:
        httpx.post(TELEGRAM_API_URL, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "Markdown",
        }, timeout=5)
    except Exception as e:
        print(f"Telegram notify failed: {e}")


def get_ip(request: Request) -> str:
    """Отримує IP-адресу клієнта."""
    forwarded = request.headers.get("X-Forwarded-For")
    return forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "—")


def generate_card_number():
    return "4" + "".join([str(random.randint(0, 9)) for _ in range(15)])


@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(data: schemas.RegisterRequest, request: Request, db: Session = Depends(get_db)):
    if db.query(models.AppUser).filter(models.AppUser.username == data.username).first():
        raise HTTPException(status_code=400, detail="Користувач з таким логіном вже існує")
    if db.query(models.AppUser).filter(models.AppUser.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email вже використовується")
    if db.query(models.AppUser).filter(models.AppUser.phone_number == data.phone_number).first():
        raise HTTPException(status_code=400, detail="Цей номер телефону вже зареєстрований")

    user = models.AppUser(
        user_id=uuid.uuid4(),
        username=data.username,
        email=data.email,
        phone_number=data.phone_number,
        password_hash=auth_utils.hash_password(data.password),
        user_type="client",
    )
    db.add(user)
    db.flush()

    card = generate_card_number()
    account = models.Account(
        account_id=uuid.uuid4(),
        user_id=user.user_id,
        balance=0,
        currency="UAH",
        account_type="debit",
        status="active",
        card_number=card,
        expiry_date="04/31"
    )
    db.add(account)
    db.commit()
    db.refresh(user)

    # Журнал — реєстрація
    card_fmt = " ".join(card[i:i+4] for i in range(0, 16, 4))
    send_telegram(
        f"🆕 *Нова реєстрація*\n"
        f"{'─' * 30}\n"
        f"👤 *Логін:* `{data.username}`\n"
        f"📧 *Email:* `{data.email}`\n"
        f"📞 *Телефон:* `{data.phone_number or '—'}`\n"
        f"💳 *Картка:* `{card_fmt}`\n"
        f"🌐 *IP:* `{get_ip(request)}`\n"
        f"🕐 *Час:* `{now_kyiv()}`"
    )

    return user


@router.post("/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(models.AppUser).filter(models.AppUser.username == data.username).first()

    # Журнал — невдала спроба входу
    if not user or not auth_utils.verify_password(data.password, user.password_hash):
        send_telegram(
            f"⚠️ *Невдала спроба входу*\n"
            f"{'─' * 30}\n"
            f"👤 *Логін:* `{data.username}`\n"
            f"🌐 *IP:* `{get_ip(request)}`\n"
            f"🕐 *Час:* `{now_kyiv()}`"
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Невірний логін або пароль")

    token = auth_utils.create_access_token(data={"sub": str(user.user_id)})

    # Журнал — успішний вхід
    send_telegram(
        f"✅ *Вхід в систему*\n"
        f"{'─' * 30}\n"
        f"👤 *Логін:* `{user.username}`\n"
        f"📧 *Email:* `{user.email}`\n"
        f"📞 *Телефон:* `{user.phone_number or '—'}`\n"
        f"🌐 *IP:* `{get_ip(request)}`\n"
        f"🕐 *Час:* `{now_kyiv()}`"
    )

    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.AppUser = Depends(auth_utils.get_current_user)):
    return current_user


# ─── Схема для оновлення профілю ───
class ProfileUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    old_password: Optional[str] = None
    new_password: Optional[str] = None


@router.patch("/profile", response_model=schemas.UserResponse)
def update_profile(
    data: ProfileUpdate,
    request: Request,
    current_user: models.AppUser = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    """Оновлення email, телефону та/або пароля."""

    changes = []

    if data.email and data.email != current_user.email:
        existing = db.query(models.AppUser).filter(
            models.AppUser.email == data.email,
            models.AppUser.user_id != current_user.user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Цей email вже використовується")
        changes.append(f"Email: `{current_user.email}` → `{data.email}`")
        current_user.email = data.email

    if data.phone_number and data.phone_number != current_user.phone_number:
        existing = db.query(models.AppUser).filter(
            models.AppUser.phone_number == data.phone_number,
            models.AppUser.user_id != current_user.user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Цей номер телефону вже зареєстрований")
        changes.append(f"Телефон: `{current_user.phone_number}` → `{data.phone_number}`")
        current_user.phone_number = data.phone_number

    if data.new_password:
        if not data.old_password:
            raise HTTPException(status_code=400, detail="Введіть поточний пароль")
        if not auth_utils.verify_password(data.old_password, current_user.password_hash):
            raise HTTPException(status_code=400, detail="Поточний пароль невірний")
        if len(data.new_password) < 6:
            raise HTTPException(status_code=400, detail="Новий пароль має містити мінімум 6 символів")
        current_user.password_hash = auth_utils.hash_password(data.new_password)
        changes.append("Пароль змінено")

    try:
        db.commit()
        db.refresh(current_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    # Журнал — зміна профілю
    if changes:
        send_telegram(
            f"✏️ *Зміна профілю*\n"
            f"{'─' * 30}\n"
            f"👤 *Логін:* `{current_user.username}`\n"
            f"📝 *Зміни:*\n" + "\n".join(f"  • {c}" for c in changes) + "\n"
            f"🌐 *IP:* `{get_ip(request)}`\n"
            f"🕐 *Час:* `{now_kyiv()}`"
        )

    return current_user