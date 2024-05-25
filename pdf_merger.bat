::[Bat To Exe Converter]
::
::YAwzoRdxOk+EWAjk
::fBw5plQjdCyDJGyX8VAjFDhcXg2RKGSqDrA2yczU29a3q04JQfA6a7PS2buAYO0W+ELhO58u2Ro=
::YAwzuBVtJxjWCl3EqQJgSA==
::ZR4luwNxJguZRRnk
::Yhs/ulQjdF+5
::cxAkpRVqdFKZSjk=
::cBs/ulQjdF+5
::ZR41oxFsdFKZSDk=
::eBoioBt6dFKZSDk=
::cRo6pxp7LAbNWATEpCI=
::egkzugNsPRvcWATEpCI=
::dAsiuh18IRvcCxnZtBJQ
::cRYluBh/LU+EWAnk
::YxY4rhs+aU+JeA==
::cxY6rQJ7JhzQF1fEqQJQ
::ZQ05rAF9IBncCkqN+0xwdVs0
::ZQ05rAF9IAHYFVzEqQJQ
::eg0/rx1wNQPfEVWB+kM9LVsJDGQ=
::fBEirQZwNQPfEVWB+kM9LVsJDGQ=
::cRolqwZ3JBvQF1fEqQJQ
::dhA7uBVwLU+EWDk=
::YQ03rBFzNR3SWATElA==
::dhAmsQZ3MwfNWATElA==
::ZQ0/vhVqMQ3MEVWAtB9wSA==
::Zg8zqx1/OA3MEVWAtB9wSA==
::dhA7pRFwIByZRRnk
::Zh4grVQjdCyDJGyX8VAjFDhcXg2RKGSqDrA2yczU29ajrU4IWecxbJznyrCIH+0W+ELhZ6o90nxllc4eCx5KQiKPSE8ZrHxFs3bLMt+Z0w==
::YB416Ek+ZG8=
::
::
::978f952a14a936cc963da21a135fa983
@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

:: Ensure the script is executed in the root directory of the project
cd /d %~dp0

:: Starting the Flask API
echo Starting Flask API...
start /B "" cmd /C "set FLASK_APP=src\app.py && set FLASK_ENV=development && flask run"

:: Starting the React App
echo Starting React App...
start /B "" cmd /C "npm start"

echo Both applications are starting in the background...
exit