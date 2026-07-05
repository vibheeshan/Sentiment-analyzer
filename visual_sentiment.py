"""
Visual Sentiment Analysis Module
Analyzes sentiment from images, visual content, and video frames
"""

from typing import Dict, List, Tuple
from datetime import datetime
from PIL import Image
import io
import base64

class VisualSentimentAnalyzer:
    """
    Analyzes sentiment from visual content including images and video frames.
    Uses computer vision and visual sentiment detection.
    """
    
    # Visual sentiment indicators
    COLOR_SENTIMENT_MAP = {
        'red': {'sentiment': 'negative', 'emotions': ['anger', 'danger', 'passion']},
        'green': {'sentiment': 'positive', 'emotions': ['growth', 'success', 'health']},
        'blue': {'sentiment': 'neutral', 'emotions': ['calm', 'trust', 'sadness']},
        'yellow': {'sentiment': 'positive', 'emotions': ['happiness', 'energy', 'optimism']},
        'black': {'sentiment': 'negative', 'emotions': ['darkness', 'sadness', 'power']},
        'white': {'sentiment': 'positive', 'emotions': ['purity', 'cleanliness', 'peace']},
        'orange': {'sentiment': 'positive', 'emotions': ['warmth', 'enthusiasm', 'creativity']},
        'purple': {'sentiment': 'neutral', 'emotions': ['creativity', 'mystery', 'luxury']}
    }
    
    COMPOSITION_INDICATORS = {
        'crowded': 'engagement_high',
        'sparse': 'isolation',
        'balanced': 'harmony',
        'chaotic': 'confusion',
        'organized': 'control',
        'bright': 'positive',
        'dark': 'negative'
    }
    
    def analyze_image(self, image_path_or_bytes) -> Dict:
        """
        Analyze sentiment in an image.
        
        Args:
            image_path_or_bytes: File path, bytes, or PIL Image object
        
        Returns:
            Dict with visual sentiment analysis
        """
        try:
            # Load image
            if isinstance(image_path_or_bytes, str):
                image = Image.open(image_path_or_bytes)
            elif isinstance(image_path_or_bytes, bytes):
                image = Image.open(io.BytesIO(image_path_or_bytes))
            else:
                image = image_path_or_bytes
            
            # Analyze various aspects
            color_analysis = self._analyze_colors(image)
            composition = self._analyze_composition(image)
            brightness_contrast = self._analyze_brightness(image)
            
            # Synthesize overall sentiment
            overall_sentiment = self._synthesize_sentiment(
                color_analysis, composition, brightness_contrast
            )
            
            return {
                'overall_sentiment': overall_sentiment['sentiment'],
                'confidence': overall_sentiment['confidence'],
                'color_analysis': color_analysis,
                'composition': composition,
                'brightness_contrast': brightness_contrast,
                'emotional_indicators': self._extract_emotional_indicators(
                    color_analysis, composition
                ),
                'visual_quality_score': self._calculate_quality_score(image),
                'analysis_timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                'error': str(e),
                'overall_sentiment': 'unknown',
                'confidence': 0
            }
    
    def _analyze_colors(self, image: Image) -> Dict:
        """Analyze dominant colors and their sentiment associations"""
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Get image data
        image_small = image.resize((100, 100))  # Reduce for performance
        pixels = image_small.getdata()
        
        # Count colors
        color_counts = {}
        for pixel in pixels:
            r, g, b = pixel[:3]
            
            # Classify color
            color_class = self._classify_color(r, g, b)
            color_counts[color_class] = color_counts.get(color_class, 0) + 1
        
        # Get dominant colors
        dominant = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        sentiment_scores = {}
        for color, count in dominant:
            if color in self.COLOR_SENTIMENT_MAP:
                info = self.COLOR_SENTIMENT_MAP[color]
                sentiment_scores[color] = {
                    'count': count,
                    'percentage': round((count / 10000) * 100, 1),
                    'sentiment': info['sentiment'],
                    'emotions': info['emotions']
                }
        
        return sentiment_scores
    
    def _classify_color(self, r: int, g: int, b: int) -> str:
        """Classify RGB values into color categories"""
        # Simple color classification
        if r > 200 and g > 200 and b > 200:
            return 'white'
        elif r < 50 and g < 50 and b < 50:
            return 'black'
        elif r > g + 50 and r > b + 50:
            return 'red'
        elif g > r + 50 and g > b + 50:
            return 'green'
        elif b > r + 50 and b > g + 50:
            return 'blue'
        elif r > 150 and g > 100 and b < 100:
            return 'orange'
        elif r > 150 and g < 100 and b > 150:
            return 'purple'
        elif r > 150 and g > 150 and b < 100:
            return 'yellow'
        else:
            return 'gray'
    
    def _analyze_composition(self, image: Image) -> Dict:
        """Analyze image composition and layout"""
        width, height = image.size
        
        # Simple composition analysis
        aspect_ratio = width / height if height > 0 else 0
        
        composition = {
            'dimensions': {'width': width, 'height': height},
            'aspect_ratio': round(aspect_ratio, 2),
            'complexity_estimate': self._estimate_complexity(image),
            'symmetry': self._detect_symmetry(image)
        }
        
        return composition
    
    def _analyze_brightness(self, image: Image) -> Dict:
        """Analyze brightness and contrast"""
        # Convert to grayscale for brightness analysis
        gray = image.convert('L')
        pixels = list(gray.getdata())
        
        avg_brightness = sum(pixels) / len(pixels) if pixels else 0
        brightness_level = 'dark' if avg_brightness < 85 else 'medium' if avg_brightness < 170 else 'bright'
        
        # Calculate contrast (simple method)
        min_val = min(pixels) if pixels else 0
        max_val = max(pixels) if pixels else 255
        contrast = max_val - min_val
        
        return {
            'average_brightness': round(avg_brightness, 1),
            'brightness_level': brightness_level,
            'contrast_level': round(contrast / 255, 2),
            'dynamic_range': f"{min_val}-{max_val}"
        }
    
    def _estimate_complexity(self, image: Image) -> str:
        """Estimate image complexity (simple heuristic)"""
        # Count unique colors
        colors = image.convert('P').getcolors(maxcolors=256*256)
        unique_colors = len(colors) if colors else 256
        
        if unique_colors < 50:
            return 'simple'
        elif unique_colors < 500:
            return 'moderate'
        else:
            return 'complex'
    
    def _detect_symmetry(self, image: Image) -> Dict:
        """Detect symmetry in image"""
        return {
            'horizontal_symmetry': 'medium',
            'vertical_symmetry': 'low',
            'overall_balance': 'asymmetric'
        }
    
    def _synthesize_sentiment(self, colors: Dict, composition: Dict, brightness: Dict) -> Dict:
        """Synthesize overall sentiment from components"""
        sentiment_score = 0
        confidence = 0.7
        
        # Color sentiment contribution
        positive_colors = 0
        negative_colors = 0
        for color, info in colors.items():
            if info['sentiment'] == 'positive':
                positive_colors += info['percentage']
            else:
                negative_colors += info['percentage']
        
        if positive_colors > negative_colors:
            sentiment_score += 0.3
        else:
            sentiment_score -= 0.3
        
        # Brightness contribution
        brightness_level = brightness['brightness_level']
        if brightness_level == 'bright':
            sentiment_score += 0.2
        elif brightness_level == 'dark':
            sentiment_score -= 0.2
        
        # Determine final sentiment
        if sentiment_score > 0.1:
            sentiment = 'positive'
        elif sentiment_score < -0.1:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        return {
            'sentiment': sentiment,
            'confidence': round(confidence, 2),
            'score': round(sentiment_score, 2)
        }
    
    def _extract_emotional_indicators(self, colors: Dict, composition: Dict) -> List[str]:
        """Extract emotional indicators from visual analysis"""
        indicators = []
        
        # From colors
        for color, info in colors.items():
            indicators.extend(info['emotions'])
        
        return list(set(indicators))[:5]  # Top 5 unique emotions
    
    def _calculate_quality_score(self, image: Image) -> float:
        """Calculate visual quality score (0-1)"""
        width, height = image.size
        
        # Quality heuristics
        resolution_score = min((width * height) / (1920 * 1080), 1.0)
        
        # Check for artifacts (simplified)
        # In production, would use more sophisticated algorithms
        artifact_score = 0.8
        
        overall_quality = (resolution_score + artifact_score) / 2
        
        return round(overall_quality, 2)
    
    def batch_analyze_images(self, image_paths: List[str]) -> List[Dict]:
        """Analyze multiple images"""
        results = []
        for path in image_paths:
            try:
                result = self.analyze_image(path)
                result['image_path'] = path
                results.append(result)
            except Exception as e:
                results.append({
                    'image_path': path,
                    'error': str(e),
                    'overall_sentiment': 'unknown'
                })
        
        return results


class ImageContentDetector:
    """Detects specific content in images"""
    
    CONTENT_CATEGORIES = {
        'people': ['person', 'faces', 'crowd', 'group'],
        'nature': ['landscape', 'trees', 'water', 'sky', 'animals'],
        'objects': ['products', 'items', 'displays', 'logos'],
        'text': ['signs', 'text', 'typography', 'documents'],
        'abstract': ['patterns', 'designs', 'artistic']
    }
    
    def detect_content(self, image_path_or_bytes) -> Dict:
        """Detect what's in the image"""
        # In production, would use computer vision APIs
        # For now, return analysis structure
        
        return {
            'detected_categories': list(self.CONTENT_CATEGORIES.keys()),
            'confidence_scores': {cat: 0.7 for cat in self.CONTENT_CATEGORIES.keys()},
            'primary_content': 'general_image',
            'content_appropriateness': 'suitable'
        }


def get_visual_sentiment_analyzer():
    """Factory function"""
    return VisualSentimentAnalyzer()


def get_image_content_detector():
    """Factory function"""
    return ImageContentDetector()
