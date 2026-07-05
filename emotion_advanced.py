"""
Advanced Emotion Detection Module
Supports complex emotions like anger, joy, sadness, fear, surprise, disgust, trust, anticipation
"""

from typing import Dict, List
from collections import Counter
import re

class AdvancedEmotionDetector:
    """
    Advanced emotion detection with multiple emotion states.
    Based on Plutchik's wheel of emotions and NRC lexicon.
    """
    
    EMOTION_KEYWORDS = {
        'joy': ['happy', 'joy', 'love', 'awesome', 'excellent', 'amazing', 'great', 'wonderful', 
                'fantastic', 'brilliant', 'thrilled', 'delighted', 'blessed', 'grateful', 'proud',
                'cheerful', 'excited', 'pleased', 'satisfied', 'ecstatic', 'blissful', 'gleeful'],
        
        'anger': ['angry', 'furious', 'hate', 'terrible', 'awful', 'horrible', 'disgusting',
                  'infuriating', 'outrageous', 'enraged', 'livid', 'irate', 'pissed', 'mad',
                  'irritated', 'frustrated', 'annoyed', 'exasperated', 'raging', 'seething'],
        
        'sadness': ['sad', 'disappointed', 'upset', 'miserable', 'depressed', 'heartbroken',
                   'devastated', 'unhappy', 'sorrowful', 'melancholic', 'gloomy', 'dejected',
                   'downhearted', 'forlorn', 'despondent', 'grief', 'mourning', 'weeping'],
        
        'fear': ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'nervous', 'worried',
                'panic', 'dread', 'horror', 'petrified', 'alarmed', 'apprehensive', 'uneasy',
                'concerned', 'fear', 'fright', 'intimidated', 'spooked', 'jittery'],
        
        'surprise': ['shocked', 'surprised', 'astonished', 'amazed', 'unexpected', 'astounded',
                    'stunned', 'wonder', 'bewildered', 'flabbergasted', 'awestruck', 'startled',
                    'taken aback', 'blindsided', 'caught off guard', 'amazement', 'wow'],
        
        'disgust': ['disgusting', 'gross', 'revolting', 'repulsive', 'vile', 'nasty', 'sickening',
                   'abhorrent', 'loathsome', 'contemptible', 'detestable', 'nauseated', 'repugnant',
                   'yuck', 'ew', 'distasteful', 'offensive', 'appalling'],
        
        'trust': ['trust', 'reliable', 'trustworthy', 'dependable', 'honest', 'confident',
                 'secure', 'safe', 'faith', 'confidence', 'believe', 'credible', 'authentic',
                 'genuine', 'faithful', 'loyal', 'assured', 'certain'],
        
        'anticipation': ['excited', 'looking forward', 'can\'t wait', 'anticipate', 'expect',
                        'hopeful', 'hopeful', 'eager', 'keen', 'enthusiastic', 'optimistic',
                        'confident', 'promise', 'upcoming', 'future', 'coming soon']
    }
    
    EMOTION_INTENSITIES = {
        'very_low': 0.1,
        'low': 0.3,
        'moderate': 0.6,
        'high': 0.8,
        'very_high': 1.0
    }
    
    INTENSIFIER_WORDS = ['very', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely',
                        'utterly', 'so', 'really', 'quite', 'rather', 'fairly', 'pretty']
    
    def detect_emotions(self, text: str) -> Dict:
        """
        Detect all emotions in text with confidence scores.
        Returns primary, secondary emotions and detailed breakdown.
        """
        text_lower = text.lower()
        emotion_scores = {}
        
        # Calculate emotion scores
        for emotion, keywords in self.EMOTION_KEYWORDS.items():
            score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    # Check for intensifiers
                    intensity = self._check_intensifiers(text_lower, keyword)
                    score += intensity
            
            emotion_scores[emotion] = round(score, 2)
        
        # Normalize scores
        max_score = max(emotion_scores.values()) if emotion_scores else 0
        if max_score > 0:
            normalized_scores = {k: round(v / max_score * 100, 2) for k, v in emotion_scores.items()}
        else:
            normalized_scores = {k: 0 for k in emotion_scores.keys()}
        
        # Get primary emotion
        if max_score > 0:
            primary_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]
            primary_confidence = normalized_scores[primary_emotion]
        else:
            primary_emotion = 'neutral'
            primary_confidence = 0
        
        # Get secondary emotions (top 2 excluding primary)
        sorted_emotions = sorted(normalized_scores.items(), key=lambda x: x[1], reverse=True)
        secondary_emotions = [e[0] for e in sorted_emotions[1:3] if e[1] > 5]
        
        return {
            'primary_emotion': primary_emotion,
            'primary_confidence': primary_confidence,
            'secondary_emotions': secondary_emotions,
            'all_emotions': normalized_scores,
            'emotion_intensity': self._calculate_intensity(normalized_scores),
            'mixed_emotions': len([e for e in normalized_scores.values() if e > 20]) > 1
        }
    
    def _check_intensifiers(self, text: str, keyword: str) -> float:
        """Check if keyword has intensifiers nearby"""
        pattern = r'(\w+\s+)*' + re.escape(keyword)
        matches = re.finditer(pattern, text)
        
        max_intensity = 1.0
        for match in matches:
            matched_text = text[max(0, match.start()-50):match.end()]
            intensity = 1.0
            
            for intensifier in self.INTENSIFIER_WORDS:
                if intensifier in matched_text:
                    intensity = 1.5
                    break
            
            max_intensity = max(max_intensity, intensity)
        
        return min(max_intensity, 2.0)
    
    def _calculate_intensity(self, emotion_scores: Dict) -> str:
        """Calculate overall emotional intensity"""
        max_score = max(emotion_scores.values()) if emotion_scores else 0
        
        if max_score == 0:
            return 'none'
        elif max_score < 20:
            return 'very_low'
        elif max_score < 40:
            return 'low'
        elif max_score < 60:
            return 'moderate'
        elif max_score < 80:
            return 'high'
        else:
            return 'very_high'
    
    def batch_detect_emotions(self, texts: List[str]) -> List[Dict]:
        """Detect emotions for multiple texts"""
        return [self.detect_emotions(text) for text in texts]
    
    def get_emotion_distribution(self, texts: List[str]) -> Dict:
        """Get overall emotion distribution across texts"""
        results = self.batch_detect_emotions(texts)
        primary_emotions = [r['primary_emotion'] for r in results]
        emotion_counts = Counter(primary_emotions)
        
        return {
            'total_texts': len(texts),
            'emotion_distribution': dict(emotion_counts),
            'dominant_emotion': emotion_counts.most_common(1)[0][0] if emotion_counts else 'neutral',
            'diversity_score': round(len(emotion_counts) / len(self.EMOTION_KEYWORDS), 2)
        }


