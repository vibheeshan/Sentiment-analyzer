#!/bin/bash
# Setup script for Sentiment Monitor

echo "🚀 Setting up Sentiment Monitor..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "✅ Activating virtual environment..."
if [ "$OS" == "Windows_NT" ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Download NLTK data
echo "🔤 Downloading NLTK data..."
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Initialize database
echo "🗄️ Initializing database..."
python backend/database.py

echo ""
echo "✨ Setup complete!"
echo ""
echo "🎯 To start the app, run:"
echo "   streamlit run app/main.py"
echo ""
