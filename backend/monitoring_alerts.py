"""
Real-time Monitoring & Alerts Module
Enables real-time keyword monitoring, custom alerts, and crisis detection
"""

from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque
import json

class RealTimeMonitor:
    """Real-time monitoring of sentiment and keywords"""
    
    def __init__(self, buffer_size: int = 1000):
        self.monitoring_data = deque(maxlen=buffer_size)
        self.keyword_tracks = defaultdict(deque)
        self.alert_rules = []
        self.alert_history = []
        self.crisis_level = 'normal'
        
    def add_data(self, text: str, sentiment: str, confidence: float, timestamp: datetime = None):
        """Add new data point to monitoring"""
        if timestamp is None:
            timestamp = datetime.now()
        
        data_point = {
            'text': text,
            'sentiment': sentiment,
            'confidence': confidence,
            'timestamp': timestamp,
            'severity': self._calculate_severity(sentiment, confidence)
        }
        
        self.monitoring_data.append(data_point)
        return data_point
    
    def track_keyword(self, keyword: str, text: str, sentiment: str):
        """Track specific keyword mentions"""
        if keyword.lower() in text.lower():
            self.keyword_tracks[keyword].append({
                'text': text,
                'sentiment': sentiment,
                'timestamp': datetime.now()
            })
    
    def add_alert_rule(self, rule_name: str, trigger_condition, notification_type: str = 'email'):
        """Add custom alert rule"""
        rule = {
            'name': rule_name,
            'condition': trigger_condition,
            'notification_type': notification_type,
            'created_at': datetime.now(),
            'triggered_count': 0
        }
        self.alert_rules.append(rule)
        return rule
    
    def check_alerts(self) -> List[Dict]:
        """Check if any alert conditions are met"""
        triggered_alerts = []
        
        # Check sentiment spike alerts
        if len(self.monitoring_data) > 10:
            recent = list(self.monitoring_data)[-10:]
            negative_count = sum(1 for d in recent if d['sentiment'] == 'Negative')
            
            if negative_count >= 7:  # 70% negative in last 10
                alert = {
                    'type': 'sentiment_spike',
                    'severity': 'high' if negative_count == 10 else 'medium',
                    'message': f'High negative sentiment spike detected: {negative_count}/10 negative',
                    'timestamp': datetime.now(),
                    'data': recent
                }
                triggered_alerts.append(alert)
                self.alert_history.append(alert)
                self._update_crisis_level()
        
        # Check keyword mentions
        for keyword, mentions in self.keyword_tracks.items():
            if len(mentions) > 5:
                recent_mentions = [m for m in mentions if 
                                  (datetime.now() - m['timestamp']).total_seconds() < 3600]
                
                if len(recent_mentions) > 3:
                    negative_mentions = sum(1 for m in recent_mentions if m['sentiment'] == 'Negative')
                    
                    if negative_mentions / len(recent_mentions) > 0.6:
                        alert = {
                            'type': 'keyword_alert',
                            'keyword': keyword,
                            'severity': 'medium',
                            'message': f'Keyword "{keyword}" trending negatively',
                            'mention_count': len(recent_mentions),
                            'negative_ratio': round(negative_mentions / len(recent_mentions), 2),
                            'timestamp': datetime.now()
                        }
                        triggered_alerts.append(alert)
                        self.alert_history.append(alert)
        
        return triggered_alerts
    
    def _calculate_severity(self, sentiment: str, confidence: float) -> str:
        """Calculate severity level"""
        if sentiment == 'Negative' and confidence > 85:
            return 'critical'
        elif sentiment == 'Negative' and confidence > 70:
            return 'high'
        elif sentiment == 'Negative':
            return 'medium'
        else:
            return 'low'
    
    def _update_crisis_level(self):
        """Update overall crisis level"""
        if len(self.monitoring_data) > 20:
            recent = list(self.monitoring_data)[-20:]
            critical_count = sum(1 for d in recent if d['severity'] == 'critical')
            high_count = sum(1 for d in recent if d['severity'] in ['critical', 'high'])
            
            if critical_count >= 5:
                self.crisis_level = 'critical'
            elif high_count >= 12:
                self.crisis_level = 'high'
            elif high_count >= 8:
                self.crisis_level = 'medium'
            else:
                self.crisis_level = 'normal'
    
    def get_crisis_level(self) -> Dict:
        """Get current crisis level and details"""
        return {
            'level': self.crisis_level,
            'timestamp': datetime.now(),
            'recent_alerts': len([a for a in self.alert_history 
                                 if (datetime.now() - a['timestamp']).total_seconds() < 3600])
        }
    
    def get_monitoring_stats(self) -> Dict:
        """Get comprehensive monitoring statistics"""
        if not self.monitoring_data:
            return {}
        
        recent = list(self.monitoring_data)[-100:]
        sentiments = [d['sentiment'] for d in recent]
        
        from collections import Counter
        sentiment_counts = Counter(sentiments)
        
        return {
            'total_monitored': len(self.monitoring_data),
            'recent_count': len(recent),
            'sentiment_distribution': dict(sentiment_counts),
            'crisis_level': self.crisis_level,
            'active_keywords': len(self.keyword_tracks),
            'total_alerts': len(self.alert_history),
            'last_update': datetime.now()
        }


