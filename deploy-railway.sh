#!/bin/bash

echo "🚂 Railway Deployment Script for Singapore School Finder"
echo "=================================================="

# Check if we're in the right directory
if [ ! -d "sg-school-frontend" ] || [ ! -d "sg_school_backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Step 1: Building frontend..."
cd sg-school-frontend
if [ ! -f "package.json" ]; then
    echo "❌ Error: Frontend package.json not found"
    exit 1
fi

npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Step 2: Frontend built successfully!"
echo "   (Vite builds directly to sg_school_backend/src/static/)"

echo "🔍 Step 3: Verifying backend dependencies..."
cd ../sg_school_backend
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Backend requirements.txt not found"
    exit 1
fi

echo "🔍 Step 4: Checking configuration files..."
cd ..
if [ ! -f "nixpacks.toml" ]; then
    echo "❌ Error: nixpacks.toml not found (required for Railway)"
    exit 1
fi

echo "🔍 Step 5: Verifying static files exist..."
if [ ! -f "sg_school_backend/src/static/index.html" ]; then
    echo "❌ Error: Frontend build output not found in static folder"
    exit 1
fi

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "🚂 NEXT STEPS FOR RAILWAY:"
echo "========================="
echo "1. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'feat: ready for Railway deployment'"
echo "   git push origin main"
echo ""
echo "2. Set these Environment Variables in Railway:"
echo "   📍 Go to your Railway project → Variables tab"
echo "   🔧 Add these variables:"
echo "      FLASK_ENV=production"
echo "      SECRET_KEY=sg-school-finder-$(date +%s)"
echo "      PORT=8080"
echo "      DEEPSEEK_API_KEY=your-deepseek-api-key-here"
echo ""
echo "   🤖 Get your Deepseek API key from: https://platform.deepseek.com"
echo "   ⚠️  REQUIRED for AI strategy generation feature!"
echo ""
echo "3. Deploy:"
echo "   🚀 Railway will auto-deploy from GitHub"
echo "   ⏱️  Wait 2-3 minutes for build completion"
echo "   🌐 Your app will be live at: your-app.railway.app"
echo ""
echo "📋 Troubleshooting:"
echo "   • If build fails, check Railway logs"
echo "   • Ensure nixpacks.toml is in repository root"
echo "   • Verify all environment variables are set"
echo "   • Test AI features work with valid Deepseek API key"
echo ""
echo "🎉 Your Singapore School Finder is ready for Railway!" 