# Start backend server
cd backend
.\.venv\Scripts\Activate.ps1
Start-Process powershell -ArgumentList "uvicorn app.main:app --reload" -NoNewWindow

# Start frontend server
cd ..
cd frontend
npm start 