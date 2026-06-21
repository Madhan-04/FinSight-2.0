# 💰 FinSight 2.0 — Personal Finance Intelligence

> An AI-powered personal finance dashboard with bank statement parsing, spending analytics, budget tracking, and an AI advisor coach.

---

## 🚀 Quick Start (One-Click)

### Step 1 — First Time Setup Only
Run this **once** to install all dependencies:

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2 — Start Servers

**Option A: Double-click** `start.bat` in the project root  
_(Opens both servers automatically and launches the browser)_

**Option B: Manual**
```bash
# Terminal 1 — Backend
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### Step 3 — Open App

| Service | URL |
|---|---|
| 🌐 App | http://localhost:3000 |
| ⚙️ API | http://127.0.0.1:8000 |
| 📄 Docs | http://127.0.0.1:8000/docs |

---

## 📦 Project Structure

```
FinSight_2.0/
├── start.bat              ← Double-click to start everything
├── stop.bat               ← Double-click to stop everything
├── backend/               ← FastAPI Python server
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── crud.py
│   │   ├── routes/        ← API endpoints
│   │   └── services/      ← AI + business logic
│   └── requirements.txt
└── frontend/              ← Next.js React app
    ├── src/
    │   ├── app/           ← Pages (dashboard, chat, analytics…)
    │   ├── components/    ← UI components
    │   └── context/       ← Global state
    └── package.json
```

---

## 🔧 Requirements

### Python (Backend)
- Python 3.10+
- All packages in `backend/requirements.txt`

```
fastapi
uvicorn
sqlalchemy
python-multipart
pypdf
pandas
openpyxl
xlrd
requests
```

### Node.js (Frontend)
- Node.js 18+
- npm 9+

---

## 📤 Upload to GitHub

### First Time (New Repository)

```bash
# 1. Initialize git in project root
cd "D:\My_Project\Expense_Tracker\FinSight_2.0"
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "Initial commit: FinSight 2.0"

# 4. Link to GitHub repo (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/finsight-2.0.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

### Subsequent Updates

```bash
git add .
git commit -m "Your update message"
git push
```

---

## 🌐 Deploy Online (Free Options)

### Option A — Railway.app (Recommended, easiest)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your `FinSight_2.0` repo
4. Railway auto-detects and deploys both services
5. You get a live URL like `https://finsight.railway.app`

### Option B — Render.com

**Backend:**
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo → select `backend/` folder
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Frontend:**
1. New → Static Site or Web Service
2. Select `frontend/` folder
3. Build: `npm run build`
4. Start: `npm start`

### Option C — Vercel (Frontend only)

```bash
cd frontend
npx vercel
```
Follow the prompts — your frontend will be live in 60 seconds at `https://your-app.vercel.app`

---

## 🔑 Environment Variables

Create a `.env` file in `backend/`:

```env
NVIDIA_API_KEY=your_nvidia_nim_api_key_here
DATABASE_URL=sqlite:///./finsight.db
```

> **Note:** The app works without an NVIDIA API key — it uses smart built-in fallbacks for all AI features.

---

## 🛑 Stop Servers

- **Double-click** `stop.bat`  
- Or press `Ctrl+C` in both terminal windows

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| Port 3000 already in use | Run `stop.bat` or restart PC |
| Port 8000 already in use | Run `stop.bat` |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` in `/backend` |
| `npm: command not found` | Install Node.js from [nodejs.org](https://nodejs.org) |
| Backend won't start | Make sure Python 3.10+ is installed |
| Frontend won't start | Run `npm install` in `/frontend` first |

---

*Built with FastAPI + Next.js + SQLite + NVIDIA NIM AI*
