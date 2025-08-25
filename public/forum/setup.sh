#!/bin/bash

# Verenigd Amsterdam Forum - Firebase Admin SDK Setup Script
# This script installs the necessary dependencies and sets up the development environment

echo "🏛️ Verenigd Amsterdam Forum - Firebase Admin SDK Setup"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "✅ Node.js version: v$NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Firebase service account key exists
if [ ! -f "keys/toursamsterdam-eu-1-firebase-adminsdk-e8an4-68217c7e8f.json" ]; then
    echo "⚠️  Firebase service account key not found!"
    echo "   Please make sure the file 'keys/toursamsterdam-eu-1-firebase-adminsdk-e8an4-68217c7e8f.json' exists."
    echo "   You can download it from the Firebase Console > Project Settings > Service Accounts"
else
    echo "✅ Firebase service account key found"
fi

echo ""
echo "🚀 Setup complete! You can now run:"
echo "   npm run dev        # Start frontend development server (port 8080)"
echo "   npm run server     # Start backend API server (port 3001)"
echo "   npm run dev-server # Start backend with auto-reload"
echo ""
echo "📊 Server endpoints:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:3001/api/health"
echo ""
echo "🔥 Firebase Admin SDK features:"
echo "   ✓ Real-time forum discussions"
echo "   ✓ Political action management"
echo "   ✓ User authentication & profiles"
echo "   ✓ File uploads & cloud storage"
echo "   ✓ Server-side data validation"
echo ""
echo "📚 Usage:"
echo "   1. Start both servers (frontend + backend)"
echo "   2. Open http://localhost:8080 in your browser"
echo "   3. Register/login to access Firebase Admin features"
echo "   4. Create political actions, forum posts, and network initiatives"
echo ""
echo "🏛️ Solidair, Sociaal, Sterk! - Verenigd Amsterdam"
