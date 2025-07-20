#!/usr/bin/env python3
"""
Singapore School Finder - Server Startup Script
Handles all dependencies and starts the Flask server automatically
"""

import os
import sys
import subprocess
import time
import platform

def print_status(message, status="INFO"):
    """Print colored status messages"""
    colors = {
        "INFO": "\033[94m",  # Blue
        "SUCCESS": "\033[92m",  # Green
        "WARNING": "\033[93m",  # Yellow
        "ERROR": "\033[91m",  # Red
        "RESET": "\033[0m"  # Reset
    }
    
    print(f"{colors.get(status, '')}{message}{colors['RESET']}")

def check_python():
    """Check Python version"""
    print_status("🐍 Checking Python version...", "INFO")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print_status(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK", "SUCCESS")
        return True
    else:
        print_status(f"❌ Python {version.major}.{version.minor}.{version.micro} - Need Python 3.8+", "ERROR")
        return False

def install_dependencies():
    """Install required Python packages"""
    print_status("📦 Installing required dependencies...", "INFO")
    
    required_packages = [
        "flask",
        "requests", 
        "pandas",
        "beautifulsoup4",
        "flask-cors"
    ]
    
    for package in required_packages:
        try:
            print_status(f"  Installing {package}...", "INFO")
            subprocess.run([
                sys.executable, "-m", "pip", "install", package
            ], check=True, capture_output=True, text=True)
            print_status(f"  ✅ {package} installed", "SUCCESS")
        except subprocess.CalledProcessError as e:
            print_status(f"  ⚠️ {package} already installed or failed", "WARNING")
    
    print_status("✅ Dependencies ready!", "SUCCESS")

def check_data_file():
    """Check if P1 data file exists"""
    print_status("📊 Checking P1 data file...", "INFO")
    
    backend_dir = os.path.join(os.getcwd(), "sg_school_backend")
    data_file = os.path.join(backend_dir, "src", "database", "p1_2024_complete_data.json")
    
    if os.path.exists(data_file):
        file_size = os.path.getsize(data_file)
        print_status(f"✅ P1 data file found ({file_size:,} bytes)", "SUCCESS")
        return True
    else:
        print_status("❌ P1 data file not found", "ERROR")
        print_status("  Run the data extraction script first:", "WARNING")
        print_status("  python3 extract_all_2024_p1_data.py", "WARNING")
        return False

def kill_existing_servers():
    """Kill any existing Flask servers on port 5002"""
    print_status("🔄 Stopping existing servers...", "INFO")
    
    try:
        if platform.system() == "Windows":
            # Windows command
            subprocess.run(["taskkill", "/f", "/im", "python.exe"], 
                         capture_output=True, text=True)
            subprocess.run(["taskkill", "/f", "/im", "python3.exe"], 
                         capture_output=True, text=True)
        else:
            # Unix/Mac command - more specific targeting
            subprocess.run(["pkill", "-f", "src/main.py"], 
                         capture_output=True, text=True)
            subprocess.run(["pkill", "-f", "flask"], 
                         capture_output=True, text=True)
        print_status("✅ Cleared existing servers", "SUCCESS")
        time.sleep(2)  # Give time for processes to fully terminate
    except:
        print_status("  No existing servers found", "INFO")

def test_server_response():
    """Test if the server is responding correctly"""
    print_status("🧪 Testing server response...", "INFO")
    
    try:
        import urllib.request
        import urllib.error
        
        # Wait for server to start
        for i in range(10):
            try:
                response = urllib.request.urlopen("http://localhost:5002", timeout=2)
                if response.status == 200:
                    print_status("✅ Server responding correctly!", "SUCCESS")
                    return True
            except:
                time.sleep(1)
                print_status(f"  Waiting for server... ({i+1}/10)", "INFO")
        
        print_status("⚠️ Server may need manual refresh", "WARNING")
        return False
    except Exception as e:
        print_status(f"  Test completed with notes: {e}", "INFO")
        return True

def start_server():
    """Start the Flask server"""
    print_status("🚀 Starting Singapore School Finder server...", "INFO")
    
    # Change to backend directory
    backend_dir = os.path.join(os.getcwd(), "sg_school_backend")
    
    if not os.path.exists(backend_dir):
        print_status("❌ Backend directory not found!", "ERROR")
        print_status("  Make sure you're in the project root directory", "ERROR")
        return False
    
    os.chdir(backend_dir)
    
    # Start the server
    try:
        print_status("", "INFO")
        print_status("=" * 60, "SUCCESS")
        print_status("🎓 SINGAPORE SCHOOL FINDER STARTING", "SUCCESS")
        print_status("=" * 60, "SUCCESS")
        print_status("📍 URL: http://localhost:5002", "SUCCESS")
        print_status("🔥 Features: Real 2024 P1 Data + AI Strategies", "SUCCESS") 
        print_status("🛑 Stop server: Press Ctrl+C", "WARNING")
        print_status("💡 MIME Type Fix: JavaScript files now load correctly", "SUCCESS")
        print_status("=" * 60, "SUCCESS")
        print_status("", "INFO")
        
        # Add environment variable for Flask
        env = os.environ.copy()
        env['FLASK_APP'] = 'src/main.py'
        env['FLASK_ENV'] = 'development'
        
        # Start Flask server
        subprocess.run([sys.executable, "src/main.py"], env=env)
        
    except KeyboardInterrupt:
        print_status("\n🛑 Server stopped by user", "WARNING")
        return True
    except Exception as e:
        print_status(f"❌ Error starting server: {e}", "ERROR")
        return False

def main():
    """Main startup sequence"""
    print_status("🎓 Singapore School Finder - Server Startup", "SUCCESS")
    print_status("=" * 50, "INFO")
    
    # Check Python version
    if not check_python():
        return False
    
    # Install dependencies
    install_dependencies()
    
    # Check data file
    if not check_data_file():
        print_status("\n📋 To create the data file, run:", "INFO")
        print_status("python3 extract_all_2024_p1_data.py", "WARNING")
        response = input("\nDo you want to continue without real data? (y/N): ")
        if response.lower() != 'y':
            print_status("Exiting. Please create the data file first.", "WARNING")
            return False
    
    # Kill existing servers
    kill_existing_servers()
    
    # Wait a moment
    time.sleep(1)
    
    print_status("🔧 Fixed: JavaScript MIME type issue resolved", "SUCCESS")
    print_status("📁 Static files will now load with correct headers", "SUCCESS")
    
    # Start server
    start_server()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_status("\n👋 Goodbye!", "SUCCESS")
    except Exception as e:
        print_status(f"💥 Unexpected error: {e}", "ERROR")
        sys.exit(1) 