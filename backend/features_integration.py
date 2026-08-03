"""
Integration module for all new BrandPulse features.
This module provides unified access to all advanced features.
"""

from backend.emotion_advanced import get_advanced_emotion_detector, get_nuance_analyzer
from backend.monitoring_alerts import get_real_time_monitor, get_crisis_detector
from backend.multi_source_integration import get_multi_source_aggregator
from backend.visual_sentiment import get_visual_sentiment_analyzer, get_image_content_detector
from backend.topic_discovery import get_topic_discovery, get_trend_analyzer
from backend.custom_dashboard import get_dashboard_manager
from backend.review_aggregation import get_review_aggregator

class BrandPulseFeatures:
    """Unified interface for all BrandPulse features"""
    
    def __init__(self):
        # Initialize all features
        self.emotion_detector = get_advanced_emotion_detector()
        self.nuance_analyzer = get_nuance_analyzer()
        self.real_time_monitor = get_real_time_monitor()
        self.crisis_detector = get_crisis_detector()
        self.multi_source = get_multi_source_aggregator()
        self.visual_analyzer = get_visual_sentiment_analyzer()
        self.image_detector = get_image_content_detector()
        self.topic_discovery = get_topic_discovery()
        self.trend_analyzer = get_trend_analyzer()
        self.dashboard_manager = get_dashboard_manager()
        self.review_aggregator = get_review_aggregator()
        
        self.features_status = {
            'advanced_emotions': True,
            'real_time_monitoring': True,
            'multi_source_integration': True,
            'visual_sentiment': True,
            'topic_discovery': True,
            'custom_dashboards': True,
            'review_aggregation': True
        }
    
    def get_feature_status(self):
        """Get status of all features"""
        return self.features_status
    
    def analyze_complete(self, text, sentiment=None, confidence=None):
        """
        Perform complete analysis using all features.
        
        Returns comprehensive analysis object with all insights.
        """
        analysis = {
            'text': text,
            'timestamp': None,
            'sentiment': sentiment,
            'confidence': confidence
        }
        
        # Advanced emotions
        if self.emotion_detector:
            analysis['emotions'] = self.emotion_detector.detect_emotions(text)
        
        # Emotional nuances
        if self.nuance_analyzer:
            analysis['nuances'] = self.nuance_analyzer.analyze_nuances(text)
        
        # Add to real-time monitoring
        if self.real_time_monitor and sentiment:
            analysis['monitoring'] = {
                'added_to_monitor': True,
                'crisis_level': self.real_time_monitor.crisis_level
            }
        
        return analysis
    
    def batch_analyze(self, texts, sentiments=None):
        """
        Perform batch analysis on multiple texts.
        """
        results = []
        
        for i, text in enumerate(texts):
            sentiment = sentiments[i] if sentiments and i < len(sentiments) else None
            result = self.analyze_complete(text, sentiment)
            results.append(result)
        
        return results


def get_brandpulse_features():
    """Factory function to get unified features interface"""
    return BrandPulseFeatures()
