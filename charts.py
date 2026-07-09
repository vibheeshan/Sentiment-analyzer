import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
from collections import Counter
from typing import List, Dict

class ChartGenerator:
    @staticmethod
    def sentiment_distribution_pie(sentiment_counts: dict, title: str = "Sentiment Distribution") -> go.Figure:
        """Create pie chart for sentiment distribution"""
        labels = list(sentiment_counts.keys())
        values = list(sentiment_counts.values())
        
        colors = {
            'Positive': '#22c55e',
            'Negative': '#ef4444',
            'Neutral': '#6b7280'
        }
        color_list = [colors.get(label, '#0ea5e9') for label in labels]
        
        fig = go.Figure(data=[go.Pie(
            labels=labels,
            values=values,
            hole=.3,
            marker=dict(colors=color_list),
            textposition='inside',
            textinfo='label+percent'
        )])
        
        fig.update_layout(
            title=title,
            font=dict(size=12),
            showlegend=True,
            height=400
        )
        
        return fig
    
    @staticmethod
    def sentiment_trend_line(trend_data: list) -> go.Figure:
        """Create line chart for sentiment trends over time"""
        df = pd.DataFrame(trend_data)
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=df['date'],
            y=df['positive_percentage'],
            mode='lines+markers',
            name='Positive %',
            line=dict(color='#22c55e', width=3),
            marker=dict(size=8)
        ))
        
        fig.update_layout(
            title="Sentiment Trend Over Time",
            xaxis_title="Date",
            yaxis_title="Positive Sentiment (%)",
            hovermode='x unified',
            height=400,
            template='plotly_light'
        )
        
        return fig
    
    @staticmethod
    def sentiment_by_confidence(results: list) -> go.Figure:
        """Create scatter plot: sentiment vs confidence"""
        df = pd.DataFrame(results)
        
        sentiment_colors = {
            'Positive': '#22c55e',
            'Negative': '#ef4444',
            'Neutral': '#6b7280'
        }
        
        fig = go.Figure()
        
        for sentiment in ['Positive', 'Negative', 'Neutral']:
            mask = df['sentiment'] == sentiment
            fig.add_trace(go.Scatter(
                y=df[mask]['confidence'],
                name=sentiment,
                mode='markers',
                marker=dict(size=10, color=sentiment_colors.get(sentiment, '#0ea5e9')),
                text=df[mask]['text'],
                hovertemplate='<b>%{text}</b><br>Confidence: %{y}%<extra></extra>'
            ))
        
        fig.update_layout(
            title="Confidence Distribution by Sentiment",
            yaxis_title="Confidence Score (%)",
            height=400,
            showlegend=True,
            template='plotly_light'
        )
        
        return fig
    
    @staticmethod
    def word_cloud_bar(keywords: dict, top_n: int = 15) -> go.Figure:
        """Create bar chart for top keywords (word cloud alternative)"""
        sorted_keywords = sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:top_n]
        words = [k for k, v in sorted_keywords]
        counts = [v for k, v in sorted_keywords]
        
        fig = go.Figure(data=[
            go.Bar(
                x=counts,
                y=words,
                orientation='h',
                marker=dict(color='#0ea5e9'),
                text=counts,
                textposition='auto'
            )
        ])
        
        fig.update_layout(
            title=f"Top {top_n} Keywords",
            xaxis_title="Frequency",
            height=400,
            margin=dict(l=200),
            template='plotly_light'
        )
        
        return fig
    
    @staticmethod
    def emotion_distribution_bar(emotion_counts: dict) -> go.Figure:
        """Create bar chart for emotion distribution"""
        emotions = list(emotion_counts.keys())
        counts = list(emotion_counts.values())
        
        emotion_colors = {
            'joy': '#FFD700',
            'anger': '#FF4444',
            'sadness': '#4169E1',
            'surprise': '#FF69B4',
            'trust': '#32CD32'
        }
        
        colors = [emotion_colors.get(e.lower(), '#0ea5e9') for e in emotions]
        
        fig = go.Figure(data=[
            go.Bar(
                x=emotions,
                y=counts,
                marker=dict(color=colors),
                text=counts,
                textposition='auto'
            )
        ])
        
        fig.update_layout(
            title="Emotion Distribution",
            yaxis_title="Count",
            height=400,
            template='plotly_light'
        )
        
        return fig
    
    @staticmethod
    def sentiment_heatmap(entries_by_date: dict) -> go.Figure:
        """Create heatmap for sentiment intensity over time"""
        dates = []
        sentiment_values = []
        colors_list = []
        
        sentiment_score_map = {
            'Positive': 1,
            'Neutral': 0,
            'Negative': -1
        }
        
        for date, entries in sorted(entries_by_date.items()):
            dates.append(date)
            sentiments = [e.get('sentiment', 'Neutral') for e in entries]
            avg_score = sum(sentiment_score_map.get(s, 0) for s in sentiments) / len(sentiments)
            sentiment_values.append(avg_score)
        
        fig = go.Figure(data=go.Scatter(
            x=dates,
            y=[1] * len(dates),
            mode='markers',
            marker=dict(
                size=15,
                color=sentiment_values,
                colorscale='RdYlGn',
                showscale=True,
                colorbar=dict(title="Sentiment<br>Score")
            ),
            text=dates,
            hovertemplate='<b>%{text}</b><br>Sentiment Score: %{marker.color:.2f}<extra></extra>'
        ))
        
        fig.update_layout(
            title="Sentiment Heatmap Over Time",
            xaxis_title="Date",
            yaxis=dict(showticklabels=False),
            height=300,
            template='plotly_light'
        )
        
        return fig
    
    @staticmethod
    def comparison_bars(data1: dict, data2: dict, label1: str = "Set 1", label2: str = "Set 2") -> go.Figure:
        """Create side-by-side bar chart for comparison"""
        categories = list(set(list(data1.keys()) + list(data2.keys())))
        
        fig = go.Figure(data=[
            go.Bar(name=label1, x=categories, y=[data1.get(cat, 0) for cat in categories]),
            go.Bar(name=label2, x=categories, y=[data2.get(cat, 0) for cat in categories])
        ])
        
        fig.update_layout(
            title=f"{label1} vs {label2}",
            barmode='group',
            height=400,
            template='plotly_light'
        )
        
        return fig


def create_sentiment_pie(sentiment_data: dict):
    """Streamlit wrapper for pie chart"""
    chart_gen = ChartGenerator()
    fig = chart_gen.sentiment_distribution_pie(sentiment_data)
    st.plotly_chart(fig, use_container_width=True)

def create_trend_line(trend_data: list):
    """Streamlit wrapper for trend line"""
    chart_gen = ChartGenerator()
    fig = chart_gen.sentiment_trend_line(trend_data)
    st.plotly_chart(fig, use_container_width=True)

def create_word_cloud_bar(keywords: dict):
    """Streamlit wrapper for word cloud bar chart"""
    chart_gen = ChartGenerator()
    fig = chart_gen.word_cloud_bar(keywords)
    st.plotly_chart(fig, use_container_width=True)

def create_emotion_chart(emotion_counts: dict):
    """Streamlit wrapper for emotion chart"""
    chart_gen = ChartGenerator()
    fig = chart_gen.emotion_distribution_bar(emotion_counts)
    st.plotly_chart(fig, use_container_width=True)
