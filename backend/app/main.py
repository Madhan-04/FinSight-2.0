import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app import config
from app.routes import auth, transactions, statement, insights, goals, chat

app = FastAPI(
    title=config.settings.PROJECT_NAME,
    description="FinSight AI Backend - Personal Finance Intelligence API",
    version="2.0.0"
)

# Set CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(statement.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to FinSight AI API",
        "nvidia_connected": config.settings.is_nvidia_configured
    }

# Database Seeding on startup
@app.on_event("startup")
def seed_database():
    print("Database seeding is disabled. Starting with a clean, production-ready empty state.")
    return

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=config.settings.HOST, port=config.settings.PORT, reload=True)
