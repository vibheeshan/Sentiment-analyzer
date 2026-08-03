#!/bin/bash
# Clean and restart script for BrandPulse

echo "🧹 Cleaning up..."

# Remove Python cache
echo "  - Clearing Python bytecode cache..."
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null
find . -type f -name "*.pyo" -delete 2>/dev/null

# Remove Streamlit cache
echo "  - Clearing Streamlit cache..."
rm -rf .streamlit/cache 2>/dev/null

# Remove database if needed (comment out if you want to keep data)
# rm -f sentiment_monitor.db

# Verify modules
echo ""
echo "✅ Cleanup complete!"
echo ""
echo "To run the app:"
echo "  streamlit run app/main.py"
echo ""
echo "Then visit: http://localhost:8501"