class CrisisDetector:
    """Detects potential PR crises and reputation threats"""
    
    CRISIS_TRIGGERS = {
        'viral_negativity': {
            'threshold': 80,  # 80% negative in short timeframe
            'timeframe': 3600,  # 1 hour
            'min_mentions': 20,
            'severity': 'critical'
        },
        'quality_complaint': {
            'keywords': ['defect', 'broken', 'failed', 'poor quality', 'don\'t work'],
            'severity': 'high'
        },
        'customer_service_crisis': {
            'keywords': ['rude', 'unhelpful', 'ignored', 'not responding', 'worst service'],
            'severity': 'high'
        },
        'safety_concern': {
            'keywords': ['unsafe', 'dangerous', 'injury', 'harm', 'risk'],
            'severity': 'critical'
        },
        'competitor_surge': {
            'competitor_mention_ratio': 0.5,
            'sentiment_delta': 40,  # 40% swing to competitor
            'severity': 'medium'
        }
    }
    
    def detect_crisis(self, data_points: List[Dict]) -> List[Dict]:
        """
        Detect potential crises from data points.
        Returns list of detected crises with severity.
        """
        crises = []
        
        if not data_points:
            return crises
        
        # Check viral negativity
        if self._check_viral_negativity(data_points):
            crises.append({
                'type': 'viral_negativity',
                'severity': 'critical',
                'message': 'Viral negative sentiment detected',
                'recommendation': 'Engage customers immediately, prepare crisis response'
            })
        
        # Check quality issues
        quality_crisis = self._check_quality_issues(data_points)
        if quality_crisis:
            crises.append(quality_crisis)
        
        # Check customer service issues
        service_crisis = self._check_service_issues(data_points)
        if service_crisis:
            crises.append(service_crisis)
        
        # Check safety concerns
        safety_crisis = self._check_safety_concerns(data_points)
        if safety_crisis:
            crises.append(safety_crisis)
        
        return crises
    
    def _check_viral_negativity(self, data_points: List[Dict]) -> bool:
        """Check for viral negativity pattern"""
        if len(data_points) < 20:
            return False
        
        recent = data_points[-20:]
        negative_count = sum(1 for d in recent if d.get('sentiment') == 'Negative')
        
        return (negative_count / len(recent)) > 0.8
    
    def _check_quality_issues(self, data_points: List[Dict]) -> Dict or None:
        """Check for quality complaint patterns"""
        quality_complaints = 0
        
        for point in data_points[-50:]:
            text = point.get('text', '').lower()
            for keyword in self.CRISIS_TRIGGERS['quality_complaint']['keywords']:
                if keyword in text and point.get('sentiment') == 'Negative':
                    quality_complaints += 1
        
        if quality_complaints >= 5:
            return {
                'type': 'quality_crisis',
                'severity': 'high',
                'message': f'Multiple quality complaints detected ({quality_complaints})',
                'recommendation': 'Investigate product issues, consider recall or fix announcement'
            }
        
        return None
    
    def _check_service_issues(self, data_points: List[Dict]) -> Dict or None:
        """Check for customer service crisis"""
        service_complaints = 0
        
        for point in data_points[-50:]:
            text = point.get('text', '').lower()
            for keyword in self.CRISIS_TRIGGERS['customer_service_crisis']['keywords']:
                if keyword in text and point.get('sentiment') == 'Negative':
                    service_complaints += 1
        
        if service_complaints >= 5:
            return {
                'type': 'service_crisis',
                'severity': 'high',
                'message': f'Customer service complaints rising ({service_complaints})',
                'recommendation': 'Boost customer service staff, prepare response template'
            }
        
        return None
    
    def _check_safety_concerns(self, data_points: List[Dict]) -> Dict or None:
        """Check for safety-related crises"""
        safety_mentions = 0
        
        for point in data_points[-50:]:
            text = point.get('text', '').lower()
            for keyword in self.CRISIS_TRIGGERS['safety_concern']['keywords']:
                if keyword in text:
                    safety_mentions += 1
        
        if safety_mentions >= 3:
            return {
                'type': 'safety_crisis',
                'severity': 'critical',
                'message': f'Safety concerns mentioned ({safety_mentions} times)',
                'recommendation': 'Immediate executive review required. Contact legal and PR teams'
            }
        
        return None
    
    def get_crisis_score(self, data_points: List[Dict]) -> float:
        """Calculate overall crisis score (0-100)"""
        if not data_points:
            return 0
        
        score = 0
        
        # Sentiment analysis (weight: 40)
        negative_count = sum(1 for d in data_points[-50:] if d.get('sentiment') == 'Negative')
        sentiment_score = min((negative_count / 50) * 40, 40)
        
        # Velocity (weight: 30) - how fast sentiment is changing
        if len(data_points) > 10:
            recent_negative = sum(1 for d in data_points[-10:] if d.get('sentiment') == 'Negative')
            velocity_score = min((recent_negative / 10) * 30, 30)
        else:
            velocity_score = 0
        
        # Mention volume (weight: 30)
        volume_score = min((len(data_points) / 100) * 30, 30)
        
        score = sentiment_score + velocity_score + volume_score
        
        return round(min(score, 100), 2)


def get_real_time_monitor(buffer_size: int = 1000):
    """Factory function to get monitor instance"""
    return RealTimeMonitor(buffer_size)


def get_crisis_detector():
    """Factory function to get crisis detector instance"""
    return CrisisDetector()
