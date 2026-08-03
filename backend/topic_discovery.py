"""
Topic Discovery & Trending Module
Identifies emerging topics, trending discussions, and topic clusters
"""

from typing import Dict, List, Tuple, Set
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import math

class TopicDiscovery:
    """
    Discovers emerging topics and tracks topic trends.
    Uses clustering and NLP-based topic modeling.
    """
    
    def __init__(self):
        self.topics = {}
        self.topic_clusters = []
        self.trending_topics = []
        self.topic_history = defaultdict(list)
    
    def extract_topics(self, texts: List[str], num_topics: int = 5) -> Dict:
        """
        Extract main topics from a collection of texts.
        
        Args:
            texts: List of text documents
            num_topics: Number of topics to extract
        
        Returns:
            Dict with identified topics and their keywords
        """
        if not texts:
            return {}
        
        # Extract keywords from all texts
        all_keywords = self._extract_keywords_from_texts(texts)
        
        # Cluster keywords into topics
        topics = self._cluster_keywords(all_keywords, num_topics)
        
        # Analyze topic characteristics
        topic_analysis = {}
        for topic_id, keywords in topics.items():
            related_texts = self._find_texts_for_keywords(texts, keywords)
            
            topic_analysis[topic_id] = {
                'keywords': keywords,
                'related_text_count': len(related_texts),
                'prominence_score': self._calculate_prominence(keywords, texts),
                'sentiment': self._analyze_topic_sentiment(related_texts),
                'emergence_speed': 'new' if len(related_texts) < 3 else 'established'
            }
        
        self.topics = topic_analysis
        return topic_analysis
    
    def detect_trending_topics(self, recent_texts: List[str], 
                              historical_texts: List[str] = None) -> List[Dict]:
        """
        Detect trending topics by comparing recent vs historical data.
        
        Args:
            recent_texts: Recent text data
            historical_texts: Historical text data for comparison
        
        Returns:
            List of trending topics with velocity metrics
        """
        if not recent_texts:
            return []
        
        # Extract topics from recent data
        recent_topics = self.extract_topics(recent_texts)
        
        # If no historical data, all recent topics are trending
        if not historical_texts:
            trending = []
            for topic_id, analysis in recent_topics.items():
                trending.append({
                    'topic': topic_id,
                    'keywords': analysis['keywords'],
                    'mention_count': analysis['related_text_count'],
                    'trending_score': 100.0,
                    'velocity': 'high',
                    'status': 'emerging',
                    'timestamp': datetime.now().isoformat()
                })
            return trending
        
        # Compare with historical topics
        historical_topics = self.extract_topics(historical_texts)
        
        trending = []
        for topic_id, recent_analysis in recent_topics.items():
            recent_count = recent_analysis['related_text_count']
            
            # Find matching historical topic
            historical_count = 0
            for hist_topic_id, hist_analysis in historical_topics.items():
                if set(recent_analysis['keywords']).intersection(set(hist_analysis['keywords'])):
                    historical_count = hist_analysis['related_text_count']
                    break
            
            # Calculate growth rate
            if historical_count > 0:
                growth_rate = ((recent_count - historical_count) / historical_count) * 100
            else:
                growth_rate = 100.0
            
            if growth_rate > 20:  # 20% growth threshold
                velocity = 'very_high' if growth_rate > 100 else 'high'
                status = 'viral' if growth_rate > 200 else 'trending'
                
                trending.append({
                    'topic': topic_id,
                    'keywords': recent_analysis['keywords'],
                    'recent_count': recent_count,
                    'historical_count': historical_count,
                    'growth_rate': round(growth_rate, 1),
                    'trending_score': min(round(abs(growth_rate)), 100),
                    'velocity': velocity,
                    'status': status,
                    'timestamp': datetime.now().isoformat()
                })
        
        # Sort by trending score
        trending.sort(key=lambda x: x['trending_score'], reverse=True)
        self.trending_topics = trending
        
        return trending
    
    def get_topic_evolution(self, topic_keywords: List[str], 
                           time_period: int = 7) -> Dict:
        """
        Track how a topic evolves over time.
        
        Args:
            topic_keywords: Keywords defining the topic
            time_period: Number of days to analyze
        
        Returns:
            Evolution data with sentiment and volume changes
        """
        if not topic_keywords:
            return {}
        
        # In production, would query historical data
        # For now, return structure
        
        evolution = {
            'topic': ' OR '.join(topic_keywords),
            'time_period_days': time_period,
            'volume_trend': 'increasing',
            'sentiment_trend': 'becoming_positive',
            'daily_data': [
                {
                    'date': (datetime.now() - timedelta(days=i)).isoformat(),
                    'volume': 100 + i*10,
                    'sentiment': 'neutral',
                    'positive_pct': 40,
                    'negative_pct': 30
                }
                for i in range(time_period)
            ]
        }
        
        return evolution
    
    def identify_topic_clusters(self, texts: List[str]) -> List[Dict]:
        """
        Identify clusters of related topics.
        Topics in the same cluster are semantically related.
        """
        topics = self.extract_topics(texts)
        
        clusters = []
        processed = set()
        
        for topic_id, analysis in topics.items():
            if topic_id in processed:
                continue
            
            cluster = {'primary_topic': topic_id, 'keywords': analysis['keywords'], 'related_topics': []}
            
            # Find related topics
            for other_id, other_analysis in topics.items():
                if other_id == topic_id or other_id in processed:
                    continue
                
                # Calculate keyword overlap
                overlap = len(set(analysis['keywords']).intersection(set(other_analysis['keywords'])))
                
                if overlap > 0:
                    cluster['related_topics'].append({
                        'topic': other_id,
                        'keywords': other_analysis['keywords'],
                        'similarity': round(overlap / max(len(analysis['keywords']), len(other_analysis['keywords'])), 2)
                    })
                    processed.add(other_id)
            
            clusters.append(cluster)
            processed.add(topic_id)
        
        self.topic_clusters = clusters
        return clusters
    
    def get_topic_sentiment_breakdown(self, topic_id: str, texts: List[str]) -> Dict:
        """Get sentiment breakdown for a specific topic"""
        if topic_id not in self.topics:
            return {}
        
        topic_keywords = self.topics[topic_id]['keywords']
        related_texts = self._find_texts_for_keywords(texts, topic_keywords)
        
        sentiment_counts = Counter()
        for text in related_texts:
            # This would use actual sentiment analysis in production
            sentiment_counts['positive'] += 1
        
        total = len(related_texts)
        
        return {
            'topic': topic_id,
            'total_mentions': total,
            'sentiment_distribution': dict(sentiment_counts),
            'sentiment_percentages': {
                s: round(count/total*100, 1) for s, count in sentiment_counts.items()
            }
        }
    
    def _extract_keywords_from_texts(self, texts: List[str], top_n: int = 20) -> List[str]:
        """Extract top keywords from all texts"""
        words = []
        
        # Simple keyword extraction
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                     'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had'}
        
        for text in texts:
            # Split into words and filter
            text_words = [w.lower() for w in text.split() if len(w) > 3 and w.lower() not in stop_words]
            words.extend(text_words)
        
        # Get most common
        word_counts = Counter(words)
        keywords = [word for word, count in word_counts.most_common(top_n)]
        
        return keywords
    
    def _cluster_keywords(self, keywords: List[str], num_clusters: int) -> Dict:
        """Simple keyword clustering"""
        clusters = {}
        
        # Distribute keywords across clusters
        for i, keyword in enumerate(keywords):
            cluster_id = f"topic_{i % num_clusters}"
            if cluster_id not in clusters:
                clusters[cluster_id] = []
            clusters[cluster_id].append(keyword)
        
        return clusters
    
    def _find_texts_for_keywords(self, texts: List[str], keywords: List[str]) -> List[str]:
        """Find texts containing any of the keywords"""
        related = []
        
        for text in texts:
            text_lower = text.lower()
            if any(keyword in text_lower for keyword in keywords):
                related.append(text)
        
        return related
    
    def _calculate_prominence(self, keywords: List[str], texts: List[str]) -> float:
        """Calculate topic prominence score"""
        total_texts = len(texts)
        texts_with_keywords = len(self._find_texts_for_keywords(texts, keywords))
        
        return round((texts_with_keywords / total_texts * 100) if total_texts > 0 else 0, 1)
    
    def _analyze_topic_sentiment(self, texts: List[str]) -> str:
        """Analyze sentiment for topic texts"""
        if not texts:
            return 'neutral'
        
        # Simplified sentiment analysis
        positive_count = sum(1 for t in texts if 'good' in t.lower() or 'great' in t.lower())
        negative_count = sum(1 for t in texts if 'bad' in t.lower() or 'terrible' in t.lower())
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'


