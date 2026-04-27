from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth_utils
import uuid

router = APIRouter()


@router.get("/my", response_model=schemas.AccountResponse)
def get_my_account(
    current_user: models.AppUser = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(models.Account).filter(
        models.Account.user_id == current_user.user_id,
        models.Account.status == "active"
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Рахунок не знайдено")

    return account


@router.get("/search")
def search_account(
    username: str = None,
    card_number: str = None,
    current_user: models.AppUser = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    """Пошук рахунку за логіном або номером картки."""
    if not username and not card_number:
        raise HTTPException(status_code=400, detail="Вкажіть username або card_number")

    if username:
        if username == current_user.username:
            raise HTTPException(status_code=400, detail="Неможливо переказати кошти собі")
        user = db.query(models.AppUser).filter(models.AppUser.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"Користувача '{username}' не знайдено")
        account = db.query(models.Account).filter(
            models.Account.user_id == user.user_id,
            models.Account.status == "active"
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="У цього користувача немає активного рахунку")

    else:  # card_number
        account = db.query(models.Account).filter(
            models.Account.card_number == card_number,
            models.Account.status == "active"
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Картку не знайдено або вона неактивна")
        if account.user_id == current_user.user_id:
            raise HTTPException(status_code=400, detail="Неможливо переказати кошти на власну картку")
        user = db.query(models.AppUser).filter(models.AppUser.user_id == account.user_id).first()

    return {
        "username": user.username if user else "—",
        "card_number": account.card_number,
        "account_id": str(account.account_id),
    }


@router.get("/{account_id}/exists")
def check_account_exists(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: models.AppUser = Depends(auth_utils.get_current_user)
):
    try:
        uid = uuid.UUID(account_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Невірний формат ID рахунку")

    account = db.query(models.Account).filter(
        models.Account.account_id == uid,
        models.Account.status == "active"
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Рахунок не знайдено в системі")

    return {"exists": True, "account_id": str(account.account_id)}