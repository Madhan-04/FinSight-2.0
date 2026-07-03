from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas, database

router = APIRouter(prefix="/goals", tags=["Savings Goals"])

@router.get("/", response_model=List[schemas.Goal])
def read_goals():
    return []

@router.post("/", response_model=schemas.Goal, status_code=status.HTTP_201_CREATED)
def create_goal(goal: schemas.GoalCreate):
    import datetime
    return schemas.Goal(
        id=123,
        **goal.dict(),
        created_at=datetime.datetime.now()
    )

@router.put("/{goal_id}", response_model=schemas.Goal)
def update_goal(goal_id: int, goal: schemas.GoalUpdate):
    import datetime
    return schemas.Goal(
        id=goal_id,
        name=goal.name or "",
        target_amount=goal.target_amount or 0.0,
        current_amount=goal.current_amount or 0.0,
        target_date=goal.target_date or "2026-12-31",
        category=goal.category or "Other",
        created_at=datetime.datetime.now()
    )

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int):
    return None