class EmotionalNuanceAnalyzer:
    """Analyzes emotional nuances and tone shifts within text"""
    
    def analyze_nuances(self, text: str) -> Dict:
        """
        Analyze emotional nuances like sarcasm, mixed emotions, tone shifts
        """
        lines = text.split('\n')
        nuances = {
            'contains_sarcasm': self._detect_sarcasm(text),
            'contains_mixed_emotions': self._detect_mixed_emotions(text),
            'tone_shifts': self._detect_tone_shifts(lines),
            'emotional_progression': self._analyze_progression(lines)
        }
        
        return nuances
    
    def _detect_sarcasm(self, text: str) -> bool:
        """Detect potential sarcasm"""
        sarcasm_indicators = ['right', 'sure', 'yeah right', 'oh sure', 'that\'s great', 'perfect']
        text_lower = text.lower()
        
        # Check for exclamation marks combined with negative words
        has_exclamation = '!' in text
        has_negative = any(word in text_lower for word in ['bad', 'terrible', 'awful', 'horrible'])
        
        return has_exclamation and has_negative or any(ind in text_lower for ind in sarcasm_indicators)
    
    def _detect_mixed_emotions(self, text: str) -> bool:
        """Detect presence of conflicting emotions"""
        positive_words = ['good', 'great', 'happy', 'love', 'excellent']
        negative_words = ['bad', 'terrible', 'sad', 'hate', 'awful']
        
        text_lower = text.lower()
        has_positive = any(word in text_lower for word in positive_words)
        has_negative = any(word in text_lower for word in negative_words)
        
        return has_positive and has_negative
    
    def _detect_tone_shifts(self, lines: List[str]) -> List[str]:
        """Detect shifts in emotional tone across lines"""
        shifts = []
        prev_sentiment = None
        
        for i, line in enumerate(lines):
            if not line.strip():
                continue
            
            if any(word in line.lower() for word in ['but', 'however', 'yet', 'though']):
                shifts.append(f"Line {i+1}: Tone shift detected")
            
            prev_sentiment = line
        
        return shifts
    
    def _analyze_progression(self, lines: List[str]) -> str:
        """Analyze how emotions progress through text"""
        if len(lines) < 2:
            return 'insufficient_data'
        
        start = lines[0].lower()
        end = lines[-1].lower()
        
        positive_words = ['good', 'great', 'happy', 'love', 'excellent']
        negative_words = ['bad', 'terrible', 'sad', 'hate', 'awful']
        
        start_positive = sum(1 for word in positive_words if word in start)
        start_negative = sum(1 for word in negative_words if word in start)
        end_positive = sum(1 for word in positive_words if word in end)
        end_negative = sum(1 for word in negative_words if word in end)
        
        if end_positive > start_positive:
            return 'improving'
        elif end_negative > start_negative:
            return 'deteriorating'
        else:
            return 'stable'


def get_advanced_emotion_detector():
    """Factory function to get emotion detector instance"""
    return AdvancedEmotionDetector()


def get_nuance_analyzer():
    """Factory function to get nuance analyzer instance"""
    return EmotionalNuanceAnalyzer()
