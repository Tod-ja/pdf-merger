@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

:: Starting the Flask API
echo Starting Flask API...
start cmd /k "python -m venv venv & call venv\Scripts\activate & set FLASK_APP=app.py & set FLASK_ENV=development & flask run"

:: Starting the React App
echo Starting React App...
start cmd /k "npm start"

echo Both applications are starting...
exit
