import uuid
from sqlalchemy import Column, String, Numeric, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base


class AppUser(Base):
    __tablename__ = "app_user"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone_number = Column(String(30))
    password_hash = Column(String(255), nullable=False)
    user_type = Column(String(30), default="client")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Account(Base):
    __tablename__ = "account"

    account_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_user.user_id"), nullable=False)
    balance = Column(Numeric(19, 2), default=0)
    currency = Column(String(3), default="UAH")
    account_type = Column(String(30), default="debit")
    status = Column(String(30), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    card_number = Column(String(16), unique=True, nullable=True)
    expiry_date = Column(String(5), nullable=True)


class BankTransaction(Base):
    __tablename__ = "bank_transaction"

    transaction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_account_id = Column(UUID(as_uuid=True), ForeignKey("account.account_id"))
    to_account_id = Column(UUID(as_uuid=True), ForeignKey("account.account_id"))
    amount = Column(Numeric(19, 2), nullable=False)
    type = Column(String(30), nullable=False)
    status = Column(String(30), default="completed")
    description = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Loan(Base):
    __tablename__ = "loans"

    loan_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_user.user_id"), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("account.account_id"), nullable=False)
    amount = Column(Numeric(19, 2), nullable=False)
    remaining_amount = Column(Numeric(19, 2), nullable=False)
    interest_rate = Column(Numeric(5, 2), default=15.0)
    status = Column(String(20), default="active")

    # Нові поля для таймера
    term_months = Column(Integer, nullable=False, default=12)
    due_date = Column(DateTime(timezone=True), nullable=False)
    is_overdue = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CreditScore(Base):
    __tablename__ = "credit_score"

    credit_score_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_user.user_id"))
    score = Column(Integer, default=700)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_log"

    audit_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_user.user_id"))
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(UUID(as_uuid=True))
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now())