from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(req: LoginRequest) -> Dict[str, str]:
    if req.email and len(req.password) >= 6:
        # Generate mock token
        return {
            "access_token": f"mock_token_{req.email.split('@')[0]}",
            "token_type": "bearer",
            "user": req.email
        }
    raise HTTPException(status_code=400, detail="Invalid email or password (min 6 characters)")
