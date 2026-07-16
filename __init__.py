# Initialize database on app startup
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database import DatabaseManager

# Create database
db = DatabaseManager()
print("✅ Database initialized successfully!")
