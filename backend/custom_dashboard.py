"""
Customizable Dashboard Module
Allows users to create and customize dashboard layouts and visualizations
"""

from typing import Dict, List, Optional
from datetime import datetime
from collections import defaultdict

class DashboardWidget:
    """Base class for dashboard widgets"""
    
    def __init__(self, widget_id: str, widget_type: str, title: str, position: Dict):
        self.widget_id = widget_id
        self.widget_type = widget_type
        self.title = title
        self.position = position  # {'row': 0, 'col': 0, 'width': 3, 'height': 2}
        self.config = {}
        self.data = None
        self.last_updated = None
    
    def set_config(self, config: Dict):
        """Set widget configuration"""
        self.config = config
    
    def update_data(self, data):
        """Update widget data"""
        self.data = data
        self.last_updated = datetime.now()
    
    def to_dict(self) -> Dict:
        """Serialize widget"""
        return {
            'widget_id': self.widget_id,
            'widget_type': self.widget_type,
            'title': self.title,
            'position': self.position,
            'config': self.config,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }


class SentimentGaugeWidget(DashboardWidget):
    """Widget showing overall sentiment percentage"""
    
    def __init__(self, widget_id: str, title: str = "Overall Sentiment", position: Dict = None):
        super().__init__(widget_id, 'sentiment_gauge', title, position or {'row': 0, 'col': 0, 'width': 2, 'height': 2})
        self.config = {
            'show_labels': True,
            'show_percentage': True,
            'color_scheme': 'default'
        }
    
    def render_data(self, sentiment_distribution: Dict) -> Dict:
        """Prepare data for rendering"""
        total = sum(sentiment_distribution.values())
        
        return {
            'positive': round(sentiment_distribution.get('Positive', 0) / total * 100, 1),
            'negative': round(sentiment_distribution.get('Negative', 0) / total * 100, 1),
            'neutral': round(sentiment_distribution.get('Neutral', 0) / total * 100, 1)
        }


class TrendChartWidget(DashboardWidget):
    """Widget showing sentiment trends over time"""
    
    def __init__(self, widget_id: str, title: str = "Sentiment Trends", position: Dict = None):
        super().__init__(widget_id, 'trend_chart', title, position or {'row': 0, 'col': 2, 'width': 4, 'height': 2})
        self.config = {
            'chart_type': 'line',
            'time_range': '7d',
            'show_grid': True,
            'show_legend': True
        }


class KeywordCloudWidget(DashboardWidget):
    """Widget showing word cloud of keywords"""
    
    def __init__(self, widget_id: str, title: str = "Top Keywords", position: Dict = None):
        super().__init__(widget_id, 'keyword_cloud', title, position or {'row': 2, 'col': 0, 'width': 3, 'height': 2})
        self.config = {
            'max_words': 50,
            'color_scheme': 'viridis'
        }


class AlertsWidget(DashboardWidget):
    """Widget showing real-time alerts"""
    
    def __init__(self, widget_id: str, title: str = "Real-Time Alerts", position: Dict = None):
        super().__init__(widget_id, 'alerts', title, position or {'row': 2, 'col': 3, 'width': 3, 'height': 2})
        self.config = {
            'alert_types': ['sentiment_spike', 'keyword_alert', 'crisis'],
            'max_alerts': 10,
            'sort_by': 'severity'
        }


class MetricsTableWidget(DashboardWidget):
    """Widget showing key metrics table"""
    
    def __init__(self, widget_id: str, title: str = "Key Metrics", position: Dict = None):
        super().__init__(widget_id, 'metrics_table', title, position or {'row': 0, 'col': 6, 'width': 2, 'height': 4})
        self.config = {
            'metrics': ['total_entries', 'avg_confidence', 'sentiment_distribution'],
            'show_sparklines': True
        }


class EmotionBreakdownWidget(DashboardWidget):
    """Widget showing emotion distribution"""
    
    def __init__(self, widget_id: str, title: str = "Emotion Analysis", position: Dict = None):
        super().__init__(widget_id, 'emotion_breakdown', title, position or {'row': 4, 'col': 0, 'width': 3, 'height': 2})
        self.config = {
            'chart_type': 'pie',
            'show_percentages': True
        }


