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

:: Start the Flask API and React App concurrently and log their outputs
echo Starting Flask API and React App...
start /B "" cmd /C "python src\app.py > flask_log.txt 2>&1" && start /B "" cmd /C "npm start > react_log.txt 2>&1"

echo Both applications are starting in the background...
exit
