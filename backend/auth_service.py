import streamlit as st
from backend.database import DatabaseManager
from datetime import datetime, timedelta
import json

class AuthenticationManager:
    def __init__(self):
        self.db = DatabaseManager()
    
    def signup(self, username: str, email: str, password: str, confirm_password: str) -> dict:
        """Register a new user"""
        
        # Validation
        if not username or len(username) < 3:
            return {"success": False, "error": "Username must be at least 3 characters"}
        
        if not email or '@' not in email:
            return {"success": False, "error": "Invalid email address"}
        
        if not password or len(password) < 6:
            return {"success": False, "error": "Password must be at least 6 characters"}
        
        if password != confirm_password:
            return {"success": False, "error": "Passwords do not match"}
        
        # Create user
        result = self.db.create_user(username, email, password)
        return result
    
    def login(self, username: str, password: str) -> dict:
        """Authenticate user"""
        
        if not username or not password:
            return {"success": False, "error": "Username and password required"}
        
        # Verify password
        if self.db.verify_password(username, password):
            user = self.db.get_user(username)
            return {
                "success": True,
                "user_id": user['id'],
                "username": user['username'],
                "email": user['email']
            }
        else:
            return {"success": False, "error": "Invalid username or password"}
    
    def get_user_info(self, user_id: int) -> dict:
        """Get user information"""
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, email, created_at FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'created_at': user['created_at']
                }
            return None
        except:
            return None


def check_authentication():
    """Check if user is authenticated"""
    if 'user_id' not in st.session_state or not st.session_state.user_id:
        return False
    return True

def require_authentication():
    """Redirect to login if not authenticated"""
    if not check_authentication():
        st.warning("Please sign in to access this feature")
        st.stop()

def set_session_user(user_id: int, username: str, email: str):
    """Set user session"""
    st.session_state.user_id = user_id
    st.session_state.username = username
    st.session_state.email = email
    st.session_state.authenticated = True

def clear_session():
    """Clear user session"""
    st.session_state.user_id = None
    st.session_state.username = None
    st.session_state.email = None
    st.session_state.authenticated = False
