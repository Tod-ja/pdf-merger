@echo off
echo Starting Flask API...
start cmd /k "cd /d path\to\flask\app & set FLASK_APP=app.py & set FLASK_ENV=development & flask run"

echo Starting React App...
start cmd /k "cd /d path\to\react\app & npm start"

exit