class TopicsWidget(DashboardWidget):
    """Widget showing trending topics"""
    
    def __init__(self, widget_id: str, title: str = "Trending Topics", position: Dict = None):
        super().__init__(widget_id, 'topics', title, position or {'row': 4, 'col': 3, 'width': 5, 'height': 2})
        self.config = {
            'show_trending': True,
            'num_topics': 10,
            'sort_by': 'trending_score'
        }


class CustomDashboard:
    """
    Customizable dashboard that allows users to arrange widgets.
    """
    
    # Predefined widget types
    AVAILABLE_WIDGETS = {
        'sentiment_gauge': SentimentGaugeWidget,
        'trend_chart': TrendChartWidget,
        'keyword_cloud': KeywordCloudWidget,
        'alerts': AlertsWidget,
        'metrics_table': MetricsTableWidget,
        'emotion_breakdown': EmotionBreakdownWidget,
        'topics': TopicsWidget
    }
    
    def __init__(self, dashboard_id: str, name: str = "My Dashboard"):
        self.dashboard_id = dashboard_id
        self.name = name
        self.widgets: Dict[str, DashboardWidget] = {}
        self.layout_type = 'grid'  # grid, responsive, fixed
        self.grid_size = (8, 6)  # 8 columns, 6 rows
        self.theme = 'light'
        self.created_at = datetime.now()
        self.last_modified = datetime.now()
    
    def add_widget(self, widget: DashboardWidget):
        """Add widget to dashboard"""
        self.widgets[widget.widget_id] = widget
        self.last_modified = datetime.now()
    
    def remove_widget(self, widget_id: str):
        """Remove widget from dashboard"""
        if widget_id in self.widgets:
            del self.widgets[widget_id]
            self.last_modified = datetime.now()
    
    def create_widget(self, widget_type: str, widget_id: str, title: str, 
                     position: Dict = None) -> DashboardWidget:
        """Create and add a new widget"""
        if widget_type not in self.AVAILABLE_WIDGETS:
            raise ValueError(f"Unknown widget type: {widget_type}")
        
        widget_class = self.AVAILABLE_WIDGETS[widget_type]
        widget = widget_class(widget_id, title, position)
        self.add_widget(widget)
        
        return widget
    
    def get_widget(self, widget_id: str) -> Optional[DashboardWidget]:
        """Get widget by ID"""
        return self.widgets.get(widget_id)
    
    def update_widget_position(self, widget_id: str, position: Dict):
        """Update widget position"""
        if widget_id in self.widgets:
            self.widgets[widget_id].position = position
            self.last_modified = datetime.now()
    
    def update_widget_config(self, widget_id: str, config: Dict):
        """Update widget configuration"""
        if widget_id in self.widgets:
            self.widgets[widget_id].set_config(config)
            self.last_modified = datetime.now()
    
    def set_theme(self, theme: str):
        """Set dashboard theme (light, dark, custom)"""
        if theme in ['light', 'dark', 'custom']:
            self.theme = theme
            self.last_modified = datetime.now()
    
    def get_layout(self) -> List[Dict]:
        """Get dashboard layout with all widgets positioned"""
        layout = []
        
        for widget_id, widget in self.widgets.items():
            layout.append({
                'widget_id': widget_id,
                'widget_type': widget.widget_type,
                'title': widget.title,
                'position': widget.position,
                'config': widget.config
            })
        
        # Sort by position (row, then col)
        layout.sort(key=lambda x: (x['position']['row'], x['position']['col']))
        
        return layout
    
    def export_config(self) -> Dict:
        """Export dashboard configuration"""
        return {
            'dashboard_id': self.dashboard_id,
            'name': self.name,
            'layout_type': self.layout_type,
            'grid_size': self.grid_size,
            'theme': self.theme,
            'widgets': [w.to_dict() for w in self.widgets.values()],
            'created_at': self.created_at.isoformat(),
            'last_modified': self.last_modified.isoformat()
        }
    
    def import_config(self, config: Dict):
        """Import dashboard configuration"""
        self.name = config.get('name', self.name)
        self.layout_type = config.get('layout_type', self.layout_type)
        self.grid_size = tuple(config.get('grid_size', self.grid_size))
        self.theme = config.get('theme', self.theme)
        
        # Recreate widgets
        self.widgets.clear()
        for widget_config in config.get('widgets', []):
            widget_type = widget_config.get('widget_type')
            widget_id = widget_config.get('widget_id')
            title = widget_config.get('title')
            position = widget_config.get('position')
            
            if widget_type in self.AVAILABLE_WIDGETS:
                self.create_widget(widget_type, widget_id, title, position)


