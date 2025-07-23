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

### 3. **Add Railway PostgreSQL Database (Recommended)**

For production deployment, add a PostgreSQL database:

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically set `DATABASE_URL` environment variable

### 4. **Configure Railway Environment Variables**

In your Railway project dashboard:
1. Go to **Variables** tab
2. Add these environment variables:

```env
FLASK_ENV=production
SECRET_KEY=sg-school-finder-secure-key-2024
PORT=8080
DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

⚠️ **IMPORTANT**: Get your Deepseek API key from [platform.deepseek.com](https://platform.deepseek.com) - **required for AI strategy generation feature!**

✅ **DATABASE_URL** is automatically set when you add PostgreSQL (recommended for production)

### 5. **Deploy & Monitor**
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

### **Database Auto-Initialization** ✨ **NEW**:
- ✅ **Automatic P1 data loading** when database is empty
- ✅ **No manual migration required** - works on fresh deployments
- ✅ **Flask-SQLAlchemy context handling** - properly initializes within app context
- ✅ **Finds data files automatically** from multiple locations:
  - `extracted_p1_school_data.json` (root directory)
  - `p1_2024_complete_data.json` (database folder)
  - `p1_2024_data.json` (database folder)

### **AI Strategy Generation** 🤖:
- ✅ **Deepseek API integration** for intelligent P1 admission strategies
- ✅ **Environment-based configuration** - uses `DEEPSEEK_API_KEY`
- ✅ **Graceful fallback** - provides basic strategies if API unavailable
- ✅ **Production-ready** - secure API key handling

### **Vite Configuration** (vite.config.js):
- ✅ Builds **directly to Flask static folder** (`../sg_school_backend/src/static`)
- ✅ No manual file copying needed
- ✅ Optimized build process for Railway

### **Dockerfile** (For alternative deployments):
- ✅ **FIXED** - No longer tries to copy from non-existent `dist` folder
- ✅ Works with Vite's direct build output
- ✅ Compatible with Docker-based platforms (Fly.io, DigitalOcean, etc.)

### **Flask Production Settings** (main.py):
- ✅ Reads `PORT` from environment variables
- ✅ Switches debug mode based on `FLASK_ENV`
- ✅ Uses secure `SECRET_KEY` from environment
- ✅ **Auto-initializes database** with P1 data on startup

---

## ⚡ **Railway-Specific Tips**

### **Environment Variables Best Practices:**
- `FLASK_ENV=production` → Disables debug mode, improves performance
- `SECRET_KEY` → Use a strong, unique key for sessions
- `PORT=8080` → Railway's default port (auto-assigned)
- `DEEPSEEK_API_KEY` → **REQUIRED** for AI strategy generation (get from [platform.deepseek.com](https://platform.deepseek.com))

### **AI Features Configuration:**
- **Strategy generation** requires valid Deepseek API key
- **Fallback system** provides basic strategies if API fails
- **Rate limiting** handled automatically by Deepseek service
- **Error handling** ensures app continues working without AI features

### **Database Auto-Population:**
- **Smart detection** - only populates if database is empty
- **Multiple data sources** - tries different P1 data files
- **Production-ready** - happens automatically on every fresh deployment
- **No manual steps** - works out of the box
- **Context-aware** - properly handles Flask-SQLAlchemy initialization

### **Build Process Optimization:**
- **Vite builds directly** to Flask static folder
- **No intermediate file copying** required
- **Faster builds** with streamlined process

### **Monitoring Your Deployment:**
1. **Build Logs**: Check if frontend/backend build successfully
2. **Runtime Logs**: Monitor Flask application startup and database initialization
3. **Database Status**: Look for these success messages:
   ```
   🔍 Checking database initialization...
   ✓ Found P1 data: extracted_p1_school_data.json (180 schools)
   📊 Populating database with 180 schools...
   ✅ Database initialization complete!
   📊 Added 180 schools | Total schools: 180 | Balloted: 85
   ```
4. **Metrics**: Track CPU/memory usage in Railway dashboard
5. **AI Status**: Verify Deepseek API key is configured correctly

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

### **Docker Build Fails with "No such file or directory":**
- ✅ **FIXED** - Dockerfile updated to work with Vite direct build
- No more `dist` folder copying errors
- Build process matches Railway nixpacks configuration

### **Database Initialization Errors:** ✅ **FIXED**
- ✅ **Flask-SQLAlchemy context error resolved** - imports moved inside function
- ✅ **Auto-initialization added** - database populates automatically
- Check Railway logs for database initialization messages
- Verify P1 data files are included in repository
- Look for "🔍 Checking database initialization..." in startup logs

### **SQLAlchemy Context Errors:** ✅ **FIXED**
- **Previous error**: "The current Flask app is not registered with this 'SQLAlchemy' instance"
- **Solution**: Database imports now happen within Flask app context
- **Prevention**: Proper Flask-SQLAlchemy initialization sequence

### **AI Strategy Generation Not Working:**
- ❗ **Check Deepseek API key** is set correctly in Railway Variables
- Verify API key is valid at [platform.deepseek.com](https://platform.deepseek.com)
- Check Railway logs for API-related errors
- App will still work with basic fallback strategies if API fails

### **App Starts but Frontend Not Loading:**
- Check that frontend build completed successfully
- Verify Vite build outputs to `sg_school_backend/src/static/`
- Ensure Flask serves static files correctly

### **Database Errors:**

**❌ "sqlite3.OperationalError: unable to open database file":**
- ✅ **FIXED** - Database path now uses Railway-compatible configuration
- **Solution**: The app automatically detects Railway environment and uses appropriate database
- **Fallback**: If directory creation fails, uses system temp directory  
- **Recommended**: Add PostgreSQL service in Railway for production (see step 3 above)

**General Database Issues:**
- SQLite database is created automatically with fallback paths
- P1 data is loaded automatically from JSON files
- PostgreSQL is recommended for production (persistent storage)
- Check Railway logs for database initialization messages

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
- [ ] Environment variables configured in Railway (**including DEEPSEEK_API_KEY**)
- [ ] P1 data files are in repository (auto-detected)
- [ ] Code pushed to GitHub main branch

### **Required Environment Variables:**
```
✅ FLASK_ENV=production
✅ SECRET_KEY=your-secret-key
✅ PORT=8080
✅ DEEPSEEK_API_KEY=your-deepseek-api-key  ← REQUIRED for AI features!
```

### **Expected Timeline:**
- **Build Time**: 2-3 minutes
- **Deploy Time**: 30 seconds
- **Database Initialization**: 10-30 seconds (automatic)
- **Total**: 3-4 minutes from push to live

---

## 🎉 **Post-Deployment**

Once deployed successfully:
1. **Test your live app** at the Railway URL
2. **Verify all features work** (school search, P1 flow, etc.)
3. **Check database population**: School search should return results
4. **Test AI strategy generation**: Verify Deepseek API integration works
5. **Share your live Singapore School Finder** with users!

### **Expected Database Status:**
- **180+ schools** with P1 data automatically loaded
- **Balloting information** for competitive schools
- **Success rates** and competitiveness analysis
- **All features working** without manual setup

### **Expected AI Features:**
- **Smart admission strategies** generated via Deepseek API
- **Personalized recommendations** based on school preferences
- **Fallback strategies** if API temporarily unavailable
- **Complete P1 registration guidance**

**🌟 Your Railway deployment is production-ready with automatic database initialization and AI strategy generation!** 