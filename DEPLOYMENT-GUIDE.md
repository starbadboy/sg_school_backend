# 🚀 Singapore School Finder - Deployment Guide

## ❌ **Fixing Railway Deployment Issues**

The "Nixpacks build failed" error occurs when Railway can't auto-detect your project structure. **I've fixed this by adding:**

### ✅ **Added Configuration Files:**
- `nixpacks.toml` - Tells Railway how to build your mixed frontend-backend project
- `Dockerfile` - Alternative containerized deployment method  
- `environment-template.txt` - Required environment variables

## 🔧 **Quick Fix for Railway**

### 1. **Push the new configuration:**
```bash
git add .
git commit -m "fix: add Railway nixpacks configuration"
git push origin main
```

### 2. **Set Environment Variables in Railway:**
Go to your Railway project → Variables tab → Add these:
```
FLASK_ENV=production
SECRET_KEY=your-secret-key-here-123456789
PORT=8080
```

### 3. **Redeploy:**
Railway will automatically redeploy with the new `nixpacks.toml` configuration.

---

## 🌟 **Alternative Hosting Options (If Railway Still Fails)**

### 🎨 **Option 1: Render (Recommended Backup)**

**Why Render is great:**
- ✅ Zero-config deployment
- ✅ Free SSL certificates  
- ✅ 750 hours/month free tier
- ✅ Docker support

**Steps:**
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Choose "Web Service"
4. Use these settings:
   ```
   Build Command: ./deploy.sh
   Start Command: cd sg_school_backend && python src/main.py
   Environment: Python 3
   ```
5. Add environment variables from `environment-template.txt`

### 🐍 **Option 2: PythonAnywhere**

**Steps:**
1. Sign up at [pythonanywhere.com](https://pythonanywhere.com)
2. Upload your project files
3. Set up a Web App with Manual Configuration
4. Point to `sg_school_backend/src/main.py`

### 🐳 **Option 3: Docker-based Hosting**

**For platforms like Fly.io, DigitalOcean App Platform:**
1. Use the included `Dockerfile`
2. Deploy directly with: `docker build -t school-finder .`

---

## 🔍 **Troubleshooting Common Issues**

### **Issue: "Static files not found"**
```bash
# Run this before deploying:
cd sg-school-frontend && npm run build
cp -r dist/* ../sg_school_backend/src/static/
```

### **Issue: "Database not found"** 
- SQLite database is included in the repository
- Check that `sg_school_backend/src/database/app.db` exists

### **Issue: "Port binding failed"**
- Make sure `PORT` environment variable is set
- Railway uses port 8080, others may use different ports

---

## ✅ **Deployment Checklist**

Before deploying:
- [ ] Frontend is built (`npm run build` completed)
- [ ] Static files copied to backend
- [ ] Environment variables configured
- [ ] Database file exists
- [ ] All dependencies in requirements.txt

**Your app should be live within 2-3 minutes after successful deployment!**

---

## 🆘 **Still Having Issues?**

If deployment still fails:
1. Check the build logs for specific error messages
2. Ensure all files are committed to GitHub
3. Try a different hosting platform from the options above
4. Verify that your local app runs: `cd sg_school_backend && python src/main.py` 