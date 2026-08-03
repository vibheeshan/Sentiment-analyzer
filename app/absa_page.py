import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from backend.database import DatabaseManager
from backend.aspect_sentiment import get_aspect_sentiment_analyzer

def show_absa_page():
    """Display Aspect-Based Sentiment Analysis dashboard"""
    st.markdown("<h1 class='main-header'>🎯 Aspect-Based Sentiment (ABSA)</h1>", unsafe_allow_html=True)
    st.markdown("<p style='color: #64748b;'>Categorize and evaluate customer sentiment on specific product attributes (Price, Quality, Delivery, Customer Service, Design, Performance).</p>", unsafe_allow_html=True)
    
    db = DatabaseManager()
    analyses = db.get_user_analyses(st.session_state.user_id)
    
    if not analyses:
        st.warning("⚠️ No analyses found. Run an analysis first to inspect aspect sentiment!")
        if st.button("➕ Create New Analysis"):
            st.session_state.current_page = 'analysis'
            st.rerun()
        return

    analysis_names = {a['id']: a['name'] for a in analyses}
    selected_id = st.selectbox(
        "Select Analysis to Inspect",
        options=list(analysis_names.keys()),
        format_func=lambda x: analysis_names[x],
        key="absa_analysis_select"
    )
    
    st.divider()
    
    entries = db.get_analysis_entries(selected_id)
    if not entries:
        st.info("No entries found for this analysis.")
        return

    texts = [dict(e).get('text', '') for e in entries if dict(e).get('text')]
    
    with st.spinner("🔍 Slicing text and evaluating aspect sentiment..."):
        absa_analyzer = get_aspect_sentiment_analyzer()
        aggregated = absa_analyzer.aggregate_analysis(texts)

    # Convert aggregated data to dataframe
    table_data = []
    heatmap_data = []
    
    for aspect, data in aggregated.items():
        total_mentions = data['mention_count']
        pos = data['Positive']
        neg = data['Negative']
        neu = data['Neutral']
        
        pos_pct = round((pos / max(total_mentions, 1)) * 100, 1) if total_mentions > 0 else 0
        neg_pct = round((neg / max(total_mentions, 1)) * 100, 1) if total_mentions > 0 else 0
        neu_pct = round((neu / max(total_mentions, 1)) * 100, 1) if total_mentions > 0 else 0
        
        table_data.append({
            'Aspect': aspect.replace('_', ' ').title(),
            'Mentions': total_mentions,
            'Positive %': pos_pct,
            'Negative %': neg_pct,
            'Neutral %': neu_pct,
            'Avg Confidence %': data['avg_confidence']
        })
        
        heatmap_data.append({
            'Aspect': aspect.replace('_', ' ').title(),
            'Positive': pos,
            'Negative': neg,
            'Neutral': neu
        })
        
    df_table = pd.DataFrame(table_data)
    
    # Overview Metrics
    active_aspects = sum(1 for d in table_data if d['Mentions'] > 0)
    total_aspect_mentions = sum(d['Mentions'] for d in table_data)
    best_aspect = max(table_data, key=lambda x: x['Positive %'] if x['Mentions'] > 0 else -1)
    worst_aspect = max(table_data, key=lambda x: x['Negative %'] if x['Mentions'] > 0 else -1)
    
    col_m1, col_m2, col_m3, col_m4 = st.columns(4)
    with col_m1:
        st.metric("Tracked Aspects", f"{active_aspects} / {len(table_data)}")
    with col_m2:
        st.metric("Total Aspect Mentions", total_aspect_mentions)
    with col_m3:
        st.metric("Top Rated Aspect", best_aspect['Aspect'] if best_aspect['Mentions'] > 0 else "N/A", 
                  delta=f"{best_aspect['Positive %']}% Pos" if best_aspect['Mentions'] > 0 else None)
    with col_m4:
        st.metric("Most Criticized Aspect", worst_aspect['Aspect'] if worst_aspect['Mentions'] > 0 else "N/A", 
                  delta=f"{worst_aspect['Negative %']}% Neg" if worst_aspect['Mentions'] > 0 else None,
                  delta_color="inverse")
        
    st.divider()
    
    # Visualization Section
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        st.subheader("📊 Aspect Mention Volume & Sentiment")
        df_plot = pd.DataFrame(heatmap_data).melt(id_vars=['Aspect'], var_name='Sentiment', value_name='Count')
        fig_bar = px.bar(
            df_plot,
            x='Aspect',
            y='Count',
            color='Sentiment',
            title="Mentions per Aspect Category",
            color_discrete_map={'Positive': '#10B981', 'Negative': '#EF4444', 'Neutral': '#6B7280'}
        )
        st.plotly_chart(fig_bar, use_container_width=True, key="absa_bar_chart")
        
    with col_chart2:
        st.subheader("🔥 Sentiment Heatmap Matrix")
        df_matrix = pd.DataFrame(table_data).set_index('Aspect')[['Positive %', 'Negative %', 'Neutral %']]
        fig_heat = px.imshow(
            df_matrix,
            labels=dict(x="Sentiment", y="Aspect", color="Percentage (%)"),
            x=['Positive %', 'Negative %', 'Neutral %'],
            y=df_matrix.index,
            color_continuous_scale='RdYlGn',
            text_auto=True
        )
        st.plotly_chart(fig_heat, use_container_width=True, key="absa_heatmap")
        
    st.subheader("📋 Aspect Scorecard Table")
    st.dataframe(df_table, use_container_width=True)
