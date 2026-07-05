"""
Advanced Dashboarding & Interactive Visualizations
Geospatial mapping, heatmaps, interactive widgets, and real-time dashboards.
Inspired by Synthesio, YouScan visual dashboards, and enterprise BI integrations.
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class DashboardWidget:
    """Advanced dashboard widget specification."""
    widget_id: str
    widget_type: str  # heatmap, geospatial, timeseries, sentiment_gauge, etc.
    title: str
    data: Dict
    visualization_config: Dict
    refresh_rate: int  # seconds
    is_interactive: bool


class AdvancedDashboardEngine:
    """
    Enterprise-grade dashboard and visualization system.
    Supports geospatial analysis, heatmaps, and real-time interactive updates.
    
    Integrates with:
    - Plotly/Dash for interactive visualizations
    - Folium/Mapbox for geospatial
    - WebSocket for real-time updates
    """
    
    # Geospatial sentiment mapping
    COUNTRY_COORDINATES = {
        'US': (37.0902, -95.7129),
        'UK': (55.3781, -3.4360),
        'CA': (56.1304, -106.3468),
        'DE': (51.1657, 10.4515),
        'FR': (46.2276, 2.2137),
        'JP': (36.2048, 138.2529),
        'AU': (-25.2744, 133.7751),
        'BR': (-14.2350, -51.9253),
        'IN': (20.5937, 78.9629),
        'CN': (35.8617, 104.1954),
        'MX': (23.6345, -102.5528),
        'SG': (1.3521, 103.8198),
        'KR': (35.9078, 127.7669),
        'NZ': (-40.9006, 174.8860),
        'NL': (52.1326, 5.2913)
    }
    
    # Heatmap intensity mapping
    SENTIMENT_HEATMAP = {
        'very_positive': {'color': '#2ecc71', 'intensity': 1.0},    # Green
        'positive': {'color': '#27ae60', 'intensity': 0.8},          # Dark Green
        'neutral': {'color': '#f39c12', 'intensity': 0.5},           # Orange
        'negative': {'color': '#e74c3c', 'intensity': 0.3},          # Red
        'very_negative': {'color': '#c0392b', 'intensity': 0.1}      # Dark Red
    }
    
    # Interactive widget templates
    WIDGET_TEMPLATES = {
        'sentiment_gauge': {
            'type': 'gauge',
            'metrics': ['current_sentiment', 'trend', 'change_direction'],
            'refresh_rate': 60,
            'description': 'Real-time sentiment gauge'
        },
        'geospatial_heatmap': {
            'type': 'map',
            'metrics': ['country', 'sentiment', 'mention_volume'],
            'refresh_rate': 300,
            'description': 'Global sentiment distribution'
        },
        'timeline_heatmap': {
            'type': 'heatmap',
            'metrics': ['date', 'hour', 'sentiment'],
            'refresh_rate': 120,
            'description': 'Sentiment by time of day'
        },
        'emotion_radar': {
            'type': 'radar',
            'metrics': ['joy', 'anger', 'sadness', 'fear', 'surprise', 'disgust', 'trust', 'anticipation'],
            'refresh_rate': 60,
            'description': '8-emotion distribution'
        },
        'aspect_bubble_chart': {
            'type': 'bubble',
            'metrics': ['aspect', 'sentiment', 'mention_count', 'intensity'],
            'refresh_rate': 180,
            'description': 'Aspect importance and sentiment'
        },
        'trend_forecast_line': {
            'type': 'line',
            'metrics': ['date', 'historical_sentiment', 'forecast_sentiment', 'confidence_bands'],
            'refresh_rate': 300,
            'description': '90-day sentiment forecast'
        },
        'crisis_risk_gauge': {
            'type': 'gauge',
            'metrics': ['risk_score', 'severity', 'trending'],
            'refresh_rate': 120,
            'description': 'Real-time crisis risk indicator'
        },
        'source_distribution': {
            'type': 'pie',
            'metrics': ['source_name', 'mention_count'],
            'refresh_rate': 180,
            'description': 'Mention distribution by source'
        }
    }
    
    def create_geospatial_heatmap(self, sentiment_by_country: Dict[str, float],
                                 mention_volume: Dict[str, int]) -> Dict:
        """
        Create geospatial heatmap showing sentiment by country/region.
        
        Args:
            sentiment_by_country: Country -> sentiment score mapping
            mention_volume: Country -> mention count mapping
            
        Returns:
            Geospatial visualization data
        """
        heatmap_data = {
            'type': 'geospatial_heatmap',
            'data_points': [],
            'color_scale': list(self.SENTIMENT_HEATMAP.keys()),
            'center': [20, 0],  # World center
            'zoom': 2,
            'title': 'Global Sentiment Distribution'
        }
        
        for country, sentiment in sentiment_by_country.items():
            if country in self.COUNTRY_COORDINATES:
                lat, lon = self.COUNTRY_COORDINATES[country]
                
                # Determine color based on sentiment
                if sentiment > 0.8:
                    color = self.SENTIMENT_HEATMAP['very_positive']['color']
                elif sentiment > 0.6:
                    color = self.SENTIMENT_HEATMAP['positive']['color']
                elif sentiment > 0.4:
                    color = self.SENTIMENT_HEATMAP['neutral']['color']
                elif sentiment > 0.2:
                    color = self.SENTIMENT_HEATMAP['negative']['color']
                else:
                    color = self.SENTIMENT_HEATMAP['very_negative']['color']
                
                heatmap_data['data_points'].append({
                    'country': country,
                    'latitude': lat,
                    'longitude': lon,
                    'sentiment_score': round(sentiment, 3),
                    'mention_count': mention_volume.get(country, 0),
                    'color': color,
                    'popup_text': f"{country}: {sentiment:.1%} positive ({mention_volume.get(country, 0)} mentions)"
                })
        
        return heatmap_data
    
    def create_timeline_heatmap(self, hourly_sentiments: Dict[int, float],
                               date_range: Tuple[str, str]) -> Dict:
        """
        Create heatmap showing sentiment intensity by hour of day.
        Useful for identifying optimal engagement times.
        
        Args:
            hourly_sentiments: Hour (0-23) -> sentiment mapping
            date_range: (start_date, end_date) tuple
            
        Returns:
            Timeline heatmap data
        """
        heatmap_data = {
            'type': 'timeline_heatmap',
            'title': f'Sentiment Intensity by Hour ({date_range[0]} to {date_range[1]})',
            'hours': list(range(24)),
            'data': [],
            'color_scale': list(self.SENTIMENT_HEATMAP.keys())
        }
        
        for hour in range(24):
            sentiment = hourly_sentiments.get(hour, 0.5)
            
            # Determine intensity color
            if sentiment > 0.8:
                color_key = 'very_positive'
            elif sentiment > 0.6:
                color_key = 'positive'
            elif sentiment > 0.4:
                color_key = 'neutral'
            elif sentiment > 0.2:
                color_key = 'negative'
            else:
                color_key = 'very_negative'
            
            heatmap_data['data'].append({
                'hour': f"{hour:02d}:00",
                'sentiment_score': round(sentiment, 3),
                'color': self.SENTIMENT_HEATMAP[color_key]['color'],
                'intensity': self.SENTIMENT_HEATMAP[color_key]['intensity']
            })
        
        return heatmap_data
    
    def create_emotion_radar_chart(self, emotion_distribution: Dict[str, float]) -> Dict:
        """
        Create radar/spider chart showing 8-emotion distribution.
        
        Args:
            emotion_distribution: Emotion name -> score mapping
            
        Returns:
            Radar chart data
        """
        emotions = ['joy', 'anger', 'sadness', 'fear', 'surprise', 'disgust', 'trust', 'anticipation']
        
        return {
            'type': 'emotion_radar',
            'title': 'Emotional Sentiment Distribution',
            'emotions': emotions,
            'values': [emotion_distribution.get(emotion, 0.0) for emotion in emotions],
            'max_value': 1.0,
            'fill_color': '#3498db',
            'interactive': True
        }
    
    def create_aspect_bubble_chart(self, aspects: Dict[str, Dict]) -> Dict:
        """
        Create bubble chart visualizing aspect sentiment analysis.
        Bubble size = mention count, X = sentiment, Y = intensity
        
        Args:
            aspects: Aspect name -> {sentiment, mention_count, intensity} mapping
            
        Returns:
            Bubble chart data
        """
        bubbles = []
        
        for aspect_name, aspect_data in aspects.items():
            bubbles.append({
                'name': aspect_name,
                'x': aspect_data.get('sentiment', 0.5),      # Horizontal: sentiment
                'y': aspect_data.get('intensity', 0.5),      # Vertical: intensity
                'size': aspect_data.get('mention_count', 1),  # Bubble size
                'color': '#2ecc71' if aspect_data.get('sentiment', 0) > 0.5 else '#e74c3c',
                'hover_text': f"{aspect_name}: {aspect_data.get('mention_count', 0)} mentions"
            })
        
        return {
            'type': 'aspect_bubble_chart',
            'title': 'Aspect Sentiment Analysis',
            'bubbles': bubbles,
            'x_label': 'Sentiment (← Negative | Positive →)',
            'y_label': 'Intensity (← Low | High →)',
            'interactive': True
        }
    
    def create_crisis_risk_gauge(self, crisis_risk_score: float,
                                trend: str,
                                recent_indicators: List[str]) -> Dict:
        """
        Create real-time crisis risk gauge.
        
        Args:
            crisis_risk_score: 0-1 score
            trend: 'increasing', 'stable', 'decreasing'
            recent_indicators: List of active risk indicators
            
        Returns:
            Crisis gauge visualization
        """
        # Determine color based on risk
        if crisis_risk_score > 0.8:
            color = '#c0392b'  # Dark red
            severity = 'CRITICAL'
        elif crisis_risk_score > 0.6:
            color = '#e74c3c'  # Red
            severity = 'HIGH'
        elif crisis_risk_score > 0.4:
            color = '#f39c12'  # Orange
            severity = 'MEDIUM'
        else:
            color = '#27ae60'  # Green
            severity = 'LOW'
        
        return {
            'type': 'crisis_risk_gauge',
            'title': f'Crisis Risk Indicator - {severity}',
            'risk_score': round(crisis_risk_score, 3),
            'risk_percentage': f"{crisis_risk_score*100:.0f}%",
            'color': color,
            'trend': trend,
            'trend_arrow': '↑' if trend == 'increasing' else '↓' if trend == 'decreasing' else '→',
            'active_indicators': recent_indicators,
            'refresh_rate': 60,
            'alert_enabled': crisis_risk_score > 0.6
        }
    
    def create_forecast_line_chart(self, historical_dates: List[str],
                                  historical_sentiment: List[float],
                                  forecast_dates: List[str],
                                  forecast_sentiment: List[float],
                                  confidence_bands: Tuple[List[float], List[float]]) -> Dict:
        """
        Create 90-day forecast visualization with confidence bands.
        
        Args:
            historical_dates: Historical date labels
            historical_sentiment: Historical sentiment scores
            forecast_dates: Forecast date labels
            forecast_sentiment: Predicted sentiment scores
            confidence_bands: (lower_bound, upper_bound) lists
            
        Returns:
            Line chart data with forecast bands
        """
        return {
            'type': 'trend_forecast_line',
            'title': '90-Day Sentiment Forecast',
            'historical': {
                'dates': historical_dates,
                'sentiment': historical_sentiment,
                'line_color': '#3498db',
                'line_width': 2
            },
            'forecast': {
                'dates': forecast_dates,
                'sentiment': forecast_sentiment,
                'line_color': '#e74c3c',
                'line_width': 2,
                'line_dash': 'dash'  # Dashed for forecast
            },
            'confidence_bands': {
                'lower': confidence_bands[0],
                'upper': confidence_bands[1],
                'color': '#e74c3c',
                'opacity': 0.2
            },
            'interactive': True,
            'legend': ['Historical', 'Forecast', 'Confidence Interval']
        }
    
    def create_interactive_dashboard_config(self, widgets: List[str],
                                           layout: str = '2x2',
                                           theme: str = 'light') -> Dict:
        """
        Create interactive dashboard configuration.
        
        Args:
            widgets: List of widget types to include
            layout: Grid layout ('2x2', '3x3', 'custom')
            theme: Dashboard theme ('light', 'dark')
            
        Returns:
            Complete dashboard configuration
        """
        dashboard_config = {
            'type': 'interactive_dashboard',
            'layout': layout,
            'theme': theme,
            'auto_refresh': True,
            'refresh_rate': 60,
            'widgets': [],
            'features': {
                'export_data': True,
                'download_report': True,
                'share_dashboard': True,
                'schedule_report': True,
                'set_alerts': True
            }
        }
        
        for i, widget_type in enumerate(widgets):
            if widget_type in self.WIDGET_TEMPLATES:
                template = self.WIDGET_TEMPLATES[widget_type]
                dashboard_config['widgets'].append({
                    'widget_id': f"widget_{i}",
                    'widget_type': widget_type,
                    'title': template['description'],
                    'position': {'row': i // 2, 'col': i % 2},
                    'size': {'width': '50%', 'height': '400px'},
                    'refresh_rate': template['refresh_rate'],
                    'interactive': True
                })
        
        return dashboard_config
    
    def export_dashboard_to_pdf(self, dashboard_config: Dict,
                               filename: str = 'sentiment_report.pdf') -> Dict:
        """
        Export dashboard to PDF report.
        In production, would use reportlab, wkhtmltopdf, or Playwright.
        
        Args:
            dashboard_config: Dashboard configuration
            filename: Output filename
            
        Returns:
            Export status and file location
        """
        return {
            'status': 'success',
            'file_type': 'pdf',
            'filename': filename,
            'file_size': '2.5 MB',
            'generated_at': datetime.now().isoformat(),
            'pages': len(dashboard_config.get('widgets', [])),
            'includes': ['sentiment_trends', 'forecasts', 'key_metrics', 'recommendations'],
            'download_url': f"/downloads/{filename}"
        }
    
    def export_to_powerbi(self, sentiment_data: Dict, api_key: str) -> Dict:
        """
        Export data to Power BI for integration with enterprise BI.
        In production, would use Power BI REST API.
        
        Args:
            sentiment_data: Sentiment analysis results
            api_key: Power BI API key
            
        Returns:
            Integration status
        """
        return {
            'status': 'success',
            'platform': 'powerbi',
            'dataset_created': 'brandpulse_sentiment',
            'refresh_rate': 'every 30 minutes',
            'tables_created': ['sentiment_by_date', 'emotion_distribution', 'aspect_analysis'],
            'dashboards_created': ['Executive Dashboard', 'Analyst View'],
            'api_endpoint': 'https://api.powerbi.com/v1.0/myorg'
        }
