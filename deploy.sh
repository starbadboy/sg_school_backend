#!/bin/bash

echo "🚀 Preparing Singapore School Finder for deployment..."

# Build frontend
echo "📦 Building frontend..."
cd sg-school-frontend
npm install
npm run build

# Copy built files to backend
echo "📋 Copying files to backend..."
cp -r dist/* ../sg_school_backend/src/static/

cd ..

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push changes to GitHub"
echo "2. Connect your repository to:"
echo "   - Railway: https://railway.app"
echo "   - Render: https://render.com" 
echo "   - PythonAnywhere: https://pythonanywhere.com"
echo ""
echo "🌟 Your app will be live in minutes!" 