# Singapore School Finder - PowerShell Startup Script
# Handles all dependencies and starts the Flask server automatically

Write-Host "🎓 Singapore School Finder - Server Startup" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan

# Function to print colored messages
function Write-Status {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    switch ($Type) {
        "Success" { Write-Host $Message -ForegroundColor Green }
        "Warning" { Write-Host $Message -ForegroundColor Yellow }
        "Error" { Write-Host $Message -ForegroundColor Red }
        "Info" { Write-Host $Message -ForegroundColor Cyan }
        default { Write-Host $Message }
    }
}

# Check Python version
Write-Status "🐍 Checking Python version..." "Info"
try {
    $pythonVersion = python3 --version 2>&1
    if ($pythonVersion -match "Python (\d+)\.(\d+)") {
        $major = [int]$matches[1]
        $minor = [int]$matches[2]
        if ($major -ge 3 -and $minor -ge 8) {
            Write-Status "✅ $pythonVersion - OK" "Success"
        } else {
            Write-Status "❌ $pythonVersion - Need Python 3.8+" "Error"
            exit 1
        }
    }
} catch {
    Write-Status "❌ Python3 not found. Please install Python 3.8+" "Error"
    exit 1
}

# Install dependencies
Write-Status "📦 Installing required dependencies..." "Info"
$packages = @("flask", "requests", "pandas", "beautifulsoup4", "flask-cors")

foreach ($package in $packages) {
    Write-Status "  Installing $package..." "Info"
    try {
        python3 -m pip install $package --quiet
        Write-Status "  ✅ $package ready" "Success"
    } catch {
        Write-Status "  ⚠️ $package installation issue (might be already installed)" "Warning"
    }
}

Write-Status "✅ Dependencies ready!" "Success"

# Check P1 data file
Write-Status "📊 Checking P1 data file..." "Info"
$dataFile = "sg_school_backend\src\database\p1_2024_complete_data.json"

if (Test-Path $dataFile) {
    $fileSize = (Get-Item $dataFile).Length
    Write-Status "✅ P1 data file found ($($fileSize) bytes)" "Success"
} else {
    Write-Status "❌ P1 data file not found" "Error"
    Write-Status "  Run the data extraction script first:" "Warning"
    Write-Status "  python3 extract_all_2024_p1_data.py" "Warning"
    
    $continue = Read-Host "`nDo you want to continue without real data? (y/N)"
    if ($continue.ToLower() -ne 'y') {
        Write-Status "Exiting. Please create the data file first." "Warning"
        exit 0
    }
}

# Kill existing servers
Write-Status "🔄 Checking for existing servers..." "Info"
try {
    if ($IsWindows -or $env:OS -eq "Windows_NT") {
        Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
    } else {
        # macOS/Linux
        Start-Process -FilePath "pkill" -ArgumentList "-f", "main.py" -Wait -NoNewWindow -ErrorAction SilentlyContinue
    }
    Write-Status "✅ Cleared existing servers" "Success"
} catch {
    Write-Status "  No existing servers found" "Info"
}

# Wait a moment
Start-Sleep -Seconds 1

# Start server
Write-Status "🚀 Starting Singapore School Finder server..." "Info"

# Check if backend directory exists
if (-not (Test-Path "sg_school_backend")) {
    Write-Status "❌ Backend directory not found!" "Error"
    Write-Status "  Make sure you're in the project root directory" "Error"
    exit 1
}

# Change to backend directory
Set-Location "sg_school_backend"

# Start the server
try {
    Write-Status "" "Info"
    Write-Status ("=" * 60) "Success"
    Write-Status "🎓 SINGAPORE SCHOOL FINDER STARTING" "Success"
    Write-Status ("=" * 60) "Success"
    Write-Status "📍 URL: http://localhost:5002" "Success"
    Write-Status "🔥 Features: Real 2024 P1 Data + AI Strategies" "Success"
    Write-Status "🛑 Stop server: Press Ctrl+C" "Warning"
    Write-Status ("=" * 60) "Success"
    Write-Status "" "Info"
    
    # Set environment variables
    $env:FLASK_APP = "src/main.py"
    $env:FLASK_ENV = "development"
    
    # Start Flask server
    python3 src/main.py
    
} catch {
    Write-Status "❌ Error starting server: $_" "Error"
} finally {
    Write-Status "`n🛑 Server stopped" "Warning"
    Write-Status "👋 Goodbye!" "Success"
} 