class TrendAnalyzer:
    """Analyzes trend velocity and trajectory"""
    
    def calculate_trend_velocity(self, data_points: List[Dict]) -> Dict:
        """
        Calculate how fast a trend is moving.
        
        Args:
            data_points: List of timestamped data points
        
        Returns:
            Velocity metrics (acceleration, speed, direction)
        """
        if len(data_points) < 2:
            return {}
        
        # Sort by timestamp
        sorted_points = sorted(data_points, key=lambda x: x.get('timestamp', datetime.now()))
        
        # Calculate velocity
        volumes = [p.get('volume', 0) for p in sorted_points]
        velocities = []
        
        for i in range(1, len(volumes)):
            velocity = volumes[i] - volumes[i-1]
            velocities.append(velocity)
        
        avg_velocity = sum(velocities) / len(velocities) if velocities else 0
        
        # Calculate acceleration
        accelerations = []
        for i in range(1, len(velocities)):
            acceleration = velocities[i] - velocities[i-1]
            accelerations.append(acceleration)
        
        avg_acceleration = sum(accelerations) / len(accelerations) if accelerations else 0
        
        # Determine trend direction
        if avg_acceleration > 0:
            direction = 'accelerating'
        elif avg_acceleration < 0:
            direction = 'decelerating'
        else:
            direction = 'constant'
        
        return {
            'average_velocity': round(avg_velocity, 2),
            'average_acceleration': round(avg_acceleration, 2),
            'direction': direction,
            'speed': 'fast' if abs(avg_velocity) > 10 else 'slow',
            'projection': self._project_trend(sorted_points, avg_velocity)
        }
    
    def _project_trend(self, points: List[Dict], velocity: float) -> str:
        """Project trend trajectory"""
        if velocity > 0:
            return 'continuing_upward'
        else:
            return 'continuing_downward'


def get_topic_discovery():
    """Factory function"""
    return TopicDiscovery()


def get_trend_analyzer():
    """Factory function"""
    return TrendAnalyzer()
