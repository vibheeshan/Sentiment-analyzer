import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime
import sys
import os
import plotly.express as px
import plotly.graph_objects as go
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import CountVectorizer
import warnings
warnings.filterwarnings('ignore')

# Add project root directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.auth_service import AuthenticationManager, set_session_user, clear_session, check_authentication
from backend.database import DatabaseManager
from backend.sentiment_service import get_sentiment_analyzer
from backend.insights_generator import generate_insights
from backend.export_service import ExportService
from backend.advanced_features import (
    EmotionDetector, ComplaintAnalyzer, SentimentChangeDetector, 
    FakeReviewDetector, BrandComparator
)
from backend.features_integration import get_brandpulse_features
from app.advanced_features_pages import (
    show_realtime_monitoring_page,
    show_multisource_page,
    show_visual_analysis_page,
    show_topic_discovery_page,
    show_custom_dashboard_page,
    show_review_aggregation_page,
    add_advanced_features_to_sidebar
)

# Page config
st.set_page_config(
    page_title="BrandPulse - AI Sentiment Monitor",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ===== CUSTOM STYLING =====
st.markdown("""
    <style>
        /* Design System Colors */
        :root {
            --primary: #0ea5e9;
            --success: #22c55e;
            --danger: #ef4444;
            --warning: #f59e0b;
            --neutral: #6b7280;
            --light-bg: #f8fafc;
            --surface: #ffffff;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
        }
        
        /* Main Styles */
        .main-header {
            color: var(--primary);
            font-size: 36px;
            font-weight: 700;
            margin: 30px 0;
            letter-spacing: -0.5px;
        }
        
        .page-header {
            color: var(--text-primary);
            font-size: 28px;
            font-weight: 700;
            margin: 20px 0 10px 0;
        }
        
        .metric-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid var(--primary);
            margin: 10px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: var(--text-primary);
        }
        
        .stat-label {
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 5px;
        }
        
        .badge-positive {
            background-color: #dcfce7;
            color: #166534;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
        }
        
        .badge-negative {
            background-color: #fee2e2;
            color: #991b1b;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
        }
        
        .badge-neutral {
            background-color: #f3f4f6;
            color: #374151;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
        }
        
        .insight-panel {
            background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
            border-left: 4px solid var(--primary);
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .alert-warning {
            background-color: #fef3c7;
            border-left: 4px solid var(--warning);
            padding: 16px;
            border-radius: 6px;
            margin: 10px 0;
        }
        
        .alert-success {
            background-color: #dcfce7;
            border-left: 4px solid var(--success);
            padding: 16px;
            border-radius: 6px;
            margin: 10px 0;
        }
        
        .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 20px 0;
        }
        
        .data-table {
            border-radius: 8px;
            overflow: hidden;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            border: 2px dashed #cbd5e1;
        }
        
        .empty-state-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        
        .empty-state-text {
            color: var(--text-secondary);
            font-size: 16px;
            margin-bottom: 20px;
        }
        
        h1, h2, h3 {
            color: var(--text-primary);
            font-weight: 700;
        }
        
        .stButton > button {
            border-radius: 8px;
            font-weight: 600;
            padding: 10px 20px;
            transition: all 0.3s ease;
        }
    </style>
""", unsafe_allow_html=True)

# ===== SESSION STATE =====
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'user_id' not in st.session_state:
    st.session_state.user_id = None
if 'username' not in st.session_state:
    st.session_state.username = None
if 'current_page' not in st.session_state:
    st.session_state.current_page = 'dashboard'
if 'current_analysis' not in st.session_state:
    st.session_state.current_analysis = None

# ===== UTILITY FUNCTIONS =====
def row_to_dict(row):
    """Convert sqlite3.Row to dictionary"""
    if row is None:
        return None
    if isinstance(row, dict):
        return row
    if hasattr(row, 'keys'):
        return dict(zip(row.keys(), row))
    return row

def navigate(page):
    """Navigate to a different page"""
    st.session_state.current_page = page
    st.rerun()

# ===== COMPONENT FUNCTIONS =====
def display_metric_card(label, value, icon="📊", change=None, color="blue"):
    """Display a metric card"""
    color_map = {
        'blue': '#0ea5e9',
        'green': '#22c55e',
        'red': '#ef4444',
        'amber': '#f59e0b'
    }
    
    col1, col2 = st.columns([1, 4])
    with col1:
        st.markdown(f"<div style='font-size: 36px;'>{icon}</div>", unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
            <div class="metric-card" style="border-left-color: {color_map.get(color, '#0ea5e9')};">
                <div class="stat-label">{label}</div>
                <div class="stat-value">{value}</div>
                {f'<div class="stat-label">{change}</div>' if change else ''}
            </div>
        """, unsafe_allow_html=True)

def display_sentiment_distribution(sentiment_counts, title="Sentiment Distribution"):
    """Display sentiment distribution pie chart"""
    fig = px.pie(
        values=list(sentiment_counts.values()),
        names=list(sentiment_counts.keys()),
        title=title,
        color_discrete_map={
            'Positive': '#22c55e',
            'Negative': '#ef4444',
            'Neutral': '#6b7280'
        }
    )
    fig.update_traces(textposition='auto', textinfo='percent+label')
    return fig

def display_emotion_breakdown(emotions):
    """Display emotion breakdown bar chart"""
    fig = px.bar(
        x=list(emotions.keys()),
        y=list(emotions.values()),
        title="Emotion Breakdown",
        labels={'x': 'Emotion', 'y': 'Count'},
        color=list(emotions.keys()),
        color_discrete_sequence=['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#95E77D']
    )
    return fig

def display_insights_panel(insights):
    """Display AI-generated insights"""
    st.markdown("""
        <div class="insight-panel">
            <h3 style="margin-top: 0; color: #0ea5e9;">💡 AI-Generated Insights</h3>
    """, unsafe_allow_html=True)
    
    for insight in insights:
        icon = "✓" if insight['type'] == 'positive' else "⚠️"
        st.markdown(f"**{icon} {insight['text']}**")
    
    st.markdown("</div>", unsafe_allow_html=True)

def extract_keywords(texts, top_n=20):
    """Extract top keywords from texts"""
    try:
        vectorizer = CountVectorizer(
            stop_words='english',
            max_features=top_n,
            ngram_range=(1, 2)
        )
        word_freq = vectorizer.fit_transform(texts)
        keywords = vectorizer.get_feature_names_out()
        frequencies = word_freq.sum(axis=0).A1
        
        return dict(sorted(zip(keywords, frequencies), key=lambda x: x[1], reverse=True))
    except:
        return {}

def display_wordcloud(texts, title="Word Cloud"):
    """Display word cloud"""
    if not texts or len(texts) == 0:
        st.info("Not enough text to generate word cloud")
        return
    
    try:
        text = ' '.join(str(t) for t in texts if t)
        
        fig, ax = plt.subplots(figsize=(12, 6), facecolor='white')
        
        wordcloud = WordCloud(
            width=800,
            height=400,
            background_color='white',
            colormap='Reds',
            max_words=100
        ).generate(text)
        
        ax.imshow(wordcloud, interpolation='bilinear')
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        ax.axis('off')
        
        st.pyplot(fig, use_container_width=True)
    except:
        st.warning("Could not generate word cloud")

# ===== LOGIN PAGE =====
def show_login_page():
    """Display login/signup page"""
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown(
            "<h1 style='text-align: center; color: #0ea5e9; font-size: 48px; margin: 40px 0;'>🎯 BrandPulse</h1>",
            unsafe_allow_html=True
        )
        st.markdown(
            "<p style='text-align: center; color: #64748b; font-size: 18px; margin-bottom: 40px;'>AI-Powered Brand Sentiment Analysis Dashboard</p>",
            unsafe_allow_html=True
        )
        
        st.divider()
        
        tab1, tab2 = st.tabs(["🔓 Sign In", "✍️ Sign Up"])
        
        with tab1:
            st.subheader("Welcome Back!")
            
            username = st.text_input("Username", placeholder="Enter your username", key="login_username")
            password = st.text_input("Password", type="password", placeholder="Enter your password", key="login_password")
            
            if st.button("Sign In", use_container_width=True, type="primary"):
                if username and password:
                    auth_manager = AuthenticationManager()
                    result = auth_manager.login(username, password)
                    if result['success']:
                        set_session_user(result['user_id'], result['username'], result['email'])
                        st.success(f"Welcome back, {result['username']}! 🎉")
                        st.rerun()
                    else:
                        st.error(result['error'])
                else:
                    st.warning("Please enter username and password")
        
        with tab2:
            st.subheader("Create Account")
            
            new_username = st.text_input("Username", placeholder="Choose a username", key="signup_username")
            new_email = st.text_input("Email", placeholder="your@email.com", key="signup_email")
            new_password = st.text_input("Password", type="password", placeholder="At least 6 characters", key="signup_password")
            confirm_password = st.text_input("Confirm Password", type="password", key="signup_confirm")
            
            if st.button("Create Account", use_container_width=True, type="primary"):
                if new_username and new_email and new_password and confirm_password:
                    auth_manager = AuthenticationManager()
                    result = auth_manager.signup(new_username, new_email, new_password, confirm_password)
                    if result['success']:
                        st.success("Account created successfully! Now sign in.")
                    else:
                        st.error(result['error'])
                else:
                    st.warning("Please fill in all fields")

# ===== NAVIGATION SIDEBAR =====
def show_sidebar():
    """Display navigation sidebar"""
    with st.sidebar:
        st.markdown(f"<h3 style='color: #0ea5e9; margin-bottom: 0;'>👤 {st.session_state.username}</h3>", unsafe_allow_html=True)
        st.markdown(f"<p style='color: #64748b; margin: 5px 0 20px 0; font-size: 12px;'>Brand Analyst</p>", unsafe_allow_html=True)
        
        st.divider()
        
        st.markdown("### 📊 Navigation")
        
        nav_items = [
            ("📈 Dashboard", "dashboard"),
            ("📝 New Analysis", "analysis"),
            ("📚 History", "history"),
            ("🔔 Alerts", "alerts"),
            ("⚙️ Settings", "settings"),
        ]
        
        for label, page in nav_items:
            if st.button(label, use_container_width=True, key=f"nav_{page}"):
                navigate(page)
        
        st.divider()
        
        st.markdown("### 🚀 Advanced Features")
        
        advanced_items = [
            ("🔴 Real-Time Monitoring", "realtime"),
            ("🌐 Multi-Source Data", "multisource"),
            ("🖼️ Visual Analysis", "visual"),
            ("🏷️ Topic Discovery", "topics"),
            ("📊 Custom Dashboards", "custom_dashboard"),
            ("⭐ Review Aggregation", "reviews"),
            ("🤼 Competitor Benchmark", "benchmark"),
            ("🎯 Aspect Sentiment", "absa"),
        ]
        
        for label, page in advanced_items:
            if st.button(label, use_container_width=True, key=f"nav_adv_{page}"):
                navigate(page)
        
        st.divider()
        
        if st.button("🔓 Sign Out", use_container_width=True):
            clear_session()
            st.rerun()
        
        st.divider()
        
        st.markdown("""
            <div style='background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);  padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;'>
                <p style='margin: 0; color: #0369a1; font-size: 12px; font-weight: 600;'>💡 FEATURES</p>
                <p style='margin: 5px 0 0 0; color: #0369a1; font-size: 12px;'>
                ✅ Real-time alerts<br>
                ✅ 50+ data sources<br>
                ✅ Visual sentiment<br>
                ✅ Topic discovery<br>
                ✅ 200+ review platforms<br>
                ✅ Custom dashboards
                </p>
            </div>
        """, unsafe_allow_html=True)

# ===== DASHBOARD PAGE =====
def show_dashboard():
    """Display main dashboard"""
    st.markdown("<h1 class='main-header'>📊 Dashboard</h1>", unsafe_allow_html=True)
    
    db = DatabaseManager()
    analyses = db.get_user_analyses(st.session_state.user_id)
    
    if not analyses:
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.markdown("""
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-text">No analyses yet. Let's get started!</div>
                </div>
            """, unsafe_allow_html=True)
            
            if st.button("➕ Create Your First Analysis", use_container_width=True, type="primary"):
                navigate('analysis')
    
    else:
        # Summary statistics
        col1, col2, col3, col4 = st.columns(4)
        
        total_entries = 0
        sentiment_dist = {'Positive': 0, 'Negative': 0, 'Neutral': 0}
        total_confidence = 0
        
        for analysis in analyses:
            entries = db.get_analysis_entries(analysis['id'])
            total_entries += len(entries)
            
            for entry in entries:
                e_dict = row_to_dict(entry)
                sentiment = e_dict.get('sentiment', 'Neutral')
                confidence = e_dict.get('confidence', 0)
                sentiment_dist[sentiment] = sentiment_dist.get(sentiment, 0) + 1
                total_confidence += confidence
        
        avg_confidence = (total_confidence / max(total_entries, 1)) if total_entries > 0 else 0
        positive_pct = (sentiment_dist['Positive'] / max(total_entries, 1) * 100) if total_entries > 0 else 0
        
        with col1:
            display_metric_card("Total Analyzed", str(total_entries), "📊", color="blue")
        with col2:
            display_metric_card("Positive Sentiment", f"{positive_pct:.1f}%", "😊", color="green")
        with col3:
            display_metric_card("Analyses", str(len(analyses)), "📈", color="blue")
        with col4:
            display_metric_card("Avg Confidence", f"{avg_confidence:.1f}%", "⭐", color="blue")
        
        st.divider()
        
        # Tabs
        tab1, tab2, tab3, tab4, tab5 = st.tabs(["📋 Overview", "🎭 Emotions", "⚠️ Issues", "🔍 Quality", "📈 Forecast"])
        
        with tab1:
            st.subheader("Recent Analyses")
            
            for analysis in analyses[:5]:
                col1, col2 = st.columns([2, 1])
                
                with col1:
                    st.markdown(f"**{analysis['name']}**")
                    st.caption(f"Created: {analysis['created_at'][:10]} | AI Mode: {analysis['ai_mode']}")
                
                with col2:
                    if st.button("👁️ View", key=f"view_{analysis['id']}", use_container_width=True):
                        st.session_state.current_analysis = analysis['id']
                        st.session_state.emotion_analysis_select = analysis['id']
                        st.session_state.issues_analysis_select = analysis['id']
                        st.session_state.quality_analysis_select = analysis['id']
                        st.rerun()
                
                # Summary
                summary = db.get_analysis_summary(analysis['id'])
                if summary:
                    # Handle None values from database
                    total = summary['total_entries'] or 0
                    positive = summary['positive_count'] or 0
                    negative = summary['negative_count'] or 0
                    neutral = summary['neutral_count'] or 0
                    confidence = summary['avg_confidence'] or 0
                    
                    col_metrics1, col_metrics2, col_metrics3, col_metrics4 = st.columns(4)
                    
                    with col_metrics1:
                        st.metric("Total", total)
                    with col_metrics2:
                        st.metric("Positive", f"{positive*100//max(total,1)}%")
                    with col_metrics3:
                        st.metric("Negative", f"{negative*100//max(total,1)}%")
                    with col_metrics4:
                        st.metric("Confidence", f"{confidence:.1f}%")
                    
                    # Chart
                    col_chart1, col_chart2 = st.columns(2)
                    
                    with col_chart1:
                        sentiment_data = {
                            'Positive': positive,
                            'Negative': negative,
                            'Neutral': neutral
                        }
                        fig = display_sentiment_distribution(sentiment_data, "Sentiment Distribution")
                        st.plotly_chart(fig, use_container_width=True, key=f"dashboard_sentiment_{analysis['id']}")
                    
                    with col_chart2:
                        st.info("💡 Click 'View' to see detailed charts and insights")
                
                st.divider()
        
        with tab2:
            st.subheader("🎭 Emotion Breakdown")
            
            # Analysis selector
            analysis_names = {a['id']: a['name'] for a in analyses}
            selected_analysis_id = st.selectbox(
                "Select analysis to inspect",
                options=list(analysis_names.keys()),
                format_func=lambda x: analysis_names[x],
                key="emotion_analysis_select"
            )
            
            if selected_analysis_id:
                entries = db.get_analysis_entries(selected_analysis_id)
                if entries:
                    texts = [row_to_dict(e).get('text', '') for e in entries]
                    
                    # Run emotion detection on all entries
                    from backend.emotion_advanced import get_advanced_emotion_detector
                    emotion_detector = get_advanced_emotion_detector()
                    
                    emotion_counts = {}
                    for text in texts:
                        res = emotion_detector.detect_emotions(text)
                        primary = res.get('primary_emotion', 'neutral').capitalize()
                        emotion_counts[primary] = emotion_counts.get(primary, 0) + 1
                    
                    if emotion_counts:
                        # Summary metrics
                        dominant_emotion = max(emotion_counts, key=emotion_counts.get)
                        col_e1, col_e2, col_e3 = st.columns(3)
                        with col_e1:
                            st.metric("Dominant Emotion", dominant_emotion)
                        with col_e2:
                            st.metric("Unique Emotions", len(emotion_counts))
                        with col_e3:
                            st.metric("Entries Analyzed", len(texts))
                        
                        st.divider()
                        
                        col_chart_e1, col_chart_e2 = st.columns(2)
                        
                        with col_chart_e1:
                            fig_emo_pie = px.pie(
                                values=list(emotion_counts.values()),
                                names=list(emotion_counts.keys()),
                                title="Emotion Distribution",
                                color_discrete_sequence=['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#95E77D', '#FF9F43', '#A55EEA', '#778CA3']
                            )
                            fig_emo_pie.update_traces(textposition='auto', textinfo='percent+label')
                            st.plotly_chart(fig_emo_pie, use_container_width=True, key="dashboard_emotion_pie")
                        
                        with col_chart_e2:
                            fig_emo_bar = px.bar(
                                x=list(emotion_counts.keys()),
                                y=list(emotion_counts.values()),
                                title="Emotion Frequency",
                                labels={'x': 'Emotion', 'y': 'Count'},
                                color=list(emotion_counts.keys()),
                                color_discrete_sequence=['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#95E77D', '#FF9F43', '#A55EEA', '#778CA3']
                            )
                            st.plotly_chart(fig_emo_bar, use_container_width=True, key="dashboard_emotion_bar")
                    else:
                        st.info("No emotions detected in this analysis.")
                else:
                    st.info("No entries found for this analysis.")
        
        with tab3:
            st.subheader("⚠️ Complaint Analysis")
            
            # Analysis selector
            selected_issues_id = st.selectbox(
                "Select analysis to inspect",
                options=list(analysis_names.keys()),
                format_func=lambda x: analysis_names[x],
                key="issues_analysis_select"
            )
            
            if selected_issues_id:
                entries = db.get_analysis_entries(selected_issues_id)
                if entries:
                    all_entries = [row_to_dict(e) for e in entries]
                    negative_texts = [e.get('text', '') for e in all_entries if e.get('sentiment') == 'Negative']
                    
                    col_i1, col_i2, col_i3 = st.columns(3)
                    with col_i1:
                        st.metric("Total Entries", len(all_entries))
                    with col_i2:
                        st.metric("Negative Reviews", len(negative_texts))
                    with col_i3:
                        neg_pct = round(len(negative_texts) / max(len(all_entries), 1) * 100, 1)
                        st.metric("Negative %", f"{neg_pct}%")
                    
                    st.divider()
                    
                    if negative_texts:
                        complaint_analyzer = ComplaintAnalyzer()
                        complaint_results = complaint_analyzer.analyze_complaints(negative_texts)
                        
                        scores = complaint_results.get('scores', {})
                        active_complaints = {k: v for k, v in scores.items() if v > 0}
                        
                        if active_complaints:
                            col_cc1, col_cc2 = st.columns(2)
                            
                            with col_cc1:
                                fig_complaints = px.bar(
                                    x=list(active_complaints.keys()),
                                    y=list(active_complaints.values()),
                                    title="Top Complaint Categories",
                                    labels={'x': 'Category', 'y': 'Mentions'},
                                    color=list(active_complaints.values()),
                                    color_continuous_scale='Reds'
                                )
                                fig_complaints.update_layout(showlegend=False)
                                st.plotly_chart(fig_complaints, use_container_width=True, key="dashboard_complaints_bar")
                            
                            with col_cc2:
                                st.markdown("#### 🔥 Top Complaints")
                                top_complaints = complaint_results.get('top_complaints', [])
                                for i, complaint in enumerate(top_complaints, 1):
                                    mention_count = active_complaints.get(complaint, 0)
                                    st.markdown(f"""
                                    <div class='metric-card' style='border-left-color: #ef4444; margin: 5px 0; padding: 12px;'>
                                        <strong>#{i} {complaint.replace('_', ' ').title()}</strong>
                                        <br><span style='color: #64748b;'>{mention_count} mention(s) in negative reviews</span>
                                    </div>
                                    """, unsafe_allow_html=True)
                                
                                if not top_complaints:
                                    st.success("No specific complaint patterns detected.")
                        else:
                            st.success("✅ No specific complaint patterns detected in negative reviews.")
                        
                        # Show sample negative reviews
                        with st.expander("📝 Sample Negative Reviews"):
                            for i, text in enumerate(negative_texts[:5], 1):
                                st.markdown(f"**{i}.** {text[:200]}{'...' if len(text) > 200 else ''}")
                    else:
                        st.success("✅ No negative reviews found in this analysis — great news!")
                else:
                    st.info("No entries found for this analysis.")
        
        with tab4:
            st.subheader("🔍 Review Quality & Authenticity")
            
            # Analysis selector
            selected_quality_id = st.selectbox(
                "Select analysis to inspect",
                options=list(analysis_names.keys()),
                format_func=lambda x: analysis_names[x],
                key="quality_analysis_select"
            )
            
            if selected_quality_id:
                entries = db.get_analysis_entries(selected_quality_id)
                if entries:
                    all_texts = [row_to_dict(e).get('text', '') for e in entries]
                    
                    fake_detector = FakeReviewDetector()
                    fake_results = fake_detector.detect_fake_reviews(all_texts)
                    
                    suspicious_count = fake_results.get('suspicious_count', 0)
                    fake_pct = fake_results.get('fake_percentage', 0)
                    total_reviews = fake_results.get('total_reviews', 0)
                    
                    col_q1, col_q2, col_q3, col_q4 = st.columns(4)
                    with col_q1:
                        st.metric("Total Reviews", total_reviews)
                    with col_q2:
                        st.metric("Authentic", total_reviews - suspicious_count)
                    with col_q3:
                        st.metric("Suspicious", suspicious_count,
                                 delta=f"{fake_pct}%" if suspicious_count > 0 else None,
                                 delta_color="inverse")
                    with col_q4:
                        quality_score = round(100 - fake_pct, 1)
                        st.metric("Quality Score", f"{quality_score}%")
                    
                    st.divider()
                    
                    if suspicious_count > 0:
                        st.warning(f"⚠️ Found **{suspicious_count}** potentially suspicious review(s) ({fake_pct}% of total)")
                        
                        # Show flagged reviews
                        suspicious_reviews = fake_results.get('suspicious_reviews', [])
                        
                        for review in suspicious_reviews[:10]:
                            flags = review.get('flags', [])
                            flag_labels = ', '.join([f.replace('_', ' ').title() for f in flags])
                            confidence = review.get('confidence', 0)
                            
                            severity_color = '#ef4444' if confidence >= 75 else '#f59e0b' if confidence >= 50 else '#6b7280'
                            
                            st.markdown(f"""
                            <div class='metric-card' style='border-left-color: {severity_color}; padding: 12px; margin: 5px 0;'>
                                <div style='display: flex; justify-content: space-between;'>
                                    <strong>Review #{review.get('index', '?') + 1}</strong>
                                    <span style='color: {severity_color}; font-weight: 600;'>Suspicion: {confidence}%</span>
                                </div>
                                <p style='margin: 8px 0 4px 0; color: #475569;'>{review.get('text', '')[:200]}{'...' if len(review.get('text', '')) > 200 else ''}</p>
                                <span style='font-size: 12px; color: #94a3b8;'>Flags: {flag_labels}</span>
                            </div>
                            """, unsafe_allow_html=True)
                    else:
                        st.success("✅ All reviews appear authentic — no suspicious patterns detected!")
                        
                        # Show quality breakdown
                        st.markdown("""
                        <div class='alert-success'>
                            <strong>Quality Checks Passed:</strong><br>
                            ✅ Length validation — all reviews meet minimum length<br>
                            ✅ Repetition check — no excessive word repetition<br>
                            ✅ Punctuation check — normal punctuation usage<br>
                            ✅ Formatting check — no suspicious ALL CAPS patterns
                        </div>
                        """, unsafe_allow_html=True)
                else:
                    st.info("No entries found for this analysis.")
        
        with tab5:
            st.subheader("📈 Sentiment Forecast")
            st.markdown("<p style='color: #64748b; font-size: 13px;'>Uses Holt's Linear Trend (Double Exponential Smoothing) to project future positive-sentiment percentages.</p>", unsafe_allow_html=True)
            
            selected_forecast_id = st.selectbox(
                "Select analysis to forecast",
                options=list(analysis_names.keys()),
                format_func=lambda x: analysis_names[x],
                key="forecast_analysis_select"
            )
            
            forecast_days = st.slider("Forecast horizon (days)", min_value=3, max_value=30, value=7, step=1)
            
            if selected_forecast_id:
                forecast_entries = db.get_analysis_entries(selected_forecast_id)
                if forecast_entries:
                    from backend.forecasting_service import forecast_sentiment
                    
                    entry_dicts = [row_to_dict(e) for e in forecast_entries]
                    result = forecast_sentiment(entry_dicts, forecast_days=forecast_days)
                    
                    # Metrics
                    trend_color = {'Rising': '#10B981', 'Falling': '#EF4444', 'Stable': '#6B7280'}[result['trend']]
                    trend_icon  = {'Rising': '📈', 'Falling': '📉', 'Stable': '➡️'}[result['trend']]
                    col_f1, col_f2, col_f3 = st.columns(3)
                    with col_f1:
                        st.metric("Trend Direction", f"{trend_icon} {result['trend']}")
                    with col_f2:
                        delta = result['trend_magnitude']
                        st.metric("Projected Change", f"{delta:+.1f} pp")
                    with col_f3:
                        st.metric("Data Points Used", result['data_points'])
                    
                    st.divider()
                    
                    # Build combined chart
                    import plotly.graph_objects as go
                    fig_fc = go.Figure()
                    
                    if result['historical_dates']:
                        fig_fc.add_trace(go.Scatter(
                            x=result['historical_dates'],
                            y=result['historical_values'],
                            mode='lines+markers',
                            name='Historical',
                            line=dict(color='#4F46E5', width=2),
                            marker=dict(size=5)
                        ))
                    
                    fig_fc.add_trace(go.Scatter(
                        x=result['forecast_dates'],
                        y=result['forecast_values'],
                        mode='lines+markers',
                        name='Forecast',
                        line=dict(color='#F59E0B', width=2, dash='dash'),
                        marker=dict(size=5, symbol='diamond')
                    ))
                    
                    # Confidence band
                    upper = [min(100, v + 8) for v in result['forecast_values']]
                    lower = [max(0, v - 8) for v in result['forecast_values']]
                    fig_fc.add_trace(go.Scatter(
                        x=result['forecast_dates'] + result['forecast_dates'][::-1],
                        y=upper + lower[::-1],
                        fill='toself',
                        fillcolor='rgba(245,158,11,0.12)',
                        line=dict(color='rgba(255,255,255,0)'),
                        name='Confidence Band',
                        showlegend=True
                    ))
                    
                    fig_fc.update_layout(
                        title='Positive Sentiment % — Historical & Forecast',
                        xaxis_title='Date',
                        yaxis_title='Positive Sentiment %',
                        yaxis=dict(range=[0, 100]),
                        hovermode='x unified'
                    )
                    st.plotly_chart(fig_fc, use_container_width=True, key="dashboard_forecast_chart")
                    
                    if result['data_points'] < 5:
                        st.info("💡 Tip: Forecast accuracy improves with more historical data. Add more entries with date information for better projections.")
                else:
                    st.info("No entries found for this analysis.")

# ===== ANALYSIS PAGE =====
def show_analysis_page():
    """Display analysis creation page"""
    st.markdown("<h1 class='main-header'>📝 New Analysis</h1>", unsafe_allow_html=True)
    
    # Input method
    st.subheader("Step 1: Upload Data")
    input_method = st.radio("Choose input method", ["Upload File (CSV/JSON)", "Paste Text"], horizontal=True)
    
    data = None
    texts = []
    
    if input_method == "Upload File (CSV/JSON)":
        uploaded_file = st.file_uploader("Choose a CSV or JSON file", type=['csv', 'json'])
        
        if uploaded_file:
            try:
                if uploaded_file.name.endswith('.csv'):
                    data = pd.read_csv(uploaded_file)
                else:
                    data = pd.read_json(uploaded_file)
                
                st.success(f"✅ Loaded {len(data)} entries")
                
                # Show preview
                with st.expander("Preview data"):
                    st.dataframe(data.head(), use_container_width=True)
                
                # Column selection
                columns = data.columns.tolist()
                selected_column = st.selectbox("Select text column to analyze", columns)
                
                texts = data[selected_column].astype(str).tolist()
            except Exception as e:
                st.error(f"Error loading file: {str(e)}")
    
    else:  # Paste text
        text_area = st.text_area(
            "Paste reviews or text (one per line)",
            height=200,
            placeholder="Example:\nGreat product, fast delivery!\nBad quality, not worth it\nAverage, nothing special"
        )
        
        if text_area:
            texts = [t.strip() for t in text_area.split('\n') if t.strip()]
            st.success(f"✅ Entered {len(texts)} entries")
    
    st.divider()
    
    # Configuration
    st.subheader("Step 2: Configure Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        analysis_name = st.text_input("Analysis Name", placeholder="e.g., Q1 Customer Feedback")
    
    with col2:
        ai_mode = st.selectbox("AI Mode", ["In-Browser (Fast & Free)", "Cloud (More Accurate)"])
    
    st.subheader("Step 3: Select Features")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        emotion_detection = st.checkbox("🎭 Emotion Detection", value=True)
    with col2:
        keyword_extraction = st.checkbox("🔑 Keyword Extraction", value=True)
    with col3:
        fake_detection = st.checkbox("🚨 Fake Review Detection", value=False)
    
    st.divider()
    
    # Analyze button
    if st.button("🚀 Analyze Now", use_container_width=True, type="primary"):
        if not analysis_name:
            st.error("Please enter an analysis name")
        elif len(texts) == 0:
            st.error("Please upload a file or enter text")
        else:
            with st.spinner("🔄 Analyzing your data... This may take a moment"):
                try:
                    # Run sentiment analysis
                    analyzer = get_sentiment_analyzer()
                    results = []
                    progress_bar = st.progress(0)
                    
                    for i, text in enumerate(texts):
                        result = analyzer.analyze(text)
                        results.append({
                            'text': text,
                            'sentiment': result['sentiment'],
                            'confidence': result['confidence'],
                            'emotion': result.get('emotion', 'neutral')
                        })
                        progress_bar.progress((i + 1) / len(texts))
                    
                    # Calculate summary statistics
                    sentiment_dist = {s: sum(1 for r in results if r['sentiment'] == s) for s in ['Positive', 'Negative', 'Neutral']}
                    avg_confidence = np.mean([r['confidence'] for r in results])
                    
                    # Extract keywords
                    all_keywords = {}
                    if keyword_extraction:
                        negative_texts = [r['text'] for r in results if r['sentiment'] == 'Negative']
                        if negative_texts:
                            all_keywords = extract_keywords(negative_texts)
                    
                    # Detect fake reviews
                    fake_count = 0
                    if fake_detection:
                        fake_detector = FakeReviewDetector()
                        fake_results = fake_detector.detect_fake_reviews([r['text'] for r in results])
                        fake_count = fake_results.get('suspicious_count', 0)
                    
                    # Save to database
                    db = DatabaseManager()
                    analysis_id = db.save_analysis(
                        st.session_state.user_id,
                        analysis_name,
                        f"Analyzed {len(texts)} entries",
                        input_method,
                        ai_mode
                    )
                    
                    for result in results:
                        db.save_analysis_entry(analysis_id, result)
                    
                    summary = {
                        'total_entries': len(results),
                        'positive_count': sentiment_dist['Positive'],
                        'negative_count': sentiment_dist['Negative'],
                        'neutral_count': sentiment_dist['Neutral'],
                        'avg_confidence': float(avg_confidence),
                        'top_keywords': list(all_keywords.keys())[:10] if all_keywords else [],
                        'fake_reviews': fake_count
                    }
                    
                    db.save_analysis_summary(analysis_id, summary)

                    # ── Auto-evaluate and persist alerts ──
                    try:
                        from backend.alert_manager import get_alert_manager
                        alert_mgr = get_alert_manager()
                        triggered = alert_mgr.process_analysis_alerts(
                            user_id=st.session_state.user_id,
                            analysis_id=analysis_id,
                            analysis_name=analysis_name,
                            summary=summary
                        )
                        if triggered:
                            critical_alerts = [a for a in triggered if a['severity'] == 'critical']
                            if critical_alerts:
                                st.error(f"🔴 {len(critical_alerts)} critical alert(s) triggered — check the Alerts page!")
                            elif len(triggered) > 0:
                                st.warning(f"🟡 {len(triggered)} alert(s) triggered — check the Alerts page!")
                    except Exception as _alert_err:
                        pass  # Alerts are non-blocking

                    # Display results
                    st.success("✅ Analysis Complete!")

                    
                    # Results tabs
                    res_tab1, res_tab2, res_tab3, res_tab4 = st.tabs(["📊 Overview", "📈 Charts", "💡 Insights", "📋 Details"])
                    
                    with res_tab1:
                        col1, col2, col3, col4 = st.columns(4)
                        
                        with col1:
                            display_metric_card("Total", str(len(results)), "📊")
                        with col2:
                            positive_pct = sentiment_dist['Positive'] * 100 / len(results)
                            display_metric_card("Positive", f"{positive_pct:.1f}%", "😊", color="green")
                        with col3:
                            negative_pct = sentiment_dist['Negative'] * 100 / len(results)
                            display_metric_card("Negative", f"{negative_pct:.1f}%", "😠", color="red")
                        with col4:
                            display_metric_card("Confidence", f"{avg_confidence:.1f}%", "⭐")
                        
                        if emotion_detection:
                            st.divider()
                            st.subheader("🎭 Emotion Distribution")
                            emotions = {}
                            for r in results:
                                emotion = r.get('emotion', 'neutral')
                                emotions[emotion] = emotions.get(emotion, 0) + 1
                            
                            col_em1, col_em2 = st.columns(2)
                            
                            with col_em1:
                                for emotion, count in emotions.items():
                                    st.write(f"{emotion.title()}: {count}")
                            
                            with col_em2:
                                fig = display_emotion_breakdown(emotions)
                                st.plotly_chart(fig, use_container_width=True, key="results_emotions_chart")
                    
                    with res_tab2:
                        col_c1, col_c2 = st.columns(2)
                        
                        with col_c1:
                            fig_sentiment = display_sentiment_distribution(sentiment_dist)
                            st.plotly_chart(fig_sentiment, use_container_width=True, key="results_sentiment_distribution")
                        
                        with col_c2:
                            if keyword_extraction and all_keywords:
                                st.subheader("🔑 Top Keywords (Negative Reviews)")
                                
                                # Bar chart of keywords
                                keywords_list = list(all_keywords.items())[:10]
                                fig_keywords = px.bar(
                                    x=[k[0] for k in keywords_list],
                                    y=[k[1] for k in keywords_list],
                                    title="Top Keywords",
                                    labels={'x': 'Keyword', 'y': 'Frequency'}
                                )
                                st.plotly_chart(fig_keywords, use_container_width=True, key="results_keywords_chart")
                        
                        # Word cloud
                        if keyword_extraction:
                            negative_texts = [r['text'] for r in results if r['sentiment'] == 'Negative']
                            if negative_texts:
                                st.divider()
                                display_wordcloud(negative_texts, "Negative Keywords Word Cloud")
                    
                    with res_tab3:
                        st.subheader("💡 AI-Generated Insights")
                        
                        insights = []
                        
                        # Overall sentiment
                        if sentiment_dist['Positive'] > sentiment_dist['Negative']:
                            insights.append({
                                'type': 'positive',
                                'text': f"Overall sentiment is positive ({sentiment_dist['Positive']*100//len(results)}% positive reviews)"
                            })
                        else:
                            insights.append({
                                'type': 'warning',
                                'text': f"Overall sentiment is negative ({sentiment_dist['Negative']*100//len(results)}% negative reviews)"
                            })
                        
                        # Top keywords
                        if all_keywords:
                            top_keyword = list(all_keywords.keys())[0]
                            top_count = list(all_keywords.values())[0]
                            insights.append({
                                'type': 'warning',
                                'text': f"'{top_keyword}' is mentioned in {int(top_count)} negative reviews - top complaint"
                            })
                        
                        # Confidence
                        if avg_confidence > 90:
                            insights.append({
                                'type': 'positive',
                                'text': f"High confidence in analysis ({avg_confidence:.1f}%) - results are reliable"
                            })
                        
                        # Fake detection
                        if fake_detection and fake_count > 0:
                            insights.append({
                                'type': 'warning',
                                'text': f"Found {fake_count} suspicious reviews that may be fake or spam"
                            })
                        
                        display_insights_panel(insights)
                    
                    with res_tab4:
                        st.subheader("📋 All Entries")
                        
                        # Filter options
                        col_f1, col_f2 = st.columns(2)
                        
                        with col_f1:
                            sentiment_filter = st.multiselect(
                                "Filter by sentiment",
                                ['Positive', 'Negative', 'Neutral'],
                                default=['Positive', 'Negative', 'Neutral']
                            )
                        
                        with col_f2:
                            search_term = st.text_input("Search reviews")
                        
                        # Filter results
                        filtered_results = [r for r in results if r['sentiment'] in sentiment_filter]
                        if search_term:
                            filtered_results = [r for r in filtered_results if search_term.lower() in r['text'].lower()]
                        
                        # Display table
                        df_results = pd.DataFrame(filtered_results)
                        st.dataframe(df_results, use_container_width=True, height=400)
                        
                        st.divider()
                        
                        # Export options
                        st.subheader("📥 Export Results")
                        
                        col_e1, col_e2, col_e3 = st.columns(3)
                        
                        with col_e1:
                            csv = df_results.to_csv(index=False).encode('utf-8')
                            st.download_button(
                                "📥 CSV",
                                csv,
                                f"{analysis_name.replace(' ', '_')}.csv",
                                "text/csv",
                                use_container_width=True
                            )
                        
                        with col_e2:
                            from openpyxl import Workbook
                            from io import BytesIO
                            
                            excel_buffer = BytesIO()
                            df_results.to_excel(excel_buffer, sheet_name='Results', index=False)
                            excel_buffer.seek(0)
                            
                            st.download_button(
                                "📊 Excel",
                                excel_buffer,
                                f"{analysis_name.replace(' ', '_')}.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                use_container_width=True
                            )
                        
                        with col_e3:
                            st.button("📤 Share Report", use_container_width=True)
                
                except Exception as e:
                    st.error(f"Error during analysis: {str(e)}")

# ===== HISTORY PAGE =====
def show_history_page():
    """Display analysis history"""
    st.markdown("<h1 class='main-header'>📚 History</h1>", unsafe_allow_html=True)
    
    db = DatabaseManager()
    analyses = db.get_user_analyses(st.session_state.user_id)
    
    if not analyses:
        st.markdown("""
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">No analyses yet</div>
            </div>
        """, unsafe_allow_html=True)
    else:
        st.subheader(f"Total Analyses: {len(analyses)}")
        
        for analysis in analyses:
            col1, col2, col3 = st.columns([3, 1, 1])
            
            with col1:
                st.write(f"**{analysis['name']}**")
                st.caption(f"📅 {analysis['created_at']} | Mode: {analysis['ai_mode']}")
            
            with col2:
                if st.button("👁️", key=f"view_hist_{analysis['id']}", use_container_width=True):
                    st.session_state.current_analysis = analysis['id']
                    st.session_state.emotion_analysis_select = analysis['id']
                    st.session_state.issues_analysis_select = analysis['id']
                    st.session_state.quality_analysis_select = analysis['id']
                    navigate('dashboard')
                    st.rerun()
            
            with col3:
                if st.button("🗑️", key=f"delete_{analysis['id']}", use_container_width=True):
                    db.delete_analysis(analysis['id'])
                    st.success("Analysis deleted!")
                    st.rerun()
            
            st.divider()

# ===== SETTINGS PAGE =====
def show_settings_page():
    """Display comprehensive settings page"""
    st.markdown("<h1 class='main-header'>⚙️ Settings</h1>", unsafe_allow_html=True)
    
    db = DatabaseManager()
    
    # Try to get user info
    try:
        user_info = db.get_user_info(st.session_state.user_id)
    except AttributeError as e:
        st.error(f"❌ Error loading user information: {str(e)}")
        st.info("💡 Try refreshing the page or clearing browser cache")
        st.stop()
    
    # Try to get preferences
    try:
        user_prefs = db.get_user_preferences(st.session_state.user_id)
    except (AttributeError, Exception):
        user_prefs = None
    
    if not user_prefs:
        # Initialize default preferences
        user_prefs = {
            'analysis_mode': 'Fast',
            'chart_type': 'Donut',
            'show_confidence': True,
            'enable_emojis': True,
            'notify_sentiment_drop': True,
            'weekly_summary': False,
            'keyword_alerts': False,
            'auto_delete_days': 365,
            'theme': 'Light'
        }
    
    if user_info:
        # ===== PROFILE SECTION =====
        with st.expander("👤 Profile Information", expanded=True):
            col1, col2 = st.columns(2)
            
            with col1:
                st.text_input("Username", value=user_info['username'], disabled=True)
                st.text_input("Email", value=user_info['email'], disabled=True)
            
            with col2:
                st.text_input("Role", value="Brand Analyst", disabled=True)
                st.text_input("Member Since", value=str(user_info['created_at']), disabled=True)
        
        st.divider()
        
        # ===== ML & ANALYSIS SETTINGS =====
        with st.expander("🤖 AI & Analysis Preferences", expanded=True):
            col1, col2 = st.columns(2)
            
            with col1:
                analysis_mode = st.radio(
                    "Analysis Mode",
                    ["⚡ Fast (In-Browser)", "🎯 Accurate (Cloud AI)"],
                    index=0 if user_prefs['analysis_mode'] == 'Fast' else 1
                )
            
            with col2:
                st.info("📌 **Currently Active Model**\n\n`distilbert-base-uncased-finetuned-sst-2-english`\n\n**Provider:** Hugging Face Transformers")
            
            st.divider()
            
            st.write("**Model Details**")
            model_col1, model_col2, model_col3 = st.columns(3)
            
            with model_col1:
                st.metric("Architecture", "DistilBERT")
            with model_col2:
                st.metric("Language", "English")
            with model_col3:
                st.metric("Task", "Sentiment Analysis")
        
        st.divider()
        
        # ===== VISUALIZATION PREFERENCES =====
        with st.expander("📈 Dashboard Preferences"):
            col1, col2 = st.columns(2)
            
            with col1:
                chart_type = st.selectbox(
                    "Default Chart Type",
                    ["Donut", "Bar", "Pie"],
                    index=["Donut", "Bar", "Pie"].index(user_prefs['chart_type'])
                )
            
            with col2:
                theme = st.selectbox(
                    "Theme",
                    ["Light", "Dark", "Auto"],
                    index=["Light", "Dark", "Auto"].index(user_prefs['theme'])
                )
            
            st.divider()
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                show_confidence = st.checkbox(
                    "Show confidence scores",
                    value=user_prefs['show_confidence']
                )
            
            with col2:
                enable_emojis = st.checkbox(
                    "Enable emotion emojis",
                    value=user_prefs['enable_emojis']
                )
            
            with col3:
                auto_save = st.checkbox(
                    "Auto-save analyses",
                    value=True
                )
        
        st.divider()
        
        # ===== NOTIFICATIONS & ALERTS =====
        with st.expander("🔔 Alerts & Notifications"):
            st.write("**Notification Preferences**")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                notify_drop = st.checkbox(
                    "Notify on sentiment drop > 20%",
                    value=user_prefs['notify_sentiment_drop']
                )
            
            with col2:
                weekly_summary = st.checkbox(
                    "Weekly sentiment summary",
                    value=user_prefs['weekly_summary']
                )
            
            with col3:
                keyword_alerts = st.checkbox(
                    "Keyword spike alerts",
                    value=user_prefs['keyword_alerts']
                )
            
            if keyword_alerts:
                st.text_input(
                    "Keywords to monitor (comma-separated)",
                    placeholder="e.g., delivery, quality, price",
                    value="delivery"
                )
        
        st.divider()
        
        # ===== DATA & PRIVACY SETTINGS =====
        with st.expander("🔒 Data & Privacy"):
            col1, col2 = st.columns(2)
            
            with col1:
                save_history = st.checkbox(
                    "Save analysis history",
                    value=True
                )
            
            with col2:
                auto_delete_days = st.selectbox(
                    "Auto-delete analyses after",
                    [30, 90, 180, 365, 730],
                    index=[30, 90, 180, 365, 730].index(user_prefs['auto_delete_days']),
                    format_func=lambda x: f"{x} days" if x < 365 else f"{x//365} year(s)"
                )
            
            st.info("💾 Your data is stored securely in a local SQLite database. No data is sent to external servers unless you enable Cloud AI mode.")
        
        st.divider()
        
        # ===== SECURITY SECTION =====
        with st.expander("🔐 Security"):
            st.write("**Password & Sessions**")
            
            col1, col2 = st.columns(2)
            
            with col1:
                if st.button("🔑 Change Password", use_container_width=True):
                    st.info("Password change feature coming in v1.1")
            
            with col2:
                if st.button("🚪 Logout All Sessions", use_container_width=True):
                    st.info("All sessions cleared (feature coming in v1.1)")
        
        st.divider()
        
        # ===== SAVE PREFERENCES =====
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("💾 Save All Preferences", use_container_width=True, type="primary"):
                # Prepare preferences dictionary
                prefs_to_save = {
                    'analysis_mode': 'Accurate' if 'Accurate' in analysis_mode else 'Fast',
                    'chart_type': chart_type,
                    'show_confidence': show_confidence,
                    'enable_emojis': enable_emojis,
                    'notify_sentiment_drop': notify_drop,
                    'weekly_summary': weekly_summary,
                    'keyword_alerts': keyword_alerts,
                    'auto_delete_days': auto_delete_days,
                    'theme': theme
                }
                
                # Save to database
                db.save_user_preferences(st.session_state.user_id, prefs_to_save)
                st.success("✅ All preferences saved successfully!")
        
        with col2:
            if st.button("🔄 Reset to Defaults", use_container_width=True):
                # Reset to default preferences
                default_prefs = {
                    'analysis_mode': 'Fast',
                    'chart_type': 'Donut',
                    'show_confidence': True,
                    'enable_emojis': True,
                    'notify_sentiment_drop': True,
                    'weekly_summary': False,
                    'keyword_alerts': False,
                    'auto_delete_days': 365,
                    'theme': 'Light'
                }
                db.save_user_preferences(st.session_state.user_id, default_prefs)
                st.success("✅ Preferences reset to defaults!")
                st.rerun()
        
        with col3:
            if st.button("🚪 Sign Out", use_container_width=True):
                st.session_state.authenticated = False
                st.session_state.user_id = None
                st.success("👋 You have been signed out!")
                st.rerun()
        
        st.divider()
        
        # ===== DANGER ZONE =====
        with st.expander("⚠️ Danger Zone"):
            st.warning("⚠️ **Warning:** These actions cannot be undone!")
            
            col1, col2 = st.columns(2)
            
            with col1:
                if st.button("🗑️ Delete All My Data", type="secondary", use_container_width=True):
                    st.error("❌ This action is permanent and cannot be undone!")
                    confirm = st.checkbox("I understand and want to delete everything")
                    
                    if confirm and st.button("🔴 Confirm Delete", use_container_width=True):
                        # Delete all user data
                        st.error("Feature coming in v1.1 - Account deletion with data cleanup")
            
            with col2:
                st.write("**Account Status:** Active ✅")
                st.write("**Last Login:** Just now")


# ===== MAIN FUNCTION =====
def main():
    if not check_authentication():
        show_login_page()
    else:
        show_sidebar()
        
        current_page = st.session_state.get('current_page', 'dashboard')
        
        if current_page == 'dashboard':
            show_dashboard()
        elif current_page == 'analysis':
            show_analysis_page()
        elif current_page == 'history':
            show_history_page()
        elif current_page == 'settings':
            show_settings_page()
        # Advanced features pages
        elif current_page == 'realtime':
            show_realtime_monitoring_page()
        elif current_page == 'multisource':
            show_multisource_page()
        elif current_page == 'visual':
            show_visual_analysis_page()
        elif current_page == 'topics':
            show_topic_discovery_page()
        elif current_page == 'custom_dashboard':
            show_custom_dashboard_page()
        elif current_page == 'reviews':
            show_review_aggregation_page()
        elif current_page == 'benchmark':
            from app.competitor_benchmarking import show_competitor_benchmarking_page
            show_competitor_benchmarking_page()
        elif current_page == 'alerts':
            from app.alerts_page import show_alerts_page
            show_alerts_page()
        elif current_page == 'absa':
            from app.absa_page import show_absa_page
            show_absa_page()

if __name__ == "__main__":
    main()
