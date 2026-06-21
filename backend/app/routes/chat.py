from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app import database, crud, schemas
from app.services.nvidia_service import NvidiaService
from app.services.analyzer import FinancialAnalyzer

router = APIRouter(prefix="/chat", tags=["AI Advisor Chat"])

@router.get("/history", response_model=List[schemas.ChatMessage])
def get_history(db: Session = Depends(database.get_db)):
    return crud.get_chat_history(db, limit=50)

@router.post("/", response_model=schemas.ChatResponse)
def chat_with_advisor(req: schemas.ChatRequest, db: Session = Depends(database.get_db)):
    try:
        user_msg = req.message
        
        # 1. Fetch Chat History
        history_msgs = crud.get_chat_history(db, limit=15)
        history_formatted = []
        for h in history_msgs:
            role = "user" if h.sender == "user" else "model"
            history_formatted.append({"role": role, "content": h.message})
            
        # 2. Fetch User Financial Context
        txs = crud.get_transactions(db, limit=100)
        goals = crud.get_goals(db)
        
        overview = {
            "total_income": sum(t.amount for t in txs if t.type == "credit"),
            "total_expenses": sum(t.amount for t in txs if t.type == "debit"),
            "total_savings": sum(t.amount for t in txs if t.type == "credit") - sum(t.amount for t in txs if t.type == "debit")
        }
        
        health_score = FinancialAnalyzer.calculate_health_score(txs, goals)
        subscriptions = FinancialAnalyzer.detect_subscriptions(txs)
        anomalies = FinancialAnalyzer.detect_anomalies(txs)
        
        context = {
            "overview": overview,
            "health_score": health_score,
            "subscriptions": subscriptions,
            "anomalies": anomalies,
            "goals": [{"name": g.name, "target": g.target_amount, "current": g.current_amount} for g in goals],
            "transactions": [{"date": t.date, "merchant": t.merchant, "amount": t.amount, "type": t.type, "category": t.category} for t in txs[:10]]
        }
        
        # 3. Call NVIDIA
        reply = NvidiaService.generate_chat_response(user_msg, history_formatted, context, req.education_level)
        
        # 4. Save to Database
        # Save user message
        crud.create_chat_message(db, schemas.ChatMessageCreate(sender="user", message=user_msg))
        # Save AI reply
        crud.create_chat_message(db, schemas.ChatMessageCreate(sender="ai", message=reply))
        
        return schemas.ChatResponse(reply=reply, audio_data=None)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate advisor response: {str(e)}")

@router.delete("/history")
def clear_history(db: Session = Depends(database.get_db)):
    crud.clear_chat_history(db)
    return {"detail": "Chat history cleared successfully"}
