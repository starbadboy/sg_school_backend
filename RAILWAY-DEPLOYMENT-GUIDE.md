# 🚂 Railway Deployment Guide - Singapore School Finder

## 🎯 **Quick Railway Deployment**

Your project is **Railway-ready** with the `nixpacks.toml` configuration! Follow these steps:

### 1. **Run the Railway Deployment Script**
```bash
chmod +x deploy-railway.sh
./deploy-railway.sh
```

### 2. **Push to GitHub**
```bash
git add .
git commit -m "feat: ready for Railway deployment"
git push origin main
```

### 3. **Configure Railway Environment Variables**

In your Railway project dashboard:
1. Go to **Variables** tab
2. Add these environment variables:

```env
FLASK_ENV=production
SECRET_KEY=sg-school-finder-secure-key-2024
PORT=8080
```

### 4. **Deploy & Monitor**
- Railway will **automatically redeploy** when it detects the GitHub push
- Monitor the build process in Railway's **Deployments** tab
- Your app will be live at: `https://your-project-name.railway.app`

---

## 🔧 **Railway Configuration Explained**

### **nixpacks.toml** (Tells Railway how to build):
```toml
[phases.setup]
nixPkgs = ['nodejs', 'python310']  # Install Node.js + Python

[phases.install]
cmds = [
    'cd sg-school-frontend && npm ci',           # Install frontend deps
    'cd sg_school_backend && pip install -r requirements.txt'  # Install backend deps
]

[phases.build]
cmds = [
    'cd sg-school-frontend && npm run build'    # Build React app (outputs directly to Flask static)
]

[start]
cmd = 'cd sg_school_backend && python src/main.py'  # Start Flask server
```

### **Vite Configuration** (vite.config.js):
- ✅ Builds **directly to Flask static folder** (`../sg_school_backend/src/static`)
- ✅ No manual file copying needed
- ✅ Optimized build process for Railway

### **Flask Production Settings** (main.py):
- ✅ Reads `PORT` from environment variables
- ✅ Switches debug mode based on `FLASK_ENV`
- ✅ Uses secure `SECRET_KEY` from environment

---

## ⚡ **Railway-Specific Tips**

### **Environment Variables Best Practices:**
- `FLASK_ENV=production` → Disables debug mode, improves performance
- `SECRET_KEY` → Use a strong, unique key for sessions
- `PORT=8080` → Railway's default port (auto-assigned)

### **Build Process Optimization:**
- **Vite builds directly** to Flask static folder
- **No intermediate file copying** required
- **Faster builds** with streamlined process

### **Monitoring Your Deployment:**
1. **Build Logs**: Check if frontend/backend build successfully
2. **Runtime Logs**: Monitor Flask application startup
3. **Metrics**: Track CPU/memory usage in Railway dashboard

### **Auto-Deployment:**
- Every `git push` to main branch triggers automatic deployment
- Railway detects changes and rebuilds using nixpacks.toml
- Zero downtime deployments

---

## 🚨 **Troubleshooting Railway Issues**

### **Build Fails with "Nixpacks Error":**
- Ensure `nixpacks.toml` is in repository root
- Check that both frontend and backend directories exist
- Verify package.json and requirements.txt are present

### **App Starts but Frontend Not Loading:**
- Check that frontend build completed successfully
- Verify Vite build outputs to `sg_school_backend/src/static/`
- Ensure Flask serves static files correctly

### **Database Errors:**
- SQLite database is included in repository
- Check `sg_school_backend/src/database/app.db` exists
- Ensure database path is correct in Flask config

### **Port Binding Issues:**
- Railway assigns PORT automatically
- Don't hardcode port 5002 in production
- Use `PORT` environment variable (already configured)

---

## ✅ **Deployment Checklist**

Before deploying to Railway:
- [ ] Run `./deploy-railway.sh` successfully
- [ ] Frontend builds without errors (check for index.html in static folder)
- [ ] Backend dependencies install correctly
- [ ] nixpacks.toml is in repository root
- [ ] Environment variables configured in Railway
- [ ] Code pushed to GitHub main branch

### **Expected Timeline:**
- **Build Time**: 2-3 minutes
- **Deploy Time**: 30 seconds
- **Total**: 3-4 minutes from push to live

---

## 🎉 **Post-Deployment**

Once deployed successfully:
1. **Test your live app** at the Railway URL
2. **Verify all features work** (school search, P1 flow, etc.)
3. **Share your live Singapore School Finder** with users!

**🌟 Your Railway deployment is production-ready!** 