from typing import List, Dict
import re
from backend.sentiment_service import get_sentiment_analyzer

class AspectSentimentAnalyzer:
    ASPECT_KEYWORDS = {
        'price': ['price', 'cost', 'expensive', 'cheap', 'value', 'pricey', 'pricing', 'worth'],
        'quality': ['quality', 'durability', 'build', 'material', 'craftsmanship', 'robust', 'sturdy', 'premium'],
        'design': ['design', 'look', 'looks', 'appearance', 'style', 'aesthetics', 'color', 'sleek'],
        'delivery': ['delivery', 'shipping', 'package', 'arrival', 'ship', 'delivered', 'shipped'],
        'customer_service': ['service', 'support', 'help', 'representative', 'customer care', 'response', 'staff'],
        'performance': ['speed', 'performance', 'slow', 'fast', 'battery', 'charge', 'screen', 'software', 'hardware', 'lag']
    }

    def __init__(self):
        self.sentiment_analyzer = get_sentiment_analyzer()

    def split_sentences(self, text: str) -> List[str]:
        """Split text into sentences using simple regex"""
        sentences = re.split(r'[.!?;\n]+', text)
        return [s.strip() for s in sentences if s.strip()]

    def analyze_aspects(self, text: str) -> Dict[str, Dict]:
        """
        Analyze sentiment towards specific aspects in text
        Returns: {
            'aspect': {
                'sentiment': 'Positive' | 'Negative' | 'Neutral',
                'confidence': float,
                'snippet': str
            }
        }
        """
        sentences = self.split_sentences(text)
        results = {}

        for aspect, keywords in self.ASPECT_KEYWORDS.items():
            relevant_sentences = []
            for s in sentences:
                s_lower = s.lower()
                if any(kw in s_lower for kw in keywords):
                    relevant_sentences.append(s)

            if relevant_sentences:
                aspect_text = " ".join(relevant_sentences)
                analysis = self.sentiment_analyzer.analyze_sentiment(aspect_text)
                
                results[aspect] = {
                    'sentiment': analysis.get('sentiment', 'Neutral'),
                    'confidence': analysis.get('confidence', 50.0),
                    'snippet': aspect_text[:120] + ('...' if len(aspect_text) > 120 else '')
                }

        return results

    def aggregate_analysis(self, texts: List[str]) -> Dict[str, Dict]:
        """
        Aggregate aspect sentiment analysis over multiple texts
        Returns: {
            'aspect': {
                'Positive': int,
                'Negative': int,
                'Neutral': int,
                'avg_confidence': float,
                'mention_count': int
            }
        }
        """
        aggregated = {
            aspect: {'Positive': 0, 'Negative': 0, 'Neutral': 0, 'total_confidence': 0.0, 'mention_count': 0}
            for aspect in self.ASPECT_KEYWORDS
        }

        for text in texts:
            aspects = self.analyze_aspects(text)
            for aspect, info in aspects.items():
                sentiment = info['sentiment']
                confidence = info['confidence']
                
                aggregated[aspect][sentiment] += 1
                aggregated[aspect]['total_confidence'] += confidence
                aggregated[aspect]['mention_count'] += 1

        formatted = {}
        for aspect, data in aggregated.items():
            count = data['mention_count']
            if count > 0:
                formatted[aspect] = {
                    'Positive': data['Positive'],
                    'Negative': data['Negative'],
                    'Neutral': data['Neutral'],
                    'avg_confidence': round(data['total_confidence'] / count, 2),
                    'mention_count': count
                }
            else:
                formatted[aspect] = {
                    'Positive': 0,
                    'Negative': 0,
                    'Neutral': 0,
                    'avg_confidence': 0.0,
                    'mention_count': 0
                }

        return formatted

def get_aspect_sentiment_analyzer():
    """Factory function for AspectSentimentAnalyzer"""
    return AspectSentimentAnalyzer()
