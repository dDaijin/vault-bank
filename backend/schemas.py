from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime
import uuid


# ─── AUTH ───────────────────────────────────────
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── USER ───────────────────────────────────────
class UserResponse(BaseModel):
    user_id: uuid.UUID
    username: str
    email: str
    phone_number: Optional[str]
    user_type: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── ACCOUNT ────────────────────────────────────
class AccountResponse(BaseModel):
    account_id: uuid.UUID
    user_id: uuid.UUID
    balance: Decimal
    currency: str
    account_type: str
    status: str
    card_number: str
    expiry_date: str

    class Config:
        from_attributes = True


# ─── TRANSACTIONS ────────────────────────────────
class TransferRequest(BaseModel):
    to_card_number: str = Field(..., min_length=16, max_length=16)
    amount: Decimal = Field(..., gt=0)
    description: Optional[str] = None


class TransactionResponse(BaseModel):
    transaction_id: uuid.UUID
    from_account_id: Optional[uuid.UUID]
    to_account_id: Optional[uuid.UUID]
    amount: Decimal
    type: str
    status: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── LOANS ──────────────────────────────────────
class LoanCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    term_months: int = Field(..., gt=0, description="Термін кредиту в місяцях")


class LoanResponse(BaseModel):
    loan_id: uuid.UUID
    amount: Decimal
    remaining_amount: Decimal
    interest_rate: Decimal
    status: str
    term_months: int
    due_date: datetime       # фронтенд використовує для таймера
    is_overdue: bool         # фронтенд використовує для блокування кнопок
    created_at: datetime

    class Config:
        from_attributes = True