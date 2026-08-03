import json
from collections import Counter
from typing import List, Dict
from datetime import datetime

class InsightsGenerator:
    def __init__(self):
        pass
    
    def generate_summary(self, analysis_results: List[Dict]) -> Dict:
        """Generate comprehensive insights from analysis results"""
        
        if not analysis_results:
            return {}
        
        # Count sentiments
        sentiments = [r.get('sentiment', 'Neutral') for r in analysis_results]
        sentiment_counts = Counter(sentiments)
        
        total = len(analysis_results)
        positive_count = sentiment_counts.get('Positive', 0)
        negative_count = sentiment_counts.get('Negative', 0)
        neutral_count = sentiment_counts.get('Neutral', 0)
        
        # Calculate percentages
        positive_pct = round((positive_count / total) * 100, 1) if total > 0 else 0
        negative_pct = round((negative_count / total) * 100, 1) if total > 0 else 0
        neutral_pct = round((neutral_count / total) * 100, 1) if total > 0 else 0
        
        # Average confidence
        confidences = [r.get('confidence', 0) for r in analysis_results]
        avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0
        
        # Extract emotions
        emotions = [r.get('emotion', 'Unknown') for r in analysis_results if r.get('emotion')]
        emotion_counts = Counter(emotions)
        
        # Collect keywords
        all_keywords = []
        for result in analysis_results:
            if result.get('keywords'):
                all_keywords.extend(result['keywords'])
        
        keyword_counts = Counter(all_keywords)
        top_keywords = [word for word, count in keyword_counts.most_common(10)]
        
        # Find top positive and negative reviews
        positive_reviews = [r for r in analysis_results if r.get('sentiment') == 'Positive']
        negative_reviews = [r for r in analysis_results if r.get('sentiment') == 'Negative']
        
        top_positive = sorted(positive_reviews, key=lambda x: x.get('confidence', 0), reverse=True)[:3]
        top_negative = sorted(negative_reviews, key=lambda x: x.get('confidence', 0), reverse=True)[:3]
        
        # Generate key insights
        insights = self._generate_insights(
            sentiment_counts, positive_pct, negative_pct, 
            emotion_counts, top_keywords
        )
        
        return {
            'total_entries': total,
            'sentiment_distribution': {
                'Positive': {'count': positive_count, 'percentage': positive_pct},
                'Negative': {'count': negative_count, 'percentage': negative_pct},
                'Neutral': {'count': neutral_count, 'percentage': neutral_pct}
            },
            'avg_confidence': avg_confidence,
            'emotions': dict(emotion_counts.most_common(5)),
            'top_keywords': top_keywords,
            'top_positive_reviews': [r.get('text', '') for r in top_positive],
            'top_negative_reviews': [r.get('text', '') for r in top_negative],
            'key_insights': insights
        }
    
    def _generate_insights(self, sentiment_counts, positive_pct, negative_pct, 
                          emotion_counts, keywords):
        """Generate text-based insights"""
        insights = []
        
        # Overall sentiment insight
        if positive_pct > 60:
            insights.append(f"Overall sentiment is strongly positive ({positive_pct}% positive reviews)")
        elif positive_pct > 40:
            insights.append(f"Overall sentiment is mixed, leaning positive ({positive_pct}% positive)")
        elif positive_pct > 20:
            insights.append(f"Overall sentiment is mixed, leaning negative ({positive_pct}% positive)")
        else:
            insights.append(f"Overall sentiment is strongly negative ({positive_pct}% positive)")
        
        # Negative focus
        if negative_pct > 30:
            if keywords:
                insights.append(f"Negative feedback focuses on: {', '.join(keywords[:3])}")
        
        # Emotion insight
        if emotion_counts:
            top_emotion = emotion_counts.most_common(1)[0][0]
            insights.append(f"Dominant emotion detected: {top_emotion}")
        
        # Recommendation
        if positive_pct > 70:
            insights.append("✓ Brand perception is strong - maintain current standards")
        elif negative_pct > 40:
            insights.append("⚠ Consider addressing top complaint areas: {}, {}, {}".format(
                keywords[0] if len(keywords) > 0 else "product quality",
                keywords[1] if len(keywords) > 1 else "service",
                keywords[2] if len(keywords) > 2 else "support"
            ))
        
        return insights
    
    def detect_complaint_keywords(self, negative_reviews: List[str]) -> Dict:
        """Extract top complaint themes from negative reviews"""
        
        complaint_keywords = []
        for review in negative_reviews:
            # Simple keyword extraction - can be enhanced with NLP
            words = review.lower().split()
            complaint_keywords.extend(words)
        
        # Count and filter
        keyword_counts = Counter(complaint_keywords)
        
        # Remove common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were'}
        filtered = {k: v for k, v in keyword_counts.items() 
                   if k not in stop_words and len(k) > 3}
        
        top_complaints = sorted(filtered.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            'complaints': [word for word, count in top_complaints],
            'counts': {word: count for word, count in top_complaints}
        }
    
    def detect_sentiment_changes(self, entries_with_dates: List[Dict]) -> Dict:
        """Detect changes in sentiment over time"""
        
        # Sort by date
        sorted_entries = sorted(
            entries_with_dates,
            key=lambda x: x.get('date', ''),
            reverse=False
        )
        
        # Group by date and calculate sentiment
        date_sentiments = {}
        for entry in sorted_entries:
            date = entry.get('date', 'Unknown')
            sentiment = entry.get('sentiment', 'Neutral')
            
            if date not in date_sentiments:
                date_sentiments[date] = {'positive': 0, 'negative': 0, 'total': 0}
            
            date_sentiments[date]['total'] += 1
            if sentiment == 'Positive':
                date_sentiments[date]['positive'] += 1
            elif sentiment == 'Negative':
                date_sentiments[date]['negative'] += 1
        
        # Calculate percentages and trends
        trends = []
        for date, counts in sorted(date_sentiments.items()):
            positive_pct = round((counts['positive'] / counts['total']) * 100, 1)
            trends.append({
                'date': date,
                'positive_percentage': positive_pct,
                'positive_count': counts['positive'],
                'total_count': counts['total']
            })
        
        # Detect changes
        changes = []
        for i in range(1, len(trends)):
            prev_pct = trends[i-1]['positive_percentage']
            curr_pct = trends[i]['positive_percentage']
            change = curr_pct - prev_pct
            
            if abs(change) > 10:  # Significant change threshold
                direction = "increase" if change > 0 else "decrease"
                changes.append({
                    'date': trends[i]['date'],
                    'change_percentage': abs(change),
                    'direction': direction,
                    'from_percentage': prev_pct,
                    'to_percentage': curr_pct
                })
        
        return {
            'trends': trends,
            'significant_changes': changes
        }


def generate_insights(analysis_results: List[Dict]) -> Dict:
    """Helper function to generate insights"""
    generator = InsightsGenerator()
    return generator.generate_summary(analysis_results)
