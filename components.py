import streamlit as st
from datetime import datetime

class UIComponents:
    @staticmethod
    def sentiment_badge(sentiment: str, confidence: float = None):
        """Display sentiment with color-coded badge"""
        colors = {
            'Positive': ('green', '#22c55e'),
            'Negative': ('red', '#ef4444'),
            'Neutral': ('gray', '#6b7280')
        }
        
        color_name, hex_color = colors.get(sentiment, ('blue', '#0ea5e9'))
        
        if confidence:
            st.markdown(
                f'<span style="background-color: {hex_color}; color: white; padding: 5px 10px; '
                f'border-radius: 5px; font-weight: bold;">{sentiment} ({confidence}%)</span>',
                unsafe_allow_html=True
            )
        else:
            st.markdown(
                f'<span style="background-color: {hex_color}; color: white; padding: 5px 10px; '
                f'border-radius: 5px; font-weight: bold;">{sentiment}</span>',
                unsafe_allow_html=True
            )
    
    @staticmethod
    def metric_card(label: str, value: str, icon: str = "📊"):
        """Display metric card"""
        st.markdown(f"""
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 10px; margin: 10px 0;">
                <p style="font-size: 14px; color: #6b7280; margin: 0;">{icon} {label}</p>
                <p style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 5px 0;">{value}</p>
            </div>
        """, unsafe_allow_html=True)
    
    @staticmethod
    def stat_columns(stats: dict):
        """Display stats in columns"""
        cols = st.columns(len(stats))
        for col, (label, value) in zip(cols, stats.items()):
            with col:
                UIComponents.metric_card(label, str(value))
    
    @staticmethod
    def results_table(results: list, columns: list = None):
        """Display results in table format"""
        if columns is None:
            columns = ['text', 'sentiment', 'confidence', 'emotion', 'date']
        
        df = st.dataframe(
            pd.DataFrame(results)[columns],
            use_container_width=True,
            height=400
        )
        return df
    
    @staticmethod
    def expandable_review(text: str, sentiment: str, confidence: float, emotion: str = None):
        """Display review with expandable detail"""
        colors = {
            'Positive': '#22c55e',
            'Negative': '#ef4444',
            'Neutral': '#6b7280'
        }
        
        color = colors.get(sentiment, '#0ea5e9')
        
        with st.expander(f"📝 {text[:60]}..." if len(text) > 60 else f"📝 {text}"):
            st.markdown(f"**Sentiment:** <span style='color: {color}; font-weight: bold;'>{sentiment}</span>", 
                       unsafe_allow_html=True)
            st.markdown(f"**Confidence:** {confidence}%")
            if emotion:
                st.markdown(f"**Emotion:** {emotion}")
            st.markdown(f"**Full Text:** {text}")
    
    @staticmethod
    def empty_state(icon: str = "📭", message: str = "No data available"):
        """Display empty state"""
        st.markdown(f"""
            <div style="text-align: center; padding: 50px;">
                <p style="font-size: 40px;">{icon}</p>
                <p style="font-size: 18px; color: #6b7280;">{message}</p>
            </div>
        """, unsafe_allow_html=True)
    
    @staticmethod
    def success_message(message: str):
        """Display success message"""
        st.success(message)
    
    @staticmethod
    def error_message(message: str):
        """Display error message"""
        st.error(message)
    
    @staticmethod
    def warning_message(message: str):
        """Display warning message"""
        st.warning(message)
    
    @staticmethod
    def info_message(message: str):
        """Display info message"""
        st.info(message)


def display_sentiment_stats(summary: dict):
    """Display sentiment statistics"""
    if not summary:
        UIComponents.empty_state("📊", "No analysis results available")
        return
    
    sent_dist = summary.get('sentiment_distribution', {})
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Analyzed", summary.get('total_entries', 0))
    
    with col2:
        positive = sent_dist.get('Positive', {}).get('percentage', 0)
        st.metric("Positive %", f"{positive}%", delta=f"+{positive}%")
    
    with col3:
        negative = sent_dist.get('Negative', {}).get('percentage', 0)
        st.metric("Negative %", f"{negative}%")
    
    with col4:
        confidence = summary.get('avg_confidence', 0)
        st.metric("Avg Confidence", f"{confidence}%")


import pandas as pd

def display_insights(summary: dict):
    """Display key insights"""
    if not summary or not summary.get('key_insights'):
        return
    
    st.subheader("💡 Key Insights")
    
    for insight in summary['key_insights']:
        st.write(f"• {insight}")


def display_top_reviews(summary: dict):
    """Display top positive and negative reviews"""
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("👍 Top Positive Reviews")
        if summary.get('top_positive_reviews'):
            for review in summary['top_positive_reviews']:
                st.success(review[:100] + "..." if len(review) > 100 else review)
        else:
            st.info("No positive reviews")
    
    with col2:
        st.subheader("👎 Top Negative Reviews")
        if summary.get('top_negative_reviews'):
            for review in summary['top_negative_reviews']:
                st.error(review[:100] + "..." if len(review) > 100 else review)
        else:
            st.info("No negative reviews")
