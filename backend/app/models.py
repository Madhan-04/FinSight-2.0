from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Statement(Base):
    __tablename__ = "statements"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    bank_name = Column(String, nullable=True)
    period = Column(String, nullable=True)
    total_transactions = Column(Integer, default=0)
    total_debits = Column(Float, default=0.0)
    total_credits = Column(Float, default=0.0)

    # Relationships
    transactions = relationship("Transaction", back_populates="statement", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)  # YYYY-MM-DD
    raw_description = Column(String)
    merchant = Column(String, index=True)
    amount = Column(Float)
    type = Column(String)  # 'debit' or 'credit'
    category = Column(String, index=True)
    payment_method = Column(String)  # 'UPI', 'NetBanking', 'Card', 'Cash', 'Other'
    is_recurring = Column(Boolean, default=False)
    statement_id = Column(Integer, ForeignKey("statements.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    statement = relationship("Statement", back_populates="transactions")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    target_amount = Column(Float)
    current_amount = Column(Float, default=0.0)
    target_date = Column(String)  # YYYY-MM-DD
    category = Column(String)  # 'Emergency Fund', 'Vehicle', 'Education', 'Vacation', 'Custom'
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String)  # 'user' or 'ai'
    message = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
