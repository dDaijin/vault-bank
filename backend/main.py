from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, accounts, transactions
from loans import router as loans_router
from database import Base, engine
from support import router as support_router
from currency import router as currency_router

import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vault Bank API", version="1.0.0")

# CORS — дозволяємо всі Railway домени та localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://vaulty-bank-production-a78b.up.railway.app",
        "https://vault-bank-production.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(loans_router, prefix="/api/loans", tags=["loans"])
app.include_router(support_router, prefix="/api/support", tags=["support"])
app.include_router(currency_router, prefix="/api/currency", tags=["currency"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["accounts"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])

@app.get("/")
def root():
    return {"message": "Vault Bank API працює"}