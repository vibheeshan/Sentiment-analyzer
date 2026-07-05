from typing import List, Dict
import re
from collections import Counter
import random

class EmotionDetector:
    """Advanced emotion detection beyond basic sentiment"""
    
    EMOTION_KEYWORDS = {
        'joy': ['happy', 'love', 'awesome', 'excellent', 'amazing', 'great', 'wonderful', 'fantastic', 'brilliant', 'thrilled'],
        'anger': ['angry', 'furious', 'hate', 'terrible', 'awful', 'horrible', 'disgusting', 'infuriating', 'outrageous'],
        'sadness': ['sad', 'disappointed', 'upset', 'miserable', 'depressed', 'heartbroken', 'devastated', 'unhappy'],
        'surprise': ['shocked', 'surprised', 'astonished', 'amazed', 'unexpected', 'astounded', 'stunned'],
        'trust': ['reliable', 'trustworthy', 'dependable', 'honest', 'confident', 'secure', 'safe']
    }
    
    def detect_emotion(self, text: str) -> Dict:
        """Detect emotion from text"""
        text_lower = text.lower()
        emotion_scores = {}
        
        for emotion, keywords in self.EMOTION_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            emotion_scores[emotion] = score
        
        if sum(emotion_scores.values()) == 0:
            return {'emotion': 'Neutral', 'confidence': 0, 'scores': emotion_scores}
        
        top_emotion = max(emotion_scores.items(), key=lambda x: x[1])
        confidence = round((top_emotion[1] / max(emotion_scores.values())) * 100, 2)
        
        return {
            'emotion': top_emotion[0].capitalize(),
            'confidence': confidence,
            'scores': emotion_scores
        }

class ComplaintAnalyzer:
    """Extract complaint themes from negative reviews"""
    
    COMPLAINT_KEYWORDS = {
        'quality': ['poor quality', 'cheap', 'defective', 'broken', 'damaged', 'faulty', 'defect', 'inferior'],
        'delivery': ['delivery', 'shipping', 'late', 'delay', 'lost', 'missing', 'didn\'t arrive'],
        'customer_service': ['customer service', 'support', 'unhelpful', 'rude', 'unresponsive', 'assistance'],
        'price': ['expensive', 'overpriced', 'too much', 'not worth', 'price'],
        'performance': ['slow', 'doesn\'t work', 'broken', 'malfunction', 'failure', 'lag'],
        'battery': ['battery', 'drain', 'power', 'charge'],
        'durability': ['break', 'broke', 'durable', 'long-lasting', 'stop working', 'wear'],
        'design': ['ugly', 'design', 'looks', 'appearance', 'color', 'style']
    }
    
    def analyze_complaints(self, negative_reviews: List[str]) -> Dict:
        """Extract top complaint themes"""
        complaint_scores = {theme: 0 for theme in self.COMPLAINT_KEYWORDS.keys()}
        
        for review in negative_reviews:
            review_lower = review.lower()
            for theme, keywords in self.COMPLAINT_KEYWORDS.items():
                for keyword in keywords:
                    if keyword in review_lower:
                        complaint_scores[theme] += 1
        
        # Sort and return top complaints
        sorted_complaints = sorted(
            complaint_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return {
            'complaints': [theme for theme, score in sorted_complaints if score > 0],
            'scores': dict(sorted_complaints),
            'top_complaints': [theme for theme, score in sorted_complaints[:3] if score > 0]
        }

class SentimentChangeDetector:
    """Detect changes in sentiment over time"""
    
    def detect_changes(self, time_series_data: List[Dict], threshold: float = 15.0) -> Dict:
        """
        Detect significant sentiment changes
        
        Args:
            time_series_data: List of dicts with 'date' and 'sentiment' keys
            threshold: Percentage change threshold for significance
        
        Returns:
            Dict with identified changes and alerts
        """
        
        # Group by date and calculate sentiment percentage
        date_sentiments = {}
        for entry in time_series_data:
            date = entry.get('date', 'Unknown')
            sentiment = entry.get('sentiment', 'Neutral')
            
            if date not in date_sentiments:
                date_sentiments[date] = {'positive': 0, 'negative': 0, 'neutral': 0, 'total': 0}
            
            if sentiment == 'Positive':
                date_sentiments[date]['positive'] += 1
            elif sentiment == 'Negative':
                date_sentiments[date]['negative'] += 1
            else:
                date_sentiments[date]['neutral'] += 1
            
            date_sentiments[date]['total'] += 1
        
        # Calculate percentages and detect changes
        trends = []
        changes = []
        
        sorted_dates = sorted(date_sentiments.keys())
        
        for date in sorted_dates:
            counts = date_sentiments[date]
            total = counts['total']
            
            positive_pct = (counts['positive'] / total * 100) if total > 0 else 0
            negative_pct = (counts['negative'] / total * 100) if total > 0 else 0
            
            trends.append({
                'date': date,
                'positive_percentage': round(positive_pct, 1),
                'negative_percentage': round(negative_pct, 1),
                'positive_count': counts['positive'],
                'negative_count': counts['negative'],
                'total': total
            })
        
        # Detect changes between consecutive periods
        for i in range(1, len(trends)):
            prev_positive = trends[i-1]['positive_percentage']
            curr_positive = trends[i]['positive_percentage']
            change = curr_positive - prev_positive
            
            if abs(change) >= threshold:
                direction = "spike" if change > 0 else "drop"
                severity = "high" if abs(change) > 30 else "moderate"
                
                changes.append({
                    'date': trends[i]['date'],
                    'direction': direction,
                    'severity': severity,
                    'change_percentage': round(change, 1),
                    'from_percentage': round(prev_positive, 1),
                    'to_percentage': round(curr_positive, 1),
                    'alert': f"Sentiment {direction} ({change:+.1f}%) on {trends[i]['date']}"
                })
        
        return {
            'trends': trends,
            'changes': changes,
            'alerts': [c['alert'] for c in changes]
        }

class FakeReviewDetector:
    """Detect suspicious or fake reviews"""
    
    MIN_LENGTH = 10
    MIN_WORDS = 3
    
    def detect_fake_reviews(self, reviews: List[str]) -> Dict:
        """
        Identify potentially fake or suspicious reviews
        
        Args:
            reviews: List of review texts
        
        Returns:
            Dict with flags and suspicious reviews
        """
        
        suspicious_reviews = []
        
        for idx, review in enumerate(reviews):
            flags = []
            
            # Check length
            if len(review) < self.MIN_LENGTH:
                flags.append("very_short")
            
            # Check word count
            word_count = len(review.split())
            if word_count < self.MIN_WORDS:
                flags.append("few_words")
            
            # Check for excessive punctuation
            punctuation_count = sum(1 for c in review if c in '!?')
            if punctuation_count / max(word_count, 1) > 0.3:
                flags.append("excessive_punctuation")
            
            # Check for repeated words
            words = review.lower().split()
            if words and len(words) > 5:
                word_freq = Counter(words)
                most_common_freq = word_freq.most_common(1)[0][1]
                if most_common_freq / len(words) > 0.4:
                    flags.append("repetitive_words")
            
            # Check for all caps
            if len(review) > 10 and sum(1 for c in review if c.isupper()) / len(review) > 0.7:
                flags.append("all_caps")
            
            if flags:
                suspicious_reviews.append({
                    'index': idx,
                    'text': review,
                    'flags': flags,
                    'confidence': min(100, len(flags) * 25)  # Confidence based on number of flags
                })
        
        return {
            'suspicious_count': len(suspicious_reviews),
            'suspicious_reviews': suspicious_reviews,
            'total_reviews': len(reviews),
            'fake_percentage': round((len(suspicious_reviews) / len(reviews) * 100) if reviews else 0, 1)
        }

class BrandComparator:
    """Compare sentiment across brands or products"""
    
    def compare_sentiments(self, dataset1: List[Dict], dataset2: List[Dict], 
                         label1: str = "Product A", label2: str = "Product B") -> Dict:
        """
        Compare sentiment between two datasets
        
        Args:
            dataset1: First set of analysis results
            dataset2: Second set of analysis results
            label1: Label for first dataset
            label2: Label for second dataset
        
        Returns:
            Comparison statistics
        """
        
        def calculate_stats(data):
            sentiments = [d.get('sentiment', 'Neutral') for d in data]
            sentiment_counts = Counter(sentiments)
            total = len(data)
            
            return {
                'total': total,
                'positive': sentiment_counts.get('Positive', 0),
                'negative': sentiment_counts.get('Negative', 0),
                'neutral': sentiment_counts.get('Neutral', 0),
                'positive_pct': round((sentiment_counts.get('Positive', 0) / total * 100) if total > 0 else 0, 1),
                'negative_pct': round((sentiment_counts.get('Negative', 0) / total * 100) if total > 0 else 0, 1),
                'neutral_pct': round((sentiment_counts.get('Neutral', 0) / total * 100) if total > 0 else 0, 1),
                'avg_confidence': round(sum(d.get('confidence', 0) for d in data) / total, 1) if total > 0 else 0
            }
        
        stats1 = calculate_stats(dataset1)
        stats2 = calculate_stats(dataset2)
        
        # Calculate differences
        differences = {
            'positive_diff': stats2['positive_pct'] - stats1['positive_pct'],
            'negative_diff': stats2['negative_pct'] - stats1['negative_pct'],
            'winner': label2 if stats2['positive_pct'] > stats1['positive_pct'] else label1
        }
        
        return {
            label1: stats1,
            label2: stats2,
            'differences': differences,
            'comparison': {
                'better': label2 if stats2['positive_pct'] > stats1['positive_pct'] else label1,
                'margin': abs(differences['positive_diff'])
            }
        }

class MultilingualSupport:
    """Support for analyzing text in multiple languages"""
    
    SUPPORTED_LANGUAGES = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'hi': 'Hindi',
        'ta': 'Tamil',
        'te': 'Telugu',
        'ml': 'Malayalam'
    }
    
    def detect_language(self, text: str) -> str:
        """Simple language detection (can be enhanced with langdetect)"""
        # This is a simplified version
        # In production, use: from langdetect import detect
        
        hindi_keywords = ['है', 'का', 'के', 'में']
        tamil_keywords = ['ஆ', 'ி', 'ு', 'ு', 'ே', 'ை', 'ோ', 'ை']
        
        for keyword in hindi_keywords:
            if keyword in text:
                return 'hi'
        
        for keyword in tamil_keywords:
            if keyword in text:
                return 'ta'
        
        return 'en'  # Default to English
    
    def translate_if_needed(self, text: str, target_language: str = 'en') -> str:
        """Placeholder for translation (integrate Google Translate API)"""
        return text  # In production, use Google Translate API


# Helper functions
def get_emotion_detector():
    """Get emotion detector instance"""
    return EmotionDetector()

def get_complaint_analyzer():
    """Get complaint analyzer instance"""
    return ComplaintAnalyzer()

def get_sentiment_change_detector():
    """Get sentiment change detector instance"""
    return SentimentChangeDetector()

def get_fake_review_detector():
    """Get fake review detector instance"""
    return FakeReviewDetector()

def get_brand_comparator():
    """Get brand comparator instance"""
    return BrandComparator()

def get_multilingual_support():
    """Get multilingual support instance"""
    return MultilingualSupport()
