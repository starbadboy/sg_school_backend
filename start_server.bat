@echo off
REM Singapore School Finder - Windows Batch Startup Script
REM Simple startup for Windows users

echo.
echo ========================================
echo  Singapore School Finder - Server Start
echo ========================================
echo.

REM Check if Python is available
python3 --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python3 not found. Please install Python 3.8+
    pause
    exit /b 1
)

echo Installing dependencies...
python3 -m pip install flask requests pandas beautifulsoup4 flask-cors --quiet

echo.
echo Checking P1 data file...
if not exist "sg_school_backend\src\database\p1_2024_complete_data.json" (
    echo WARNING: P1 data file not found
    echo Run: python3 extract_all_2024_p1_data.py
    echo.
    set /p continue="Continue without real data? (y/N): "
    if /i not "%continue%"=="y" (
        echo Exiting...
        pause
        exit /b 0
    )
)

echo.
echo Stopping existing servers...
taskkill /f /im python.exe >nul 2>&1

echo.
echo Starting Singapore School Finder...
echo.
echo ============================================
echo  URL: http://localhost:5002
echo  Features: Real 2024 P1 Data + AI Strategies
echo  Stop: Press Ctrl+C
echo ============================================
echo.

cd sg_school_backend
python3 src/main.py

echo.
echo Server stopped. Press any key to exit...
pause >nul 