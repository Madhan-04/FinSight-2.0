from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app import models, schemas

# --- Transaction CRUD ---
def get_transaction(db: Session, transaction_id: int):
    return db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()

def get_transactions(db: Session, skip: int = 0, limit: int = 100, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[models.Transaction]:
    query = db.query(models.Transaction)
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    return query.order_by(desc(models.Transaction.date)).offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: schemas.TransactionCreate) -> models.Transaction:
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def create_bulk_transactions(db: Session, transactions: List[schemas.TransactionCreate]) -> List[models.Transaction]:
    db_txs = [models.Transaction(**tx.dict()) for tx in transactions]
    db.add_all(db_txs)
    db.commit()
    # Skip individual model refreshes for performance on bulk insertions
    return db_txs

def update_transaction(db: Session, transaction_id: int, transaction: schemas.TransactionUpdate) -> Optional[models.Transaction]:
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return None
    
    update_data = transaction.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_transaction, key, value)
        
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, transaction_id: int) -> bool:
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return False
    db.delete(db_transaction)
    db.commit()
    return True

# --- Statement CRUD ---
def get_statement(db: Session, statement_id: int):
    return db.query(models.Statement).filter(models.Statement.id == statement_id).first()

def get_statements(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Statement).order_by(desc(models.Statement.uploaded_at)).offset(skip).limit(limit).all()

def create_statement(db: Session, statement: schemas.StatementCreate) -> models.Statement:
    db_statement = models.Statement(**statement.dict())
    db.add(db_statement)
    db.commit()
    db.refresh(db_statement)
    return db_statement

def delete_statement(db: Session, statement_id: int) -> bool:
    db_statement = get_statement(db, statement_id)
    if not db_statement:
        return False
    db.delete(db_statement)
    db.commit()
    return True

# --- Goal CRUD ---
def get_goal(db: Session, goal_id: int):
    return db.query(models.Goal).filter(models.Goal.id == goal_id).first()

def get_goals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Goal).offset(skip).limit(limit).all()

def create_goal(db: Session, goal: schemas.GoalCreate) -> models.Goal:
    db_goal = models.Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def update_goal(db: Session, goal_id: int, goal: schemas.GoalUpdate) -> Optional[models.Goal]:
    db_goal = get_goal(db, goal_id)
    if not db_goal:
        return None
    
    update_data = goal.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_goal, key, value)
        
    db.commit()
    db.refresh(db_goal)
    return db_goal

def delete_goal(db: Session, goal_id: int) -> bool:
    db_goal = get_goal(db, goal_id)
    if not db_goal:
        return False
    db.delete(db_goal)
    db.commit()
    return True

# --- ChatMessage CRUD ---
def get_chat_history(db: Session, limit: int = 50) -> List[models.ChatMessage]:
    return db.query(models.ChatMessage).order_by(models.ChatMessage.timestamp).limit(limit).all()

def create_chat_message(db: Session, message: schemas.ChatMessageCreate) -> models.ChatMessage:
    db_msg = models.ChatMessage(**message.dict())
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def clear_chat_history(db: Session):
    db.query(models.ChatMessage).delete()
    db.commit()
