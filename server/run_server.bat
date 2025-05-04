@echo off
echo Starting REPORTLY server...

REM Set Google API Key
set GOOGLE_API_KEY=AIzaSyBaNH7xn39vkHxd-mnN3R8AB5iQVV4h1lw
echo API key set successfully.

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check for required packages
echo Checking required packages...
python -c "import fastapi, uvicorn, langchain, langchain_google_genai" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing required packages...
    pip install fastapi uvicorn langchain langchain-google-genai
    if %ERRORLEVEL% neq 0 (
        echo Failed to install required packages
        pause
        exit /b 1
    )
)

echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop the server

REM Start the server
python langchain_server.py

pause 