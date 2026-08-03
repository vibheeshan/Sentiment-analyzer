import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from backend.database import DatabaseManager

def show_competitor_benchmarking_page():
    """Display brand benchmarking page to compare multiple analyses side-by-side"""
    st.markdown("<h1 class='main-header'>🤼 Competitor Benchmarking</h1>", unsafe_allow_html=True)
    st.markdown("<p style='color: #64748b;'>Compare sentiment, emotion profiles, and review authenticity metrics across multiple brands or datasets.</p>", unsafe_allow_html=True)
    
    db = DatabaseManager()
    analyses = db.get_user_analyses(st.session_state.user_id)
    
    if not analyses or len(analyses) < 2:
        st.warning("⚠️ You need at least 2 analyses to run benchmarking. Go to the Analysis page to analyze another dataset first!")
        if st.button("➕ Create New Analysis"):
            st.session_state.current_page = 'analysis'
            st.rerun()
        return

    # Select analyses to compare — analyses may be sqlite3.Row objects
    analysis_names = {a['id']: a['name'] for a in analyses}
    
    selected_ids = st.multiselect(
        "Select Analyses to Compare",
        options=list(analysis_names.keys()),
        format_func=lambda x: analysis_names[x],
        default=list(analysis_names.keys())[:2]
    )
    
    if len(selected_ids) < 2:
        st.info("💡 Please select at least 2 analyses to compare.")
        return
        
    st.divider()
    
    # Extract data for comparison
    comparison_data = []
    
    for aid in selected_ids:
        raw_summary = db.get_analysis_summary(aid)
        name = analysis_names[aid]
        
        # Convert sqlite3.Row or None to plain dict
        if raw_summary is not None:
            summary = dict(raw_summary)
        else:
            # Recreate basic summary if it is missing
            entries = db.get_analysis_entries(aid)
            if entries:
                total = len(entries)
                pos = sum(1 for e in entries if e['sentiment'] == 'Positive')
                neg = sum(1 for e in entries if e['sentiment'] == 'Negative')
                neu = sum(1 for e in entries if e['sentiment'] == 'Neutral')
                conf = sum(float(e['confidence'] or 0) for e in entries) / max(total, 1)
                summary = {
                    'total_entries': total,
                    'positive_count': pos,
                    'negative_count': neg,
                    'neutral_count': neu,
                    'avg_confidence': conf,
                    'fake_reviews': 0
                }
            else:
                continue
                
        total = summary.get('total_entries', 0) or 1
        pos = summary.get('positive_count', 0) or 0
        neg = summary.get('negative_count', 0) or 0
        neu = summary.get('neutral_count', 0) or 0
        conf = summary.get('avg_confidence', 0.0) or 0.0
        fake = summary.get('fake_reviews', 0) or 0
        
        pos_pct = round((pos / total) * 100, 1)
        neg_pct = round((neg / total) * 100, 1)
        neu_pct = round((neu / total) * 100, 1)
        quality_score = round(100 - ((fake / total) * 100), 1)
        
        comparison_data.append({
            'id': aid,
            'Name': name,
            'Total': total,
            'Positive %': pos_pct,
            'Negative %': neg_pct,
            'Neutral %': neu_pct,
            'Avg Confidence %': round(conf, 1),
            'Quality Score %': max(0.0, min(100.0, quality_score))
        })
        
    df_comp = pd.DataFrame(comparison_data)
    
    if df_comp.empty:
        st.error("Could not load summary data for comparison.")
        return
        
    # ── Summary metrics table ──
    st.subheader("📋 Performance Scorecard")
    st.dataframe(df_comp.drop(columns=['id']), use_container_width=True)
    
    # ── Side-by-side distribution chart ──
    st.subheader("📊 Sentiment Comparison")
    
    plot_data = []
    for d in comparison_data:
        plot_data.append({'Brand': d['Name'], 'Sentiment': 'Positive', 'Percentage': d['Positive %']})
        plot_data.append({'Brand': d['Name'], 'Sentiment': 'Negative', 'Percentage': d['Negative %']})
        plot_data.append({'Brand': d['Name'], 'Sentiment': 'Neutral', 'Percentage': d['Neutral %']})
        
    df_plot = pd.DataFrame(plot_data)
    
    fig_bar = px.bar(
        df_plot,
        x='Brand',
        y='Percentage',
        color='Sentiment',
        barmode='group',
        color_discrete_map={'Positive': '#10B981', 'Negative': '#EF4444', 'Neutral': '#6B7280'},
        title="Sentiment Share by Brand"
    )
    fig_bar.update_layout(yaxis_title="Percentage (%)")
    st.plotly_chart(fig_bar, use_container_width=True, key="benchmark_bar")
    
    # ── Radar/Polar chart comparison ──
    st.subheader("🕸️ Dimension Radar Comparison")
    st.markdown("<p style='font-size: 12px; color: #64748b;'>Compare dimensions across multiple metrics. Outer values indicate stronger performance in that metric.</p>", unsafe_allow_html=True)
    
    categories = ['Positive Sentiment %', 'Avg Confidence %', 'Quality Score %']
    
    fig_radar = go.Figure()
    
    colors = ['#4F46E5', '#06B6D4', '#F59E0B', '#10B981', '#EC4899']
    
    for idx, d in enumerate(comparison_data):
        values = [d['Positive %'], d['Avg Confidence %'], d['Quality Score %']]
        # Close the loop
        values_radar = values + [values[0]]
        categories_radar = categories + [categories[0]]
        
        fig_radar.add_trace(go.Scatterpolar(
            r=values_radar,
            theta=categories_radar,
            fill='toself',
            name=d['Name'],
            line_color=colors[idx % len(colors)]
        ))
        
    fig_radar.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100]
            )
        ),
        showlegend=True,
        title="Key Performance Indicators Comparison"
    )
    
    st.plotly_chart(fig_radar, use_container_width=True, key="benchmark_radar")
    
    # ── Strategic take-aways panel ──
    st.subheader("💡 Strategic Takeaways")
    
    best_sentiment_brand = max(comparison_data, key=lambda x: x['Positive %'])
    best_quality_brand = max(comparison_data, key=lambda x: x['Quality Score %'])
    
    st.markdown(f"""
    <div class='alert-info' style='padding: 16px; border-radius: 8px; margin-top: 10px;'>
        📌 <strong>Sentiment Leader:</strong> <em>{best_sentiment_brand['Name']}</em> leads in brand perception with a positive score of <strong>{best_sentiment_brand['Positive %']}%</strong>.<br>
        📌 <strong>Quality Leader:</strong> <em>{best_quality_brand['Name']}</em> has the most authentic reviews with a quality score of <strong>{best_quality_brand['Quality Score %']}%</strong>.<br>
    </div>
    """, unsafe_allow_html=True)
