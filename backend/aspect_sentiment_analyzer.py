"""
Aspect-Based Sentiment Analysis (ABSA)
Deep semantic layer that breaks down sentiment by product features, service attributes, and themes.
Inspired by Brandwatch, Sprinklr enterprise implementations.
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict
import re
from datetime import datetime

@dataclass
class AspectOpinion:
    """Represents sentiment about a specific aspect/feature."""
    aspect: str
    sentiment: str  # positive, negative, neutral
    confidence: float
    intensity: float  # 0-1
    opinion_words: List[str]
    context: str
    timestamp: str


class AspectSentimentAnalyzer:
    """
    Enterprise-grade aspect-based sentiment analysis.
    Breaks down sentiment by product features, service attributes, and business dimensions.
    """
    
    # Product & Service Aspects (Domain-specific)
    ASPECT_CATEGORIES = {
        'product_quality': [
            'quality', 'durability', 'build', 'construction', 'materials', 'craftsmanship',
            'finishing', 'reliability', 'performance', 'functionality', 'features', 'specs'
        ],
        'pricing': [
            'price', 'cost', 'value', 'expensive', 'cheap', 'affordable', 'overpriced',
            'worth', 'deal', 'discount', 'fee', 'billing', 'payment'
        ],
        'customer_service': [
            'support', 'service', 'customer care', 'help', 'response', 'communication',
            'staff', 'team', 'representatives', 'assistance', 'service quality', 'friendly',
            'professional', 'knowledgeable', 'helpful'
        ],
        'delivery': [
            'shipping', 'delivery', 'shipping time', 'fast', 'slow', 'arrival', 'package',
            'packaging', 'condition on arrival', 'tracking', 'logistics', 'transport'
        ],
        'user_experience': [
            'usability', 'interface', 'design', 'ui', 'ux', 'ease of use', 'navigation',
            'intuitive', 'confusing', 'user experience', 'learning curve', 'accessibility'
        ],
        'documentation': [
            'manual', 'instructions', 'guide', 'documentation', 'help', 'support docs',
            'tutorial', 'explanation', 'clarity', 'comprehensive'
        ],
        'compatibility': [
            'compatible', 'compatibility', 'works with', 'integrates', 'system requirement',
            'platform', 'OS', 'device', 'browser', 'version'
        ],
        'brand_reputation': [
            'brand', 'company', 'manufacturer', 'reputation', 'trustworthy', 'established',
            'reliable company', 'credibility', 'brand name'
        ],
        'sustainability': [
            'eco', 'sustainable', 'environment', 'green', 'biodegradable', 'recycled',
            'packaging waste', 'carbon', 'organic', 'natural'
        ],
        'safety': [
            'safe', 'safety', 'secure', 'protection', 'hazard', 'risk', 'danger',
            'certified', 'standards', 'compliance'
        ]
    }
    
    # Opinion words mapped to aspects
    ASPECT_OPINION_MAP = {
        'product_quality': {
            'positive': ['excellent', 'high quality', 'durable', 'solid', 'robust', 'superior',
                        'well made', 'premium', 'impressive', 'outstanding'],
            'negative': ['poor quality', 'cheap', 'flimsy', 'breaks easily', 'defective',
                        'substandard', 'shoddy', 'weak', 'fragile', 'disappointing']
        },
        'pricing': {
            'positive': ['affordable', 'reasonable', 'good value', 'worth every penny',
                        'fair price', 'competitive', 'excellent deal'],
            'negative': ['overpriced', 'expensive', 'rip off', 'not worth it', 'pricey',
                        'outrageous', 'highway robbery', 'too much']
        },
        'customer_service': {
            'positive': ['excellent service', 'helpful staff', 'responsive', 'professional',
                        'quick response', 'friendly', 'accommodating', 'attentive'],
            'negative': ['poor service', 'rude staff', 'slow response', 'unhelpful',
                        'unprofessional', 'dismissive', 'ignored my issue', 'incompetent']
        },
        'delivery': {
            'positive': ['fast shipping', 'quick delivery', 'arrived early', 'well packaged',
                        'careful handling', 'professional logistics'],
            'negative': ['slow shipping', 'delayed', 'damaged in transit', 'poor packaging',
                        'lost package', 'untracked', 'arrived damaged']
        },
        'user_experience': {
            'positive': ['easy to use', 'intuitive', 'smooth', 'seamless', 'user-friendly',
                        'straightforward', 'clean interface'],
            'negative': ['confusing', 'difficult', 'clunky', 'buggy', 'poor design',
                        'hard to navigate', 'unintuitive', 'frustrating']
        }
    }
    
    def analyze_aspects(self, text: str) -> List[AspectOpinion]:
        """
        Analyze all aspects and their associated sentiment in given text.
        
        Args:
            text: Input text to analyze
            
        Returns:
            List of AspectOpinion objects with sentiment breakdown
        """
        text_lower = text.lower()
        aspects_found = []
        
        # Detect each aspect category
        for category, keywords in self.ASPECT_CATEGORIES.items():
            for keyword in keywords:
                if keyword in text_lower:
                    # Find sentiment words nearby
                    sentiment, confidence, opinion_words = self._extract_aspect_sentiment(
                        text_lower, keyword, category
                    )
                    
                    if sentiment:  # Only add if sentiment detected
                        aspects_found.append(AspectOpinion(
                            aspect=f"{category}:{keyword}",
                            sentiment=sentiment,
                            confidence=confidence,
                            intensity=self._calculate_intensity(text_lower, keyword),
                            opinion_words=opinion_words,
                            context=self._extract_context(text_lower, keyword),
                            timestamp=datetime.now().isoformat()
                        ))
        
        return aspects_found
    
    def _extract_aspect_sentiment(self, text: str, aspect: str, category: str) -> Tuple[str, float, List[str]]:
        """Extract sentiment words associated with an aspect."""
        # Find sentences containing the aspect
        sentences = re.split(r'[.!?]', text)
        aspect_sentences = [s for s in sentences if aspect in s.lower()]
        
        if not aspect_sentences:
            return None, 0.0, []
        
        # Analyze opinion words in those sentences
        opinions = []
        for opinion_list in self.ASPECT_OPINION_MAP.get(category, {}).values():
            opinions.extend(opinion_list)
        
        found_opinions = []
        for opinion in opinions:
            if opinion in text.lower():
                found_opinions.append(opinion)
        
        if not found_opinions:
            return 'neutral', 0.3, []
        
        # Determine sentiment from found opinion words
        positive_ops = [op for op in found_opinions 
                       if op in self.ASPECT_OPINION_MAP.get(category, {}).get('positive', [])]
        negative_ops = [op for op in found_opinions 
                       if op in self.ASPECT_OPINION_MAP.get(category, {}).get('negative', [])]
        
        if len(positive_ops) > len(negative_ops):
            return 'positive', len(positive_ops) / (len(positive_ops) + len(negative_ops)), positive_ops
        elif len(negative_ops) > len(positive_ops):
            return 'negative', len(negative_ops) / (len(positive_ops) + len(negative_ops)), negative_ops
        else:
            return 'neutral', 0.5, found_opinions
    
    def _calculate_intensity(self, text: str, aspect: str) -> float:
        """Calculate sentiment intensity for an aspect."""
        aspect_context = self._extract_context(text, aspect)
        
        # Check for intensifiers
        intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely']
        intensifier_count = sum(1 for w in intensifiers if w in aspect_context.lower())
        
        base_intensity = 0.5 + (intensifier_count * 0.1)
        return min(base_intensity, 1.0)
    
    def _extract_context(self, text: str, aspect: str, context_window: int = 30) -> str:
        """Extract surrounding context for an aspect."""
        idx = text.find(aspect)
        if idx == -1:
            return ""
        
        start = max(0, idx - context_window)
        end = min(len(text), idx + len(aspect) + context_window)
        return text[start:end]
    
    def get_aspect_summary(self, text: str) -> Dict:
        """
        Get comprehensive aspect-based sentiment summary.
        Returns aggregated sentiment by category.
        """
        aspects = self.analyze_aspects(text)
        
        # Group by category
        summary = defaultdict(lambda: {'positive': 0, 'negative': 0, 'neutral': 0, 'count': 0})
        
        for aspect in aspects:
            category = aspect.aspect.split(':')[0]
            summary[category][aspect.sentiment] += 1
            summary[category]['count'] += 1
        
        # Calculate scores
        result = {}
        for category, counts in summary.items():
            total = counts['count']
            if total > 0:
                result[category] = {
                    'sentiment_distribution': {
                        'positive': counts['positive'] / total,
                        'negative': counts['negative'] / total,
                        'neutral': counts['neutral'] / total
                    },
                    'mention_count': total,
                    'primary_sentiment': max(
                        ('positive', counts['positive']),
                        ('negative', counts['negative']),
                        ('neutral', counts['neutral']),
                        key=lambda x: x[1]
                    )[0]
                }
        
        return result
    
    def identify_pain_points(self, texts: List[str]) -> Dict[str, float]:
        """
        Identify most criticized aspects (pain points) across multiple texts.
        Returns ranked list of aspects with negative sentiment.
        """
        pain_points = defaultdict(int)
        
        for text in texts:
            aspects = self.analyze_aspects(text)
            for aspect in aspects:
                if aspect.sentiment == 'negative':
                    category = aspect.aspect.split(':')[0]
                    pain_points[category] += aspect.confidence
        
        # Rank by frequency and intensity
        return dict(sorted(pain_points.items(), key=lambda x: x[1], reverse=True))
    
    def identify_strengths(self, texts: List[str]) -> Dict[str, float]:
        """
        Identify most praised aspects (strengths) across multiple texts.
        Returns ranked list of aspects with positive sentiment.
        """
        strengths = defaultdict(int)
        
        for text in texts:
            aspects = self.analyze_aspects(text)
            for aspect in aspects:
                if aspect.sentiment == 'positive':
                    category = aspect.aspect.split(':')[0]
                    strengths[category] += aspect.confidence
        
        return dict(sorted(strengths.items(), key=lambda x: x[1], reverse=True))
    
    def compare_aspects(self, texts1: List[str], texts2: List[str]) -> Dict:
        """
        Compare aspect sentiment between two sets of texts.
        Useful for competitive analysis or before/after studies.
        """
        summary1 = {}
        summary2 = {}
        
        for text in texts1:
            aspects = self.analyze_aspects(text)
            for aspect in aspects:
                category = aspect.aspect.split(':')[0]
                if category not in summary1:
                    summary1[category] = {'positive': 0, 'negative': 0, 'neutral': 0}
                summary1[category][aspect.sentiment] += 1
        
        for text in texts2:
            aspects = self.analyze_aspects(text)
            for aspect in aspects:
                category = aspect.aspect.split(':')[0]
                if category not in summary2:
                    summary2[category] = {'positive': 0, 'negative': 0, 'neutral': 0}
                summary2[category][aspect.sentiment] += 1
        
        # Calculate deltas
        comparison = {}
        all_categories = set(summary1.keys()) | set(summary2.keys())
        
        for category in all_categories:
            s1 = summary1.get(category, {'positive': 0, 'negative': 0, 'neutral': 0})
            s2 = summary2.get(category, {'positive': 0, 'negative': 0, 'neutral': 0})
            
            t1 = sum(s1.values()) or 1
            t2 = sum(s2.values()) or 1
            
            comparison[category] = {
                'set1_sentiment': s1['positive'] / t1,
                'set2_sentiment': s2['positive'] / t2,
                'change': (s2['positive'] / t2) - (s1['positive'] / t1)
            }
        
        return comparison
