@echo off
echo ========================================
echo Find a Grave Scraper
echo Memorial Park Cemetery
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher from python.org
    pause
    exit /b 1
)

echo Python found!
echo.

REM Check if required packages are installed
python -c "import requests" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install required packages
        pause
        exit /b 1
    )
)

echo.
echo Starting scraper...
echo This may take 10-30 minutes depending on network speed.
echo.
echo Press Ctrl+C to cancel at any time.
echo.

python scrape_findagrave.py

echo.
echo ========================================
echo Scraping complete!
echo ========================================
echo.
echo Check for the file: findagrave_records_complete.json
echo.
pause

