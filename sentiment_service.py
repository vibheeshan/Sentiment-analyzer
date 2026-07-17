try:
    import torch
except ImportError:  # pragma: no cover - runtime fallback
    torch = None

try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    TRANSFORMERS_AVAILABLE = True
except ImportError:  # pragma: no cover - runtime fallback
    pipeline = None
    AutoTokenizer = None
    AutoModelForSequenceClassification = None
    TRANSFORMERS_AVAILABLE = False

import json
from typing import List, Dict, Tuple
import warnings
import re

try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    NLTK_AVAILABLE = True
except ImportError:
    nltk = None
    stopwords = None
    word_tokenize = None
    NLTK_AVAILABLE = False

warnings.filterwarnings('ignore')

# Download required NLTK data if available
if NLTK_AVAILABLE:
    try:
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
    except Exception:
        pass

class SentimentAnalyzer:
    def __init__(self):
        try:
            self.device = 0 if torch is not None and torch.cuda.is_available() else -1
        except Exception:
            self.device = -1

        if not TRANSFORMERS_AVAILABLE or pipeline is None:
            print("Warning: transformers is not available. Using rule-based fallback for sentiment analysis.")
            self.sentiment_model = None
            self.using_transformer_sentiment = False
            self.multilang_model = None
            self.using_multilang = False
            self.emotion_model = None
            self.using_transformer_emotion = False
            return
        
        # Sentiment analysis model
        try:
            self.sentiment_model = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=self.device
            )
            self.using_transformer_sentiment = True
        except Exception as e:
            print(f"Warning: Failed to load Transformer sentiment model: {e}. Using rule-based fallback.")
            self.sentiment_model = None
            self.using_transformer_sentiment = False
        
        # Multilingual sentiment model
        try:
            self.multilang_model = pipeline(
                "sentiment-analysis",
                model="lxyuan/distilbert-base-multilingual-cased-sentiments-student",
                device=self.device
            )
            self.using_multilang = True
        except Exception as e:
            print(f"Warning: Failed to load Multilingual sentiment model: {e}. Using English fallbacks.")
            self.multilang_model = None
            self.using_multilang = False

        # Emotion detection model (if available)
        try:
            self.emotion_model = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                device=self.device
            )
            self.using_transformer_emotion = True
        except Exception as e:
            print(f"Warning: Failed to load Transformer emotion model: {e}. Using rule-based/keyword fallback.")
            self.emotion_model = None
            self.using_transformer_emotion = False
    
    def detect_language(self, text: str) -> str:
        """Detect language of the input text, falling back to regex if langdetect is unavailable"""
        try:
            from langdetect import detect
            return detect(text)
        except ImportError:
            # Check for non-Latin scripts using unicode ranges
            if re.search(r'[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]', text):  # CJK
                return 'zh'  # generic Asian classification
            if re.search(r'[\u0400-\u04FF]', text):  # Cyrillic
                return 'ru'
            if re.search(r'[\u0600-\u06FF]', text):  # Arabic
                return 'ar'
            if re.search(r'[\u0900-\u097F]', text):  # Devanagari (Hindi)
                return 'hi'
            
            # Simple keyword matching for common European languages
            text_lower = text.lower().split()
            spanish_words = {'el', 'la', 'los', 'las', 'un', 'una', 'y', 'en', 'es', 'con', 'por'}
            french_words = {'le', 'la', 'les', 'un', 'une', 'et', 'en', 'est', 'avec', 'pour', 'dans'}
            german_words = {'der', 'die', 'das', 'und', 'ist', 'in', 'mit', 'zu', 'von', 'dem'}
            
            words_set = set(text_lower)
            if words_set.intersection(spanish_words):
                return 'es'
            if words_set.intersection(french_words):
                return 'fr'
            if words_set.intersection(german_words):
                return 'de'
                
            return 'en'

    def analyze(self, text: str) -> Dict:
        """Analyze sentiment and emotion of a single text"""
        sentiment_res = self.analyze_sentiment(text)
        emotion_res = self.analyze_emotion(text)
        
        return {
            'sentiment': sentiment_res.get('sentiment', 'Neutral'),
            'confidence': sentiment_res.get('confidence', 0.0),
            'emotion': emotion_res.get('emotion', 'Neutral'),
            'emotion_scores': emotion_res.get('scores', {}),
            'language': sentiment_res.get('language', 'en')
        }
    
    def _rule_based_sentiment(self, text: str) -> Dict:
        """Rule-based fallback sentiment scoring (lexicon search)"""
        pos_words = {'good', 'great', 'awesome', 'excellent', 'amazing', 'wonderful', 'fantastic', 
                     'love', 'best', 'satisfied', 'happy', 'perfect', 'nice', 'helpful', 'fast', 'smooth'}
        neg_words = {'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'disappointed', 
                     'broken', 'slow', 'defect', 'useless', 'rude', 'expensive', 'hate', 'waste'}
        
        words = text.lower().split()
        pos_count = sum(1 for w in words if w in pos_words)
        neg_count = sum(1 for w in words if w in neg_words)
        
        total = pos_count + neg_count
        if total == 0:
            return {'sentiment': 'Neutral', 'confidence': 50.0}
        
        if pos_count > neg_count:
            sentiment = 'Positive'
            confidence = round((pos_count / total) * 100, 2)
        elif neg_count > pos_count:
            sentiment = 'Negative'
            confidence = round((neg_count / total) * 100, 2)
        else:
            sentiment = 'Neutral'
            confidence = 50.0
            
        return {
            'sentiment': sentiment,
            'confidence': confidence
        }

    def _analyze_sentiment_english(self, text: str) -> Dict:
        """Analyze English sentiment"""
        if not self.using_transformer_sentiment or self.sentiment_model is None:
            return self._rule_based_sentiment(text)
            
        try:
            result = self.sentiment_model(text[:512])[0]  # Limit to 512 tokens
            
            sentiment = result['label'].upper()
            confidence = round(result['score'] * 100, 2)
            
            # Map to standardized labels
            sentiment_map = {
                'POSITIVE': 'Positive',
                'NEGATIVE': 'Negative',
                'NEUTRAL': 'Neutral'
            }
            
            return {
                'sentiment': sentiment_map.get(sentiment, sentiment),
                'confidence': confidence
            }
        except Exception as e:
            return self._rule_based_sentiment(text)

    def analyze_sentiment(self, text: str) -> Dict:
        """Analyze sentiment of a single text with auto-language detection"""
        lang = self.detect_language(text)
        
        # If English or if multilingual model is unavailable, use default English pipeline or fallback
        if lang == 'en' or not self.using_multilang or self.multilang_model is None:
            sentiment_res = self._analyze_sentiment_english(text)
            sentiment_res['language'] = lang
            return sentiment_res
            
        # Use multilingual model
        try:
            result = self.multilang_model(text[:512])[0]
            label = result['label'].upper()
            confidence = round(result['score'] * 100, 2)
            
            # Map multilingual labels
            sentiment_map = {
                'POSITIVE': 'Positive',
                'NEGATIVE': 'Negative',
                'NEUTRAL': 'Neutral',
                'POS': 'Positive',
                'NEG': 'Negative',
                'NEU': 'Neutral'
            }
            
            return {
                'sentiment': sentiment_map.get(label, label.capitalize()),
                'confidence': confidence,
                'language': lang
            }
        except Exception as e:
            # Fall back to English analysis if multilingual prediction fails
            sentiment_res = self._analyze_sentiment_english(text)
            sentiment_res['language'] = lang
            return sentiment_res
    
    def analyze_emotion(self, text: str) -> Dict:
        """Analyze emotion in text"""
        if self.using_transformer_emotion and self.emotion_model:
            try:
                result = self.emotion_model(text[:512])[0]
                return {
                    'emotion': result['label'].capitalize(),
                    'confidence': round(result['score'] * 100, 2),
                    'scores': {}
                }
            except:
                pass
                
        # Fall back to AdvancedEmotionDetector
        try:
            from backend.emotion_advanced import get_advanced_emotion_detector
            detector = get_advanced_emotion_detector()
            res = detector.detect_emotions(text)
            return {
                'emotion': res.get('primary_emotion', 'Neutral').capitalize(),
                'confidence': res.get('primary_confidence', 0.0),
                'scores': res.get('all_emotions', {})
            }
        except Exception as e:
            return {
                'emotion': 'Neutral',
                'confidence': 0.0,
                'scores': {}
            }
    
    def extract_keywords(self, text: str, top_n: int = 5) -> List[str]:
        """Extract top keywords from text"""
        try:
            if NLTK_AVAILABLE and word_tokenize is not None and stopwords is not None:
                tokens = word_tokenize(text.lower())
                stop_words = set(stopwords.words('english'))
            else:
                tokens = re.findall(r"[A-Za-z']+", text.lower())
                stop_words = set({
                    'the', 'and', 'for', 'that', 'have', 'with', 'this', 'your', 'from',
                    'were', 'very', 'they', 'will', 'been', 'more', 'than', 'into', 'about'
                })
            
            # Filter stopwords and short tokens
            keywords = [
                token for token in tokens
                if token.isalnum() and len(token) > 3 and token not in stop_words
            ]
            
            # Count frequency
            from collections import Counter
            freq = Counter(keywords)
            return [word for word, count in freq.most_common(top_n)]
        except Exception:
            return []
    
    def batch_analyze(self, texts: List[str]) -> List[Dict]:
        """Analyze multiple texts"""
        results = []
        for text in texts:
            sentiment_result = self.analyze_sentiment(text)
            emotion_result = self.analyze_emotion(text)
            keywords = self.extract_keywords(text)
            
            results.append({
                'text': text,
                'sentiment': sentiment_result.get('sentiment'),
                'confidence': sentiment_result.get('confidence'),
                'emotion': emotion_result.get('emotion'),
                'emotion_confidence': emotion_result.get('confidence'),
                'keywords': keywords
            })
        
        return results


