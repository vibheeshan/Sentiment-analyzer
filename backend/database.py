import sqlite3
import os
from datetime import datetime
import hashlib
import json

class DatabaseManager:
    def __init__(self, db_path="sentiment_monitor.db"):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialize database with required tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Analyses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                data_source TEXT,
                ai_mode TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        # Analysis entries table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analysis_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id INTEGER NOT NULL,
                text TEXT NOT NULL,
                sentiment TEXT,
                confidence REAL,
                emotion TEXT,
                emotion_scores TEXT,
                complaint_keywords TEXT,
                date TEXT,
                source TEXT,
                rating REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (analysis_id) REFERENCES analyses(id)
            )
        ''')
        
        # Analysis summary table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analysis_summary (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id INTEGER NOT NULL,
                total_entries INTEGER,
                positive_count INTEGER,
                negative_count INTEGER,
                neutral_count INTEGER,
                avg_confidence REAL,
                avg_emotion_score REAL,
                key_insights TEXT,
                top_keywords TEXT,
                sentiment_trend TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (analysis_id) REFERENCES analyses(id)
            )
        ''')
        
        # User preferences table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                analysis_mode TEXT DEFAULT 'Fast',
                chart_type TEXT DEFAULT 'Donut',
                show_confidence INTEGER DEFAULT 1,
                enable_emojis INTEGER DEFAULT 1,
                notify_sentiment_drop INTEGER DEFAULT 1,
                weekly_summary INTEGER DEFAULT 0,
                keyword_alerts INTEGER DEFAULT 0,
                auto_delete_days INTEGER DEFAULT 365,
                theme TEXT DEFAULT 'Light',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        # User dashboards table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_dashboards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                dashboard_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                config_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')

        # Alerts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                alert_type TEXT,
                severity TEXT DEFAULT 'info',
                message TEXT,
                analysis_id INTEGER,
                triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'unread',
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')

        # Aspect sentiments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS aspect_sentiments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entry_id INTEGER,
                analysis_id INTEGER,
                aspect TEXT,
                sentiment TEXT,
                confidence REAL,
                snippet TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Competitor snapshots table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS competitor_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                brand_name TEXT,
                snapshot_date TEXT,
                positive_pct REAL,
                negative_pct REAL,
                neutral_pct REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Safe schema migrations for existing DBs
        try:
            cursor.execute('ALTER TABLE analysis_entries ADD COLUMN language TEXT DEFAULT "en"')
        except Exception:
            pass  # Column already exists

        conn.commit()
        conn.close()

    def hash_password(self, password):
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_user(self, username, email, password):
        """Create a new user"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            password_hash = self.hash_password(password)
            
            cursor.execute('''
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
            ''', (username, email, password_hash))
            
            conn.commit()
            user_id = cursor.lastrowid
            conn.close()
            return {"success": True, "user_id": user_id}
        except sqlite3.IntegrityError as e:
            return {"success": False, "error": str(e)}
    
    def get_user(self, username):
        """Get user by username"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        conn.close()
        return user

    def get_user_by_identity(self, identity):
        """Get user by username or email"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ? OR email = ?', (identity, identity))
        user = cursor.fetchone()
        conn.close()
        return user
    
    def get_user_info(self, user_id):
        """Get user info by user_id"""
        conn = self.get_connection()
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
    
    def verify_password(self, username, password):
        """Verify user password"""
        user = self.get_user(username)
        if user:
            password_hash = self.hash_password(password)
            return user['password_hash'] == password_hash
        return False
    
    def save_analysis(self, user_id, name, description, data_source, ai_mode):
        """Save a new analysis"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO analyses (user_id, name, description, data_source, ai_mode)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, name, description, data_source, ai_mode))
        
        conn.commit()
        analysis_id = cursor.lastrowid
        conn.close()
        return analysis_id
    
    def save_analysis_entry(self, analysis_id, entry_data):
        """Save individual analysis entry"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO analysis_entries 
            (analysis_id, text, sentiment, confidence, emotion, emotion_scores, 
             complaint_keywords, date, source, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            analysis_id,
            entry_data.get('text'),
            entry_data.get('sentiment'),
            entry_data.get('confidence'),
            entry_data.get('emotion'),
            json.dumps(entry_data.get('emotion_scores', {})),
            json.dumps(entry_data.get('complaint_keywords', [])),
            entry_data.get('date'),
            entry_data.get('source'),
            entry_data.get('rating')
        ))
        
        conn.commit()
        conn.close()
    
    def get_user_analyses(self, user_id):
        """Get all analyses for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM analyses WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (user_id,))
        
        analyses = cursor.fetchall()
        conn.close()
        return analyses
    
    def get_analysis_entries(self, analysis_id):
        """Get all entries for an analysis"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM analysis_entries WHERE analysis_id = ?
            ORDER BY created_at DESC
        ''', (analysis_id,))
        
        entries = cursor.fetchall()
        conn.close()
        return entries
    
    def save_analysis_summary(self, analysis_id, summary_data):
        """Save analysis summary/statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO analysis_summary 
            (analysis_id, total_entries, positive_count, negative_count, neutral_count,
             avg_confidence, avg_emotion_score, key_insights, top_keywords, sentiment_trend)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            analysis_id,
            summary_data.get('total_entries'),
            summary_data.get('positive_count'),
            summary_data.get('negative_count'),
            summary_data.get('neutral_count'),
            summary_data.get('avg_confidence'),
            summary_data.get('avg_emotion_score'),
            json.dumps(summary_data.get('key_insights', [])),
            json.dumps(summary_data.get('top_keywords', [])),
            json.dumps(summary_data.get('sentiment_trend', []))
        ))
        
        conn.commit()
        conn.close()
    
    def get_analysis_summary(self, analysis_id):
        """Get summary for an analysis"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM analysis_summary WHERE analysis_id = ?
        ''', (analysis_id,))
        
        summary = cursor.fetchone()
        conn.close()
        return summary
    
    def delete_analysis(self, analysis_id):
        """Delete an analysis and its entries"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Delete entries
        cursor.execute('DELETE FROM analysis_entries WHERE analysis_id = ?', (analysis_id,))
        
        # Delete summary
        cursor.execute('DELETE FROM analysis_summary WHERE analysis_id = ?', (analysis_id,))
        
        # Delete analysis
        cursor.execute('DELETE FROM analyses WHERE id = ?', (analysis_id,))
        
        conn.commit()
        conn.close()    
    def get_user_preferences(self, user_id):
        """Get user preferences"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM user_preferences WHERE user_id = ?', (user_id,))
        prefs = cursor.fetchone()
        conn.close()
        
        if prefs:
            return {
                'analysis_mode': prefs['analysis_mode'],
                'chart_type': prefs['chart_type'],
                'show_confidence': bool(prefs['show_confidence']),
                'enable_emojis': bool(prefs['enable_emojis']),
                'notify_sentiment_drop': bool(prefs['notify_sentiment_drop']),
                'weekly_summary': bool(prefs['weekly_summary']),
                'keyword_alerts': bool(prefs['keyword_alerts']),
                'auto_delete_days': prefs['auto_delete_days'],
                'theme': prefs['theme']
            }
        return None
    
    def save_user_preferences(self, user_id, preferences):
        """Save or update user preferences"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Check if preferences exist
        cursor.execute('SELECT id FROM user_preferences WHERE user_id = ?', (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            # Update
            cursor.execute('''
                UPDATE user_preferences 
                SET analysis_mode=?, chart_type=?, show_confidence=?, enable_emojis=?,
                    notify_sentiment_drop=?, weekly_summary=?, keyword_alerts=?,
                    auto_delete_days=?, theme=?, updated_at=CURRENT_TIMESTAMP
                WHERE user_id=?
            ''', (
                preferences.get('analysis_mode', 'Fast'),
                preferences.get('chart_type', 'Donut'),
                int(preferences.get('show_confidence', True)),
                int(preferences.get('enable_emojis', True)),
                int(preferences.get('notify_sentiment_drop', True)),
                int(preferences.get('weekly_summary', False)),
                int(preferences.get('keyword_alerts', False)),
                preferences.get('auto_delete_days', 365),
                preferences.get('theme', 'Light'),
                user_id
            ))
        else:
            # Insert
            cursor.execute('''
                INSERT INTO user_preferences 
                (user_id, analysis_mode, chart_type, show_confidence, enable_emojis,
                 notify_sentiment_drop, weekly_summary, keyword_alerts, auto_delete_days, theme)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                preferences.get('analysis_mode', 'Fast'),
                preferences.get('chart_type', 'Donut'),
                int(preferences.get('show_confidence', True)),
                int(preferences.get('enable_emojis', True)),
                int(preferences.get('notify_sentiment_drop', True)),
                int(preferences.get('weekly_summary', False)),
                int(preferences.get('keyword_alerts', False)),
                preferences.get('auto_delete_days', 365),
                preferences.get('theme', 'Light')
            ))
        
        conn.commit()
        conn.close()
        return True

    def save_user_dashboard(self, user_id, dashboard_id, name, config_dict):
        """Save or update user custom dashboard configuration"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        config_json = json.dumps(config_dict)
        
        # Check if exists
        cursor.execute('SELECT id FROM user_dashboards WHERE user_id = ? AND dashboard_id = ?', (user_id, dashboard_id))
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute('''
                UPDATE user_dashboards
                SET name = ?, config_json = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND dashboard_id = ?
            ''', (name, config_json, user_id, dashboard_id))
        else:
            cursor.execute('''
                INSERT INTO user_dashboards (user_id, dashboard_id, name, config_json)
                VALUES (?, ?, ?, ?)
            ''', (user_id, dashboard_id, name, config_json))
            
        conn.commit()
        conn.close()
        return True

    def get_user_dashboards(self, user_id):
        """Get all custom dashboards for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM user_dashboards WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        dashboards = []
        for row in rows:
            try:
                config_dict = json.loads(row['config_json'])
            except:
                config_dict = {}
            dashboards.append({
                'dashboard_id': row['dashboard_id'],
                'name': row['name'],
                'config': config_dict,
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            })
        return dashboards

    def delete_user_dashboard(self, user_id, dashboard_id):
        """Delete a user's custom dashboard"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM user_dashboards WHERE user_id = ? AND dashboard_id = ?', (user_id, dashboard_id))
        conn.commit()
        conn.close()
        return True

    # ── Alert methods ──────────────────────────────────────────────

    def create_alert(self, user_id, alert_type, severity, message, analysis_id=None):
        """Create a new alert record"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO alerts (user_id, alert_type, severity, message, analysis_id)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, alert_type, severity, message, analysis_id))
        conn.commit()
        alert_id = cursor.lastrowid
        conn.close()
        return alert_id

    def get_user_alerts(self, user_id, limit=50, unread_only=False):
        """Get alerts for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if unread_only:
            cursor.execute(
                'SELECT * FROM alerts WHERE user_id = ? AND status = "unread" ORDER BY triggered_at DESC LIMIT ?',
                (user_id, limit)
            )
        else:
            cursor.execute(
                'SELECT * FROM alerts WHERE user_id = ? ORDER BY triggered_at DESC LIMIT ?',
                (user_id, limit)
            )
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def mark_alert_read(self, alert_id):
        """Mark an alert as read"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE alerts SET status = "read" WHERE id = ?', (alert_id,))
        conn.commit()
        conn.close()

    def mark_all_alerts_read(self, user_id):
        """Mark all alerts for a user as read"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE alerts SET status = "read" WHERE user_id = ?', (user_id,))
        conn.commit()
        conn.close()

    def count_unread_alerts(self, user_id):
        """Count unread alerts for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM alerts WHERE user_id = ? AND status = "unread"', (user_id,))
        count = cursor.fetchone()[0]
        conn.close()
        return count

    # ── Aspect sentiment methods ───────────────────────────────────

    def save_aspect_sentiments(self, analysis_id, aspect_data: list):
        """Bulk-save aspect sentiment rows for an analysis"""
        conn = self.get_connection()
        cursor = conn.cursor()
        for row in aspect_data:
            cursor.execute('''
                INSERT INTO aspect_sentiments (entry_id, analysis_id, aspect, sentiment, confidence, snippet)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                row.get('entry_id'),
                analysis_id,
                row.get('aspect'),
                row.get('sentiment'),
                row.get('confidence'),
                row.get('snippet', '')
            ))
        conn.commit()
        conn.close()

    def get_aspect_sentiments(self, analysis_id):
        """Get aggregated aspect sentiment data for an analysis"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT * FROM aspect_sentiments WHERE analysis_id = ? ORDER BY aspect',
            (analysis_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]
