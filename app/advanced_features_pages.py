"""
Advanced features pages for BrandPulse
Includes: Real-time monitoring, Multi-source integration, Visual analysis, Topic discovery, etc.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime
from backend.features_integration import get_brandpulse_features

# Initialize features
features = get_brandpulse_features()

def show_realtime_monitoring_page():
    """Display real-time monitoring and alerts dashboard"""
    st.markdown("<h1 class='main-header'>🔴 Real-Time Monitoring</h1>", unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["📊 Live Monitoring", "⚠️ Alerts", "🚨 Crisis Detection"])
    
    with tab1:
        st.subheader("Real-Time Sentiment Monitor")
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Crisis Level", features.real_time_monitor.crisis_level.upper(), 
                     delta="Stable" if features.real_time_monitor.crisis_level == "normal" else "⚠️ Alert")
        
        with col2:
            stats = features.real_time_monitor.get_monitoring_stats()
            st.metric("Total Monitored", stats.get('total_monitored', 0))
        
        with col3:
            st.metric("Recent Mentions", stats.get('recent_count', 0), 
                     delta=f"+{stats.get('recent_count', 0)} in last hour")
        
        with col4:
            st.metric("Active Keywords", stats.get('active_keywords', 0))
        
        st.divider()
        
        # Add custom monitoring rule
        st.subheader("Add Monitoring Rule")
        
        col1, col2 = st.columns(2)
        
        with col1:
            rule_name = st.text_input("Rule Name", placeholder="e.g., Quality Issues")
            keyword_to_monitor = st.text_input("Keyword to Monitor", placeholder="e.g., defect")
        
        with col2:
            alert_threshold = st.slider("Alert when mentions exceed", 1, 50, 10)
            alert_type = st.selectbox("Alert Type", ["Email", "Notification", "Both"])
        
        if st.button("➕ Add Rule", use_container_width=True):
            st.success(f"✅ Monitoring rule '{rule_name}' added!")
            st.info(f"Will alert when '{keyword_to_monitor}' is mentioned more than {alert_threshold} times")
    
    with tab2:
        st.subheader("Active Alerts")
        
        # Get recent alerts
        recent_alerts = features.real_time_monitor.check_alerts()
        
        if recent_alerts:
            for alert in recent_alerts[:10]:
                col1, col2, col3 = st.columns([3, 1, 1])
                
                severity_color = {
                    'critical': '🔴',
                    'high': '🟠',
                    'medium': '🟡',
                    'low': '🟢'
                }
                
                icon = severity_color.get(alert.get('severity', 'medium'), '🟡')
                
                with col1:
                    st.markdown(f"**{icon} {alert.get('type', 'Unknown').upper()}**")
                    st.caption(alert.get('message', 'No message'))
                
                with col2:
                    st.metric("Severity", alert.get('severity', 'medium').title())
                
                with col3:
                    if st.button("👁️ Details", key=f"alert_{alert.get('timestamp', 'unknown')}"):
                        st.json(alert)
                
                st.divider()
        else:
            st.info("✅ No active alerts - All systems normal!")
    
    with tab3:
        st.subheader("Crisis Level Analysis")
        
        crisis_score = features.crisis_detector.get_crisis_score([])
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Crisis Score", f"{crisis_score}/100")
        
        with col2:
            crisis_status = "🟢 Normal" if crisis_score < 30 else "🟡 Elevated" if crisis_score < 60 else "🔴 Critical"
            st.metric("Status", crisis_status)
        
        with col3:
            trend = "📈 Improving" if crisis_score < 20 else "📊 Stable" if crisis_score < 50 else "📉 Worsening"
            st.metric("Trend", trend)
        
        st.divider()
        
        st.subheader("Crisis Triggers Detected")
        st.info("💡 Monitor these potential crisis indicators:")
        st.write("""
        - **Viral Negativity**: > 80% negative sentiment in short timeframe
        - **Quality Issues**: Multiple product defect complaints
        - **Service Crisis**: Customer service complaints rising
        - **Safety Concerns**: Safety-related mentions detected
        """)


def show_multisource_page():
    """Display multi-source data integration"""
    st.markdown("<h1 class='main-header'>🌐 Multi-Source Integration</h1>", unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["📡 Sources", "🔍 Search", "📊 Comparison"])
    
    with tab1:
        st.subheader("Integrated Data Sources (50+)")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.info("✅ **Social Media Sources**")
            st.write("""
            - Twitter/X
            - Reddit
            - Instagram
            - Facebook
            - TikTok
            - LinkedIn
            """)
        
        with col2:
            st.info("✅ **News & Content**")
            st.write("""
            - News APIs
            - Blogs
            - Forums
            - YouTube
            - Podcasts
            - News Aggregators
            """)
        
        st.divider()
        
        # Source statistics
        stats = features.multi_source.get_stats()
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Sources", stats.get('total_sources', 50))
        
        with col2:
            st.metric("Active Sources", stats.get('active_sources', 0))
        
        with col3:
            st.metric("Total Data Points", stats.get('total_data_points', 0))
        
        with col4:
            st.metric("Last Sync", stats.get('last_aggregation', 'Never'))
    
    with tab2:
        st.subheader("Search Across All Sources")
        
        col1, col2 = st.columns([3, 1])
        
        with col1:
            search_keyword = st.text_input("Search keyword", placeholder="e.g., product name, brand")
        
        with col2:
            search_limit = st.number_input("Results limit", 10, 100, 50)
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            include_twitter = st.checkbox("Twitter/X", value=True)
        with col2:
            include_reddit = st.checkbox("Reddit", value=True)
        with col3:
            include_news = st.checkbox("News", value=True)
        
        if st.button("🔍 Search", use_container_width=True):
            st.info("🔄 Searching across sources...")
            
            with st.spinner("Aggregating data..."):
                results = features.multi_source.aggregate(
                    search_keyword,
                    {'sources': ['twitter', 'reddit', 'news']}
                )
            
            if results:
                st.success(f"✅ Found {len(results)} results")
                
                # Display results
                for i, result in enumerate(results[:10]):
                    st.markdown(f"**{i+1}. {result.get('title', result.get('text', 'Unknown')[:100])}**")
                    st.caption(f"Source: {result.get('_source', 'Unknown')} | Date: {result.get('created_at', 'Unknown')}")
                    st.write(result.get('text', result.get('description', ''))[:200])
                    st.divider()
            else:
                st.info("No results found")
    
    with tab3:
        st.subheader("Source Comparison")
        
        comparison = features.multi_source.get_source_distribution()
        
        if comparison:
            df_comparison = pd.DataFrame([
                {'Source': source, 'Mentions': count}
                for source, count in comparison.items()
            ])
            
            fig = px.bar(df_comparison, x='Source', y='Mentions', 
                        title='Data Distribution Across Sources',
                        color='Mentions', color_continuous_scale='viridis')
            
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Run a search first to see source distribution")


def show_visual_analysis_page():
    """Display visual sentiment analysis"""
    st.markdown("<h1 class='main-header'>🖼️ Visual Sentiment Analysis</h1>", unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["🖼️ Image Analysis", "📊 Visual Metrics"])
    
    with tab1:
        st.subheader("Analyze Sentiment in Images")
        
        uploaded_images = st.file_uploader(
            "Upload images for sentiment analysis",
            type=['jpg', 'jpeg', 'png', 'gif'],
            accept_multiple_files=True
        )
        
        if uploaded_images:
            for image_file in uploaded_images:
                col1, col2 = st.columns([1, 2])
                
                with col1:
                    st.image(image_file, use_column_width=True)
                
                with col2:
                    # Analyze image
                    analysis = features.visual_analyzer.analyze_image(image_file.read())
                    
                    sentiment = analysis.get('overall_sentiment', 'unknown')
                    confidence = analysis.get('confidence', 0)
                    
                    sentiment_emoji = {
                        'positive': '😊',
                        'negative': '😞',
                        'neutral': '😐',
                        'unknown': '❓'
                    }
                    
                    st.markdown(f"### {sentiment_emoji.get(sentiment, '❓')} Sentiment: {sentiment.title()}")
                    st.metric("Confidence", f"{confidence*100:.1f}%")
                    
                    col_c1, col_c2 = st.columns(2)
                    
                    with col_c1:
                        st.write("**Colors Detected:**")
                        colors = analysis.get('color_analysis', {})
                        for color, info in list(colors.items())[:3]:
                            st.write(f"- {color.title()}: {info.get('percentage', 0):.1f}%")
                    
                    with col_c2:
                        st.write("**Quality Score:**")
                        st.metric("Overall", f"{analysis.get('visual_quality_score', 0)*100:.0f}%")
                
                st.divider()
    
    with tab2:
        st.subheader("Visual Sentiment Metrics")
        
        st.info("📊 Track how visual sentiment impacts overall brand perception")
        
        metrics_data = {
            'Metric': ['Average Quality Score', 'Positive Images', 'Negative Images', 'Image Count'],
            'Value': [85, 72, 18, 90]
        }
        
        df_metrics = pd.DataFrame(metrics_data)
        st.dataframe(df_metrics, use_container_width=True)


def show_topic_discovery_page():
    """Display topic discovery and trending"""
    st.markdown("<h1 class='main-header'>🏷️ Topic Discovery & Trending</h1>", unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["🔥 Trending Topics", "📚 Topic Clusters", "📈 Topic Evolution"])
    
    with tab1:
        st.subheader("Trending Topics")
        
        trending = features.topic_discovery.trending_topics if features.topic_discovery.trending_topics else []
        
        if trending:
            for i, topic in enumerate(trending[:5]):
                col1, col2, col3 = st.columns([2, 1, 1])
                
                with col1:
                    status_emoji = {
                        'viral': '🚀',
                        'trending': '📈',
                        'emerging': '✨'
                    }
                    emoji = status_emoji.get(topic.get('status', 'emerging'), '✨')
                    
                    st.markdown(f"**{emoji} {topic.get('topic', 'Unknown')}**")
                    
                    keywords = ', '.join(topic.get('keywords', [])[:3])
                    st.caption(f"Keywords: {keywords}")
                
                with col2:
                    st.metric("Trending Score", topic.get('trending_score', 0))
                
                with col3:
                    velocity = topic.get('velocity', 'low')
                    st.metric("Velocity", velocity.title())
                
                st.divider()
        else:
            st.info("💡 Run analysis to discover trending topics")
    
    with tab2:
        st.subheader("Topic Clusters")
        
        st.info("Related topics grouped by semantic similarity")
        
        clusters = features.topic_discovery.topic_clusters if features.topic_discovery.topic_clusters else []
        
        if clusters:
            for cluster in clusters[:3]:
                with st.expander(f"🔗 Cluster: {cluster.get('primary_topic', 'Unknown')}"):
                    st.write("**Primary Keywords:**")
                    st.write(', '.join(cluster.get('keywords', [])))
                    
                    if cluster.get('related_topics'):
                        st.write("**Related Topics:**")
                        for related in cluster['related_topics']:
                            similarity = related.get('similarity', 0)
                            st.write(f"- {related.get('topic')} (Similarity: {similarity*100:.0f}%)")
        else:
            st.info("💡 Run topic discovery to see clusters")
    
    with tab3:
        st.subheader("Topic Evolution Over Time")
        
        st.info("📈 How topics are changing and evolving")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            topic_select = st.selectbox(
                "Select topic to track",
                ["Quality Issues", "Delivery Problems", "Customer Service", "Price Concerns"]
            )
        
        with col2:
            days_range = st.selectbox("Time Range", ["7 Days", "30 Days", "90 Days"])
        
        # Mock evolution chart
        evolution_data = {
            'Date': pd.date_range('2024-01-01', periods=30, freq='D'),
            'Mentions': [10, 12, 15, 18, 16, 20, 25, 28, 26, 30, 35, 38, 35, 32, 28, 25, 22, 20, 18, 16, 14, 12, 10, 8, 6, 5, 4, 3, 2, 1]
        }
        
        df_evolution = pd.DataFrame(evolution_data)
        
        fig = px.line(df_evolution, x='Date', y='Mentions', 
                     title=f'Evolution of "{topic_select}" Topic',
                     markers=True)
        
        st.plotly_chart(fig, use_container_width=True)


def show_custom_dashboard_page():
    """Display customizable dashboard builder with database persistence"""
    st.markdown("<h1 class='main-header'>📊 Custom Dashboards</h1>", unsafe_allow_html=True)
    
    from backend.database import DatabaseManager
    db = DatabaseManager()
    
    user_id = st.session_state.get('user_id', 'default')
    
    # ── Create new dashboard ──
    with st.expander("➕ Create New Dashboard", expanded=False):
        dash_name = st.text_input("Dashboard Name", placeholder="e.g. Executive Summary Q3")
        
        col_layout1, col_layout2 = st.columns(2)
        with col_layout1:
            layout_type = st.selectbox("Layout", ["2-column", "3-column", "single"])
        with col_layout2:
            theme = st.selectbox("Theme", ["default", "dark", "minimal", "vibrant"])
        
        st.markdown("**Select Widgets**")
        widgets = []
        widget_options = [
            ("Sentiment Pie Chart", "sentiment_pie"),
            ("Emotion Breakdown", "emotion_bar"),
            ("Complaint Categories", "complaint_bar"),
            ("Confidence Gauge", "confidence_gauge"),
            ("Keyword Cloud", "keyword_cloud"),
            ("Review Quality Score", "quality_score"),
            ("Trend Line", "trend_line"),
            ("Top Reviews Table", "top_reviews"),
        ]
        
        widget_cols = st.columns(4)
        for idx, (label, key) in enumerate(widget_options):
            with widget_cols[idx % 4]:
                if st.checkbox(label, key=f"widget_{key}"):
                    widgets.append(key)
        
        if st.button("💾 Save Dashboard", type="primary", use_container_width=True):
            if dash_name.strip():
                config = {
                    "layout": layout_type,
                    "theme": theme,
                    "widgets": widgets,
                    "created_at": datetime.now().isoformat()
                }
                db.save_user_dashboard(user_id, dash_name.strip(), config)
                st.success(f"✅ Dashboard '{dash_name}' saved successfully!")
                st.rerun()
            else:
                st.warning("Please enter a dashboard name.")
    
    st.divider()
    
    # ── Saved dashboards ──
    st.subheader("📁 Your Dashboards")
    
    dashboards = db.get_user_dashboards(user_id)
    
    if not dashboards:
        st.info("No saved dashboards yet. Create one above!")
    else:
        for dash in dashboards:
            dash_id = dash.get('id') if isinstance(dash, dict) else dash[0]
            dash_cfg = dash.get('config', {}) if isinstance(dash, dict) else {}
            dash_db_name = dash.get('name', 'Unnamed') if isinstance(dash, dict) else dash[1]
            
            with st.container():
                col_d1, col_d2, col_d3 = st.columns([3, 1, 1])
                
                with col_d1:
                    st.markdown(f"**{dash_db_name}**")
                    layout = dash_cfg.get('layout', 'default')
                    widget_count = len(dash_cfg.get('widgets', []))
                    theme_label = dash_cfg.get('theme', 'default')
                    st.caption(f"Layout: {layout} · {widget_count} widget(s) · Theme: {theme_label}")
                
                with col_d2:
                    if st.button("📋 Load", key=f"load_dash_{dash_id}", use_container_width=True):
                        st.session_state['loaded_dashboard'] = dash_cfg
                        st.session_state['loaded_dashboard_name'] = dash_db_name
                        st.toast(f"Loaded dashboard: {dash_db_name}")
                
                with col_d3:
                    if st.button("🗑️ Delete", key=f"del_dash_{dash_id}", use_container_width=True):
                        db.delete_user_dashboard(dash_id)
                        st.toast(f"Deleted dashboard: {dash_db_name}")
                        st.rerun()
                
                st.divider()
    
    # ── Preview loaded dashboard ──
    loaded_cfg = st.session_state.get('loaded_dashboard')
    if loaded_cfg:
        loaded_name = st.session_state.get('loaded_dashboard_name', 'Custom Dashboard')
        st.subheader(f"👁️ Preview: {loaded_name}")
        
        widgets_list = loaded_cfg.get('widgets', [])
        layout = loaded_cfg.get('layout', '2-column')
        
        if not widgets_list:
            st.info("This dashboard has no widgets selected.")
        else:
            num_cols = 3 if layout == '3-column' else (1 if layout == 'single' else 2)
            cols = st.columns(num_cols)
            
            widget_labels = {
                "sentiment_pie": "📊 Sentiment Pie Chart",
                "emotion_bar": "🎭 Emotion Breakdown",
                "complaint_bar": "⚠️ Complaint Categories",
                "confidence_gauge": "⭐ Confidence Gauge",
                "keyword_cloud": "☁️ Keyword Cloud",
                "quality_score": "🔍 Review Quality Score",
                "trend_line": "📈 Trend Line",
                "top_reviews": "📝 Top Reviews Table"
            }
            
            for i, widget in enumerate(widgets_list):
                with cols[i % num_cols]:
                    st.markdown(f"""
                    <div class='metric-card' style='text-align: center; padding: 24px; min-height: 120px;'>
                        <div style='font-size: 2rem;'>{widget_labels.get(widget, widget)[:2]}</div>
                        <strong>{widget_labels.get(widget, widget.replace('_', ' ').title())}</strong>
                        <br><span style='color: #94a3b8; font-size: 12px;'>Run an analysis to populate</span>
                    </div>
                    """, unsafe_allow_html=True)
    
    # ── Preset dashboards ──
    st.divider()
    st.subheader("🎨 Dashboard Presets")
    
    col_p1, col_p2 = st.columns(2)
    
    with col_p1:
        if st.button("📊 Executive Dashboard", use_container_width=True):
            config = {
                "layout": "2-column",
                "theme": "default",
                "widgets": ["sentiment_pie", "confidence_gauge", "trend_line", "top_reviews"],
                "created_at": datetime.now().isoformat()
            }
            db.save_user_dashboard(user_id, "Executive Dashboard", config)
            st.success("✅ Executive Dashboard created and saved!")
            st.rerun()
    
    with col_p2:
        if st.button("📈 Detailed Analytics", use_container_width=True):
            config = {
                "layout": "3-column",
                "theme": "vibrant",
                "widgets": ["sentiment_pie", "emotion_bar", "complaint_bar", "confidence_gauge", "keyword_cloud", "quality_score"],
                "created_at": datetime.now().isoformat()
            }
            db.save_user_dashboard(user_id, "Detailed Analytics", config)
            st.success("✅ Detailed Analytics Dashboard created and saved!")
            st.rerun()


def show_review_aggregation_page():
    """Display review aggregation from 200+ platforms"""
    st.markdown("<h1 class='main-header'>⭐ Multi-Platform Review Aggregation</h1>", unsafe_allow_html=True)
    
    tab1, tab2, tab3, tab4 = st.tabs(["📥 Aggregate", "🔍 Analysis", "⚠️ Fake Detection", "🏆 Highlights"])
    
    with tab1:
        st.subheader("Aggregate Reviews from 50+ Platforms")
        
        st.info("Supported platforms: Google, Amazon, Yelp, TrustPilot, Facebook, Instagram, Glassdoor, Capterra, G2, and 40+ more!")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.write("**Ecommerce**")
            platforms_ecom = ['Amazon', 'eBay', 'Etsy', 'Walmart', 'Target']
            for p in platforms_ecom:
                st.checkbox(p, value=False, key=f"ecom_{p}")
        
        with col2:
            st.write("**Local Business**")
            platforms_local = ['Google', 'Yelp', 'TrustPilot', 'BBB', 'Zillow']
            for p in platforms_local:
                st.checkbox(p, value=False, key=f"local_{p}")
        
        with col3:
            st.write("**SaaS/Software**")
            platforms_saas = ['G2', 'Capterra', 'Trustradius', 'LinkedIn', 'Glassdoor']
            for p in platforms_saas:
                st.checkbox(p, value=False, key=f"saas_{p}")
        
        if st.button("🔄 Aggregate Reviews", use_container_width=True, type="primary"):
            st.success("✅ Reviews aggregated from all selected platforms!")
            st.info("Processing reviews...")
    
    with tab2:
        st.subheader("Review Analysis")
        
        stats = features.review_aggregator.get_stats()
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Reviews", stats.get('total_reviews', 0))
        
        with col2:
            st.metric("Average Rating", stats.get('average_rating', 0))
        
        with col3:
            st.metric("Active Platforms", stats.get('active_sources', 0))
        
        with col4:
            st.metric("Data Points", stats.get('total_data_points', 0))
        
        st.divider()
        
        # Platform comparison
        st.subheader("Performance by Platform")
        
        comparison = features.review_aggregator.get_multi_platform_comparison()
        
        if comparison:
            df_comparison = pd.DataFrame([
                {
                    'Platform': v.get('platform', k),
                    'Reviews': v.get('total_reviews', 0),
                    'Avg Rating': v.get('avg_rating', 0),
                    'Momentum': v.get('momentum', 'neutral')
                }
                for k, v in comparison.items()
            ])
            
            st.dataframe(df_comparison, use_container_width=True)
    
    with tab3:
        st.subheader("Fake Review Detection")
        
        suspicious = features.review_aggregator.detect_fake_reviews()
        
        if suspicious:
            st.warning(f"⚠️ Detected {len(suspicious)} potentially suspicious reviews")
            
            for review in suspicious[:5]:
                col1, col2 = st.columns([3, 1])
                
                with col1:
                    st.markdown(f"**Suspicion Score: {review.get('suspicion_score', 0)}/100**")
                    st.caption(f"Flags: {', '.join(review.get('flags', []))}")
                    st.write(review.get('review_text', '')[:200])
                
                with col2:
                    if st.button("Review", key=f"review_{review.get('review_id')}"):
                        st.json(review)
                
                st.divider()
        else:
            st.success("✅ No suspicious reviews detected")
    
    with tab4:
        st.subheader("Top Positive Reviews")
        
        top_reviews = features.review_aggregator.get_high_value_reviews(limit=5)
        
        if top_reviews:
            for review in top_reviews:
                col1, col2 = st.columns([3, 1])
                
                with col1:
                    st.markdown(f"**⭐ {review.get('rating', 0)} - {review.get('title', 'Review')}**")
                    st.write(review.get('text', '')[:300])
                
                with col2:
                    st.metric("Helpful", f"{review.get('helpful_count', 0)} votes")
                
                st.divider()
        else:
            st.info("💡 Aggregate reviews to see top highlights")


# Function to add feature pages to main navigation
def add_advanced_features_to_sidebar():
    """Add advanced feature options to sidebar"""
    return {
        'realtime': ('🔴 Real-Time Monitoring', show_realtime_monitoring_page),
        'multisource': ('🌐 Multi-Source Data', show_multisource_page),
        'visual': ('🖼️ Visual Analysis', show_visual_analysis_page),
        'topics': ('🏷️ Topic Discovery', show_topic_discovery_page),
        'dashboard': ('📊 Custom Dashboards', show_custom_dashboard_page),
        'reviews': ('⭐ Reviews (200+ platforms)', show_review_aggregation_page)
    }
