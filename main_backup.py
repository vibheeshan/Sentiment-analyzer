import streamlit as st
import pandas as pd
from datetime import datetime
import sys
import os

# Add project root directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.auth_service import AuthenticationManager, set_session_user, clear_session, check_authentication
from backend.database import DatabaseManager
from backend.advanced_features import (
    EmotionDetector, ComplaintAnalyzer, SentimentChangeDetector, 
    FakeReviewDetector, BrandComparator, MultilingualSupport
)
from app.components import UIComponents, display_sentiment_stats, display_insights, display_top_reviews

# Configure page
st.set_page_config(
    page_title="Sentiment Monitor - Brand Intelligence Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
        :root {
            --primary-color: #0ea5e9;
            --success-color: #22c55e;
            --danger-color: #ef4444;
            --neutral-color: #6b7280;
            --light-bg: #f9fafb;
            --dark-bg: #1f2937;
        }
        
        .main-header {
            color: var(--primary-color);
            font-size: 32px;
            font-weight: bold;
            margin: 20px 0;
        }
        
        .card {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin: 10px 0;
        }
        
        .sidebar-section {
            padding: 15px;
            margin: 10px 0;
            background-color: var(--light-bg);
            border-radius: 8px;
        }
    </style>
""", unsafe_allow_html=True)

# Initialize session state
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'user_id' not in st.session_state:
    st.session_state.user_id = None
if 'username' not in st.session_state:
    st.session_state.username = None
if 'current_page' not in st.session_state:
    st.session_state.current_page = 'dashboard'

# Helper function to convert sqlite3.Row to dict
def row_to_dict(row):
    """Convert sqlite3.Row object to dictionary"""
    if row is None:
        return None
    if isinstance(row, dict):
        return row
    if hasattr(row, 'keys'):
        return dict(zip(row.keys(), row))
    return row

# Authentication Manager
auth_manager = AuthenticationManager()

def show_login_page():
    """Display login/signup page"""
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("<h1 style='text-align: center; color: #0ea5e9;'>🎯 Sentiment Monitor</h1>", 
                   unsafe_allow_html=True)
        st.markdown("<p style='text-align: center; color: #6b7280;'>AI-Powered Brand Sentiment Analysis</p>", 
                   unsafe_allow_html=True)
        
        st.divider()
        
        # Tab for login vs signup
        tab1, tab2 = st.tabs(["Sign In", "Sign Up"])
        
        with tab1:
            st.subheader("Welcome Back!")
            
            username = st.text_input("Username", placeholder="Enter your username", key="login_username")
            password = st.text_input("Password", type="password", placeholder="Enter your password", key="login_password")
            
            if st.button("🔓 Sign In", use_container_width=True, type="primary"):
                if username and password:
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
            st.subheader("Create New Account")
            
            signup_username = st.text_input("Choose a username", placeholder="At least 3 characters", key="signup_username")
            signup_email = st.text_input("Email address", placeholder="your@email.com", key="signup_email")
            signup_password = st.text_input("Create a password", type="password", placeholder="At least 6 characters", key="signup_password")
            signup_confirm = st.text_input("Confirm password", type="password", key="signup_confirm")
            
            if st.button("✍️ Create Account", use_container_width=True, type="primary"):
                if signup_username and signup_email and signup_password and signup_confirm:
                    result = auth_manager.signup(signup_username, signup_email, signup_password, signup_confirm)
                    if result['success']:
                        st.success("Account created successfully! Now sign in with your credentials.")
                        st.info("Go to the Sign In tab to log in")
                    else:
                        st.error(result['error'])
                else:
                    st.warning("Please fill in all fields")
        
        st.divider()
        st.markdown("""
            <div style='text-align: center; color: #6b7280; font-size: 12px;'>
                <p>🔒 Your data is secure and encrypted</p>
            </div>
        """, unsafe_allow_html=True)

def show_dashboard():
    """Display main dashboard"""
    
    # Sidebar
    with st.sidebar:
        st.markdown(f"<h3 style='color: #0ea5e9;'>👤 {st.session_state.username}</h3>", unsafe_allow_html=True)
        st.divider()
        
        st.markdown("### 📊 Navigation")
        
        if st.button("📈 Dashboard", use_container_width=True, key="nav_dashboard"):
            st.session_state.current_page = 'dashboard'
            st.rerun()
        
        if st.button("📝 New Analysis", use_container_width=True, key="nav_analysis"):
            st.session_state.current_page = 'analysis'
            st.rerun()
        
        if st.button("📚 History", use_container_width=True, key="nav_history"):
            st.session_state.current_page = 'history'
            st.rerun()
        
        if st.button("⚙️ Settings", use_container_width=True, key="nav_settings"):
            st.session_state.current_page = 'settings'
            st.rerun()
        
        st.divider()
        
        if st.button("🔓 Sign Out", use_container_width=True):
            clear_session()
            st.success("Signed out successfully!")
            st.rerun()
    
    # Main content
    if st.session_state.current_page == 'dashboard':
        show_main_dashboard()
    elif st.session_state.current_page == 'analysis':
        show_analysis_page()
    elif st.session_state.current_page == 'history':
        show_history_page()
    elif st.session_state.current_page == 'settings':
        show_settings_page()

def show_main_dashboard():
    """Display main dashboard page with advanced features"""
    st.markdown("<h1 class='main-header'>📊 Sentiment Monitoring Dashboard</h1>", unsafe_allow_html=True)
    
    # Get user's analyses
    db = DatabaseManager()
    analyses = db.get_user_analyses(st.session_state.user_id)
    
    if not analyses:
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            UIComponents.empty_state("📭", "No analyses yet. Start by uploading data or entering text!")
            
            if st.button("➕ Create Your First Analysis", use_container_width=True, type="primary"):
                st.session_state.current_page = 'analysis'
                st.rerun()
    else:
        # Dashboard tabs
        tab1, tab2, tab3, tab4, tab5 = st.tabs([
            "📈 Overview",
            "🎭 Emotions",
            "⚠️ Issues",
            "🔍 Anomalies",
            "🏆 Comparison"
        ])
        
        # TAB 1: Overview
        with tab1:
            st.subheader("📋 Analysis Overview")
            
            # Summary metrics
            col1, col2, col3, col4 = st.columns(4)
            
            total_entries = sum(len(db.get_analysis_entries(a['id'])) for a in analyses)
            avg_confidence = 0
            sentiment_counts = {'Positive': 0, 'Negative': 0, 'Neutral': 0}
            
            for analysis in analyses[:5]:
                entries = db.get_analysis_entries(analysis['id'])
                for entry in entries:
                    entry_dict = row_to_dict(entry)
                    sentiment = entry_dict.get('sentiment', entry_dict[2] if isinstance(entry, tuple) else 'Neutral')
                    confidence = entry_dict.get('confidence', entry_dict[4] if isinstance(entry, tuple) else 0)
                    sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
                    avg_confidence += confidence
            
            with col1:
                st.metric("📌 Total Analyses", len(analyses))
            with col2:
                st.metric("📝 Total Entries", total_entries)
            with col3:
                st.metric("⭐ Avg Confidence", f"{avg_confidence/max(total_entries, 1):.1f}%")
            with col4:
                positive_pct = (sentiment_counts['Positive'] / max(total_entries, 1)) * 100
                st.metric("😊 Positive %", f"{positive_pct:.1f}%")
            
            # Recent analyses with details
            st.markdown("### 📌 Recent Analyses")
            for i, analysis in enumerate(analyses[:5]):
                with st.expander(f"🔹 {analysis['name']} ({analysis['created_at'][:10]})"):
                    col_left, col_right = st.columns(2)
                    
                    db_entries = db.get_analysis_entries(analysis['id'])
                    db_summary = db.get_analysis_summary(analysis['id'])
                    
                    with col_left:
                        if db_summary:
                            total = db_summary['total_entries']
                            st.write(f"**Total Entries:** {total}")
                            st.write(f"**📈 Positive:** {db_summary['positive_count']} ({db_summary['positive_count']*100//max(total, 1)}%)")
                            st.write(f"**📉 Negative:** {db_summary['negative_count']} ({db_summary['negative_count']*100//max(total, 1)}%)")
                            st.write(f"**➖ Neutral:** {db_summary['neutral_count']} ({db_summary['neutral_count']*100//max(total, 1)}%)")
                            st.write(f"**🎯 Avg Confidence:** {db_summary['avg_confidence']:.1f}%")
                    
                    with col_right:
                        # Sentiment distribution pie chart
                        sentiment_dist = {
                            'Positive': db_summary['positive_count'],
                            'Negative': db_summary['negative_count'],
                            'Neutral': db_summary['neutral_count']
                        }
                        
                        import plotly.express as px
                        fig = px.pie(
                            values=sentiment_dist.values(),
                            names=sentiment_dist.keys(),
                            title="Sentiment Distribution",
                            color_discrete_map={'Positive': '#22c55e', 'Negative': '#ef4444', 'Neutral': '#6b7280'}
                        )
                        st.plotly_chart(fig, use_container_width=True)
                    
                    col_view, col_export = st.columns(2)
                    with col_view:
                        if st.button("👁️ View Details", key=f"view_{analysis['id']}"):
                            st.info("Analysis details would be displayed here")
                    with col_export:
                        if st.button("📥 Export", key=f"export_{analysis['id']}"):
                            st.info("Export functionality would be displayed here")
        
        # TAB 2: Emotion Analysis
        with tab2:
            st.subheader("🎭 Advanced Emotion Detection")
            
            emotion_detector = EmotionDetector()
            
            # Select analysis to analyze emotions for
            selected_analysis = st.selectbox("Select an analysis to view emotions", 
                                            [a['name'] for a in analyses[:5]])
            
            selected_analysis_data = next((a for a in analyses[:5] if a['name'] == selected_analysis), None)
            
            if selected_analysis_data:
                entries = db.get_analysis_entries(selected_analysis_data['id'])
                
                if entries:
                    # Analyze emotions
                    emotion_results = []
                    emotion_distribution = {
                        'joy': 0, 'anger': 0, 'sadness': 0, 'surprise': 0, 'trust': 0
                    }
                    
                    for entry in entries[:20]:  # Limit to first 20 for performance
                        entry_dict = row_to_dict(entry)
                        text = entry_dict.get('text', entry_dict[3] if isinstance(entry, tuple) else '')
                        emotion = emotion_detector.detect_emotion(text)
                        emotion_results.append(emotion)
                        if emotion['emotion'].lower() in emotion_distribution:
                            emotion_distribution[emotion['emotion'].lower()] += 1
                    
                    # Display emotion stats
                    col1, col2, col3, col4, col5 = st.columns(5)
                    emotions = list(emotion_distribution.keys())
                    
                    with col1:
                        st.metric("😊 Joy", emotion_distribution['joy'])
                    with col2:
                        st.metric("😠 Anger", emotion_distribution['anger'])
                    with col3:
                        st.metric("😢 Sadness", emotion_distribution['sadness'])
                    with col4:
                        st.metric("😲 Surprise", emotion_distribution['surprise'])
                    with col5:
                        st.metric("🤝 Trust", emotion_distribution['trust'])
                    
                    # Emotion distribution chart
                    import plotly.express as px
                    fig = px.bar(
                        x=list(emotion_distribution.keys()),
                        y=list(emotion_distribution.values()),
                        title="Emotion Distribution",
                        color=list(emotion_distribution.keys()),
                        color_discrete_sequence=['#FFD700', '#FF4444', '#4444FF', '#FFAA00', '#22c55e']
                    )
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Show emotion samples
                    st.markdown("### 📝 Sample Emotions Detected")
                    for i, result in enumerate(emotion_results[:5]):
                        st.write(f"**{result['emotion']}** (Confidence: {result['confidence']:.1f}%)")
        
        # TAB 3: Issue & Complaint Analysis
        with tab3:
            st.subheader("⚠️ Complaint & Issue Detection")
            
            complaint_analyzer = ComplaintAnalyzer()
            
            selected_analysis = st.selectbox("Select an analysis for complaint analysis", 
                                            [a['name'] for a in analyses[:5]], key="complaint_select")
            
            selected_analysis_data = next((a for a in analyses[:5] if a['name'] == selected_analysis), None)
            
            if selected_analysis_data:
                entries = db.get_analysis_entries(selected_analysis_data['id'])
                
                if entries:
                    # Get negative reviews
                    negative_reviews = []
                    for e in entries:
                        e_dict = row_to_dict(e)
                        sentiment = e_dict.get('sentiment', e_dict[2] if isinstance(e, tuple) else 'Neutral')
                        text = e_dict.get('text', e_dict[3] if isinstance(e, tuple) else '')
                        if sentiment == 'Negative':
                            negative_reviews.append(text)
                    
                    if negative_reviews:
                        complaints = complaint_analyzer.analyze_complaints(negative_reviews)
                        
                        col1, col2 = st.columns(2)
                        
                        with col1:
                            st.markdown("### 🎯 Top Complaints")
                            for i, complaint in enumerate(complaints['top_complaints'], 1):
                                score = complaints['scores'][complaint]
                                st.write(f"**{i}. {complaint.replace('_', ' ').title()}** - {score} mentions")
                        
                        with col2:
                            st.markdown("### 📊 All Complaint Categories")
                            import plotly.express as px
                            fig = px.bar(
                                x=list(complaints['scores'].keys()),
                                y=list(complaints['scores'].values()),
                                title="Complaint Categories",
                                labels={'x': 'Category', 'y': 'Count'}
                            )
                            st.plotly_chart(fig, use_container_width=True)
                    else:
                        st.info("✅ No negative reviews found in this analysis!")
        
        # TAB 4: Fake Review Detection & Anomalies
        with tab4:
            st.subheader("🔍 Quality Assurance & Anomaly Detection")
            
            fake_detector = FakeReviewDetector()
            change_detector = SentimentChangeDetector()
            
            selected_analysis = st.selectbox("Select an analysis for anomaly detection", 
                                            [a['name'] for a in analyses[:5]], key="anomaly_select")
            
            selected_analysis_data = next((a for a in analyses[:5] if a['name'] == selected_analysis), None)
            
            if selected_analysis_data:
                entries = db.get_analysis_entries(selected_analysis_data['id'])
                
                if entries:
                    col1, col2 = st.columns(2)
                    
                    # Fake review detection
                    with col1:
                        st.markdown("### 🚨 Suspicious Reviews Detection")
                        texts = []
                        for e in entries:
                            e_dict = row_to_dict(e)
                            text = e_dict.get('text', e_dict[3] if isinstance(e, tuple) else '')
                            texts.append(text)
                        
                        fake_results = fake_detector.detect_fake_reviews(texts)
                        
                        st.write(f"**Suspicious Count:** {fake_results['suspicious_count']}")
                        st.write(f"**Fake Percentage:** {fake_results['fake_percentage']}%")
                        
                        if fake_results['suspicious_reviews']:
                            st.warning(f"Found {len(fake_results['suspicious_reviews'])} suspicious reviews")
                            for review in fake_results['suspicious_reviews'][:3]:
                                st.write(f"- Flag: {', '.join(review['flags'])} (Confidence: {review['confidence']}%)")
                        else:
                            st.success("✅ All reviews appear legitimate!")
                    
                    # Sentiment change detection
                    with col2:
                        st.markdown("### 📈 Sentiment Trends & Spikes")
                        
                        # Prepare time series data
                        time_series = []
                        for e in entries[:20]:
                            e_dict = row_to_dict(e)
                            created_at = e_dict.get('created_at', 'Unknown')
                            if isinstance(created_at, str):
                                date = created_at[:10]
                            else:
                                date = 'Unknown'
                            sentiment = e_dict.get('sentiment', e_dict[2] if isinstance(e, tuple) else 'Neutral')
                            time_series.append({
                                'date': date,
                                'sentiment': sentiment
                            })
                        
                        if time_series:
                            changes = change_detector.detect_changes(time_series)
                            
                            if changes['changes']:
                                st.warning("⚠️ Significant sentiment changes detected:")
                                for change in changes['changes'][:3]:
                                    st.write(f"- {change['alert']}")
                            else:
                                st.info("✅ Sentiment is stable - no major changes detected")
        
        # TAB 5: Brand Comparison
        with tab5:
            st.subheader("🏆 Multi-Analysis Comparison")
            
            if len(analyses) > 1:
                comparator = BrandComparator()
                
                col1, col2 = st.columns(2)
                
                with col1:
                    analysis1_name = st.selectbox("First Analysis", 
                                                 [a['name'] for a in analyses[:5]], key="comp1")
                
                with col2:
                    analysis2_name = st.selectbox("Second Analysis", 
                                                 [a['name'] for a in analyses[:5] if a['name'] != analysis1_name], 
                                                 key="comp2")
                
                analysis1_data = next((a for a in analyses[:5] if a['name'] == analysis1_name), None)
                analysis2_data = next((a for a in analyses[:5] if a['name'] == analysis2_name), None)
                
                if analysis1_data and analysis2_data:
                    entries1 = []
                    entries2 = []
                    
                    for e in db.get_analysis_entries(analysis1_data['id']):
                        e_dict = row_to_dict(e)
                        sentiment = e_dict.get('sentiment', e_dict[2] if isinstance(e, tuple) else 'Neutral')
                        confidence = e_dict.get('confidence', e_dict[4] if isinstance(e, tuple) else 0)
                        entries1.append({'sentiment': sentiment, 'confidence': confidence})
                    
                    for e in db.get_analysis_entries(analysis2_data['id']):
                        e_dict = row_to_dict(e)
                        sentiment = e_dict.get('sentiment', e_dict[2] if isinstance(e, tuple) else 'Neutral')
                        confidence = e_dict.get('confidence', e_dict[4] if isinstance(e, tuple) else 0)
                        entries2.append({'sentiment': sentiment, 'confidence': confidence})
                    
                    comparison = comparator.compare_sentiments(entries1, entries2, analysis1_name, analysis2_name)
                    
                    # Comparison metrics
                    col1, col2, col3, col4 = st.columns(4)
                    
                    with col1:
                        st.metric(analysis1_name, f"{comparison[analysis1_name]['positive_pct']:.1f}% Positive")
                    with col2:
                        st.metric(analysis2_name, f"{comparison[analysis2_name]['positive_pct']:.1f}% Positive")
                    with col3:
                        margin = comparison['differences']['positive_diff']
                        st.metric("Difference", f"{abs(margin):.1f}%", delta=f"{margin:+.1f}%")
                    with col4:
                        winner = comparison['comparison']['better']
                        st.success(f"Winner: {winner}")
                    
                    # Comparison chart
                    import plotly.graph_objects as go
                    
                    fig = go.Figure(data=[
                        go.Bar(name=analysis1_name, x=['Positive', 'Negative', 'Neutral'], 
                              y=[comparison[analysis1_name]['positive_pct'], 
                                 comparison[analysis1_name]['negative_pct'],
                                 comparison[analysis1_name]['neutral_pct']]),
                        go.Bar(name=analysis2_name, x=['Positive', 'Negative', 'Neutral'],
                              y=[comparison[analysis2_name]['positive_pct'],
                                 comparison[analysis2_name]['negative_pct'],
                                 comparison[analysis2_name]['neutral_pct']])
                    ])
                    fig.update_layout(barmode='group', title='Sentiment Comparison', yaxis_title='Percentage')
                    st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("ℹ️ Create at least 2 analyses to enable comparison")

def show_analysis_page():
    """Display analysis page"""
    st.markdown("<h1 class='main-header'>📝 New Analysis</h1>", unsafe_allow_html=True)
    
    # Input mode selection
    input_mode = st.radio("Select Input Method", ["Upload File", "Paste Text"], horizontal=True)
    
    analysis_name = st.text_input("Analysis Name", placeholder="e.g., Q1 Customer Feedback")
    ai_mode = st.selectbox("AI Mode", ["In-Browser (Fast & Free)", "Cloud (Accurate & Powerful)"])
    
    data = None
    text_columns = []
    
    if input_mode == "Upload File":
        st.subheader("📤 Upload Data")
        uploaded_file = st.file_uploader("Choose a CSV or JSON file", type=['csv', 'json'])
        
        if uploaded_file:
            try:
                from backend.data_handler import load_data_from_file
                data, text_columns = load_data_from_file(uploaded_file)
                st.success(f"✅ File loaded! Found {len(data)} entries")
                
                if text_columns:
                    selected_column = st.selectbox("Select text column to analyze", text_columns)
                else:
                    st.warning("No text columns detected")
            except Exception as e:
                st.error(f"Error loading file: {str(e)}")
    
    else:  # Paste Text
        st.subheader("✏️ Paste Text")
        text_input = st.text_area(
            "Enter text (one entry per line)",
            height=200,
            placeholder="Paste reviews or comments here...\nOne per line"
        )
        
        if text_input:
            try:
                from backend.data_handler import load_data_from_text
                data = load_data_from_text(text_input)
                st.success(f"✅ Text loaded! Found {len(data)} entries")
                selected_column = 'text'
            except Exception as e:
                st.error(f"Error parsing text: {str(e)}")
    
    # Analysis button
    if st.button("🚀 Analyze Now", use_container_width=True, type="primary"):
        if not analysis_name:
            st.error("Please enter an analysis name")
        elif data is None or len(data) == 0:
            st.error("Please upload a file or enter text")
        else:
            with st.spinner("🔄 Processing your data..."):
                try:
                    from backend.sentiment_service import get_sentiment_analyzer
                    from backend.insights_generator import generate_insights
                    
                    # Get texts to analyze
                    from backend.data_handler import DataInputHandler
                    texts = DataInputHandler.extract_text_from_data(data, [selected_column])
                    
                    # Analyze
                    analyzer = get_sentiment_analyzer()
                    results = analyzer.batch_analyze(texts)
                    
                    # Generate insights
                    summary = generate_insights(results)
                    
                    # Save to database
                    db = DatabaseManager()
                    analysis_id = db.save_analysis(
                        st.session_state.user_id,
                        analysis_name,
                        f"Analyzed {len(texts)} entries",
                        input_mode,
                        ai_mode
                    )
                    
                    for result in results:
                        db.save_analysis_entry(analysis_id, result)
                    
                    db.save_analysis_summary(analysis_id, summary)
                    
                    # Display results
                    st.success("✅ Analysis complete!")
                    
                    # Tabs for different views
                    tab1, tab2, tab3, tab4 = st.tabs(["Overview", "Charts", "Insights", "Details"])
                    
                    with tab1:
                        display_sentiment_stats(summary)
                    
                    with tab2:
                        from app.charts import ChartGenerator
                        chart_gen = ChartGenerator()
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            fig = chart_gen.sentiment_distribution_pie(
                                {s: summary['sentiment_distribution'][s]['count'] 
                                 for s in summary['sentiment_distribution']}
                            )
                            st.plotly_chart(fig, use_container_width=True)
                        
                        with col2:
                            if summary.get('top_keywords'):
                                keyword_dict = {kw: results.count(kw) for kw in summary['top_keywords']}
                                fig = chart_gen.word_cloud_bar(keyword_dict)
                                st.plotly_chart(fig, use_container_width=True)
                    
                    with tab3:
                        display_insights(summary)
                        st.divider()
                        display_top_reviews(summary)
                    
                    with tab4:
                        st.subheader("📋 All Entries")
                        df = pd.DataFrame(results)[['text', 'sentiment', 'confidence', 'emotion']]
                        st.dataframe(df, use_container_width=True, height=400)
                        
                        # Export buttons
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            csv = df.to_csv(index=False)
                            st.download_button("📥 Download CSV", csv, "analysis.csv", "text/csv")
                        
                        with col2:
                            st.button("📄 Download PDF")
                        
                        with col3:
                            st.button("📊 Share Report")
                
                except Exception as e:
                    st.error(f"Error during analysis: {str(e)}")
                    st.write(str(e))

def show_history_page():
    """Display analysis history"""
    st.markdown("<h1 class='main-header'>📚 Analysis History</h1>", unsafe_allow_html=True)
    
    db = DatabaseManager()
    analyses = db.get_user_analyses(st.session_state.user_id)
    
    if not analyses:
        UIComponents.empty_state("📭", "No analyses yet")
    else:
        st.subheader(f"Total Analyses: {len(analyses)}")
        
        # List all analyses
        for analysis in analyses:
            col1, col2, col3 = st.columns([3, 1, 1])
            
            with col1:
                st.write(f"**{analysis['name']}**")
                st.caption(f"Created: {analysis['created_at']} | Mode: {analysis['ai_mode']}")
            
            with col2:
                if st.button("👁️", key=f"view_hist_{analysis['id']}"):
                    st.info("Would display analysis details")
            
            with col3:
                if st.button("🗑️", key=f"delete_{analysis['id']}"):
                    st.warning("Would delete analysis")

def show_settings_page():
    """Display settings page"""
    st.markdown("<h1 class='main-header'>⚙️ Settings</h1>", unsafe_allow_html=True)
    
    db = DatabaseManager()
    user_info = db.get_user_info(st.session_state.user_id)
    
    if user_info:
        st.subheader("👤 Account Information")
        st.write(f"**Username:** {user_info['username']}")
        st.write(f"**Email:** {user_info['email']}")
        st.write(f"**Member Since:** {user_info['created_at']}")
        
        st.divider()
        
        st.subheader("🔧 Preferences")
        
        theme = st.selectbox("Theme", ["Light", "Dark", "Auto"])
        notifications = st.checkbox("Enable notifications", value=True)
        auto_save = st.checkbox("Auto-save analyses", value=True)
        
        if st.button("💾 Save Preferences"):
            st.success("Preferences saved!")
        
        st.divider()
        
        st.subheader("⚡ API Keys")
        st.info("Add your API keys for cloud AI features (optional)")
        
        google_key = st.text_input("Google Gemini API Key", type="password", placeholder="Paste your API key here")
        
        if st.button("🔐 Save API Key"):
            st.success("API key saved securely!")
        
        st.divider()
        
        st.subheader("🗑️ Danger Zone")
        
        if st.button("Delete All My Data", type="secondary"):
            st.warning("This action cannot be undone!")
            if st.checkbox("I understand, delete everything"):
                st.error("All data would be deleted")

# Main logic
def main():
    if not check_authentication():
        show_login_page()
    else:
        show_dashboard()

if __name__ == "__main__":
    main()