class DashboardManager:
    """Manages multiple dashboards for a user"""
    
    def __init__(self):
        self.dashboards: Dict[str, CustomDashboard] = {}
        self.default_dashboard = None
    
    def create_dashboard(self, dashboard_id: str, name: str = "My Dashboard") -> CustomDashboard:
        """Create a new dashboard"""
        dashboard = CustomDashboard(dashboard_id, name)
        self.dashboards[dashboard_id] = dashboard
        
        if not self.default_dashboard:
            self.default_dashboard = dashboard_id
        
        return dashboard
    
    def get_dashboard(self, dashboard_id: str) -> Optional[CustomDashboard]:
        """Get dashboard by ID"""
        return self.dashboards.get(dashboard_id)
    
    def list_dashboards(self) -> List[Dict]:
        """List all dashboards"""
        return [
            {
                'dashboard_id': d.dashboard_id,
                'name': d.name,
                'widget_count': len(d.widgets),
                'created_at': d.created_at.isoformat(),
                'last_modified': d.last_modified.isoformat()
            }
            for d in self.dashboards.values()
        ]
    
    def delete_dashboard(self, dashboard_id: str):
        """Delete a dashboard"""
        if dashboard_id in self.dashboards:
            del self.dashboards[dashboard_id]
            
            if self.default_dashboard == dashboard_id:
                self.default_dashboard = next(iter(self.dashboards.keys())) if self.dashboards else None
    
    def get_default_dashboard(self) -> Optional[CustomDashboard]:
        """Get user's default dashboard"""
        if self.default_dashboard:
            return self.dashboards.get(self.default_dashboard)
        return None
    
    def set_default_dashboard(self, dashboard_id: str):
        """Set default dashboard"""
        if dashboard_id in self.dashboards:
            self.default_dashboard = dashboard_id
    
    def create_preset_dashboard(self, preset_type: str) -> CustomDashboard:
        """
        Create a dashboard from a preset template.
        Preset types: 'executive', 'detailed', 'realtime', 'trend_analysis'
        """
        presets = {
            'executive': [
                ('sentiment_gauge', 'Overall Sentiment'),
                ('metrics_table', 'Key Metrics'),
                ('alerts', 'Critical Alerts')
            ],
            'detailed': [
                ('sentiment_gauge', 'Overall Sentiment'),
                ('trend_chart', 'Sentiment Trends'),
                ('keyword_cloud', 'Top Keywords'),
                ('emotion_breakdown', 'Emotion Analysis'),
                ('topics', 'Trending Topics'),
                ('alerts', 'Real-Time Alerts')
            ],
            'realtime': [
                ('alerts', 'Real-Time Alerts'),
                ('sentiment_gauge', 'Live Sentiment'),
                ('trend_chart', 'Real-Time Trends'),
                ('topics', 'Emerging Topics')
            ],
            'trend_analysis': [
                ('trend_chart', 'Sentiment Trends'),
                ('topics', 'Topic Evolution'),
                ('emotion_breakdown', 'Emotional Trends'),
                ('keyword_cloud', 'Keyword Evolution')
            ]
        }
        
        if preset_type not in presets:
            preset_type = 'detailed'
        
        dashboard_id = f"{preset_type}_dashboard_{datetime.now().timestamp()}"
        dashboard = self.create_dashboard(dashboard_id, f"{preset_type.capitalize()} Dashboard")
        
        # Add preset widgets
        for idx, (widget_type, title) in enumerate(presets[preset_type]):
            widget_id = f"{preset_type}_widget_{idx}"
            dashboard.create_widget(widget_type, widget_id, title)
        
        return dashboard


def get_dashboard_manager():
    """Factory function"""
    return DashboardManager()
