from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas, database

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 100, start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    transactions = crud.get_transactions(db, skip=skip, limit=limit, start_date=start_date, end_date=end_date)
    return transactions

@router.post("/", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(database.get_db)):
    return crud.create_transaction(db=db, transaction=transaction)

@router.put("/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(transaction_id: int, transaction: schemas.TransactionUpdate, db: Session = Depends(database.get_db)):
    db_tx = crud.update_transaction(db=db, transaction_id=transaction_id, transaction=transaction)
    if db_tx is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_tx

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_transaction(db=db, transaction_id=transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return None
