from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas, database

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/", response_model=List[schemas.Transaction])
def read_transactions():
    return []

@router.post("/", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(transaction: schemas.TransactionCreate):
    import datetime
    return schemas.Transaction(
        id=123,
        **transaction.dict(),
        created_at=datetime.datetime.now()
    )

@router.put("/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(transaction_id: int, transaction: schemas.TransactionUpdate):
    import datetime
    return schemas.Transaction(
        id=transaction_id,
        date=transaction.date or "2026-06-01",
        raw_description=transaction.raw_description or "",
        merchant=transaction.merchant or "",
        amount=transaction.amount or 0.0,
        type=transaction.type or "debit",
        category=transaction.category or "Other",
        payment_method=transaction.payment_method or "Other",
        is_recurring=transaction.is_recurring or False,
        created_at=datetime.datetime.now()
    )

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int):
    return None
