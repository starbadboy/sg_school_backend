# 🚀 Singapore School Finder - Quick Start Guide

## 🎯 **One-Click Server Startup**

No more virtual environment or permission issues! Choose your preferred method:

### 📍 **Method 1: Python Script (Recommended)**
```bash
python3 start_server.py
```

### 📍 **Method 2: PowerShell Script (Windows/PowerShell users)**
```powershell
.\start_server.ps1
```

### 📍 **Method 3: Batch File (Windows only)**
```cmd
start_server.bat
```

---

## 🎉 **What These Scripts Do**

✅ **Auto-install dependencies** (Flask, requests, pandas, etc.)  
✅ **Check Python version** (requires Python 3.8+)  
✅ **Verify real P1 data** (39 schools with 2024 ballot results)  
✅ **Kill existing servers** to avoid conflicts  
✅ **Start Flask backend** on port 5002  
✅ **No virtual environment needed!**  

---

## 🌐 **Access Your App**

Once the script runs, open your browser:
```
http://localhost:5002
```

**Features Available:**
- 🏫 **Real 2024 P1 Data** from sgschooling.com (39 schools)
- 📍 **Location-based Search** with Singapore addresses
- 🤖 **AI Strategy Generation** powered by DeepSeek
- 📊 **School Comparison** with competitiveness analysis
- 📱 **Mobile-friendly UI** with modern design

---

## 🔧 **Troubleshooting**

### **If P1 data is missing:**
```bash
python3 extract_all_2024_p1_data.py
```

### **If Python3 not found:**
- Install Python 3.8+ from [python.org](https://python.org)
- On macOS: `brew install python3`
- On Windows: Download from Microsoft Store

### **Stop the server:**
Press `Ctrl+C` in the terminal

### **Port 5002 already in use:**
The script automatically kills existing servers

---

## 📊 **Sample Schools with Real Data**

- **Anderson Primary**: 210 vacancy, balloted (93.8% Phase 2C success)
- **Ai Tong School**: 300 vacancy, highly competitive (43.6% Phase 2C success)
- **Bedok Green Primary**: 240 vacancy, very competitive (28.0% Phase 2C success)
- **Ang Mo Kio Primary**: 150 vacancy, non-balloted (100% Phase 2C success)

---

## 🎓 **Ready to Find the Perfect School?**

1. **Run:** `python3 start_server.py`
2. **Open:** http://localhost:5002
3. **Search:** Enter your Singapore address
4. **Analyze:** Compare schools with real 2024 P1 data
5. **Strategize:** Get AI-powered admission advice

**Happy school hunting! 🏫✨** 