import os
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()

class Settings:
    PROJECT_NAME: str = "FinSight AI Backend"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finsight.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", 8000))
    
    @property
    def is_gemini_configured(self) -> bool:
        return len(self.GEMINI_API_KEY.strip()) > 0

    @property
    def is_nvidia_configured(self) -> bool:
        return len(self.NVIDIA_API_KEY.strip()) > 0

settings = Settings()