class CloudAISentimentAnalyzer:
    """Placeholder for Cloud AI (Google Gemini or similar)"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.model_name = "gemini-pro"  # Google Gemini (can be adapted)
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Analyze sentiment using cloud AI"""
        try:
            # This would use Google Gemini API or similar
            # For now, returning mock implementation
            import random
            
            sentiments = ['Positive', 'Negative', 'Neutral']
            sentiment = random.choice(sentiments)
            confidence = round(random.uniform(0.65, 0.99) * 100, 2)
            
            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'model': self.model_name
            }
        except Exception as e:
            return {
                'sentiment': 'Neutral',
                'confidence': 0,
                'error': str(e)
            }
    
    def batch_analyze(self, texts: List[str]) -> List[Dict]:
        """Analyze multiple texts with cloud AI"""
        results = []
        for text in texts:
            result = self.analyze_sentiment(text)
            results.append({
                'text': text,
                **result
            })
        return results


class AIHandler:
    """Handle switching between AI modes"""
    
    def __init__(self):
        self.browser_ai = SentimentAnalyzer()
        self.cloud_ai = CloudAISentimentAnalyzer()
    
    def analyze(self, texts: List[str], mode: str = 'browser') -> List[Dict]:
        """
        Analyze texts using specified AI mode
        
        Args:
            texts: List of text entries to analyze
            mode: 'browser' or 'cloud'
        
        Returns:
            List of analysis results
        """
        if mode.lower() == 'cloud':
            return self.cloud_ai.batch_analyze(texts)
        else:
            return self.browser_ai.batch_analyze(texts)


# Global analyzer instance
sentiment_analyzer = None

def get_sentiment_analyzer():
    global sentiment_analyzer
    if sentiment_analyzer is None:
        sentiment_analyzer = SentimentAnalyzer()
    return sentiment_analyzer

def get_ai_handler():
    return AIHandler()
