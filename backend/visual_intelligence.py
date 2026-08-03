"""
Visual Intelligence & Multimodal Sentiment Analysis
Logo detection, object recognition, visual mentions, and image-based insights.
Inspired by YouScan, Talkwalker visual analytics, and Brandwatch image analysis.
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import re
from datetime import datetime

@dataclass
class VisualMention:
    """Represents a brand/object mention detected visually."""
    detected_object: str
    confidence: float
    location: str  # e.g., "center", "background", "top-left"
    sentiment_context: str
    image_context: str
    timestamp: str


class VisualIntelligenceAnalyzer:
    """
    Enterprise-grade visual sentiment analysis.
    Detects brand logos, objects, scenes, and infers sentiment from visual context.
    Bridges the gap between text mentions and visual brand presence.
    """
    
    # Known brand logo characteristics (production would use actual ML models)
    LOGO_SIGNATURES = {
        'tech': {
            'colors': ['blue', 'white', 'silver', 'black', 'gray'],
            'shapes': ['rounded', 'geometric', 'minimalist', 'clean'],
            'patterns': ['bitten apple', 'swoosh', 'three stripes', 'interlocking circles']
        },
        'fashion': {
            'colors': ['black', 'gold', 'white', 'red', 'navy'],
            'shapes': ['monogram', 'lettering', 'emblem', 'crest'],
            'patterns': ['luxury', 'heritage', 'signature', 'symbol']
        },
        'food': {
            'colors': ['red', 'yellow', 'orange', 'green', 'blue'],
            'shapes': ['rounded', 'playful', 'bold', 'dynamic'],
            'patterns': ['arches', 'crown', 'shell', 'coffee cup']
        },
        'finance': {
            'colors': ['green', 'blue', 'silver', 'gold', 'black'],
            'shapes': ['shield', 'geometric', 'modern', 'minimalist'],
            'patterns': ['security', 'growth', 'stability', 'trust']
        }
    }
    
    # Object categories and sentiment associations
    VISUAL_SENTIMENT_CUES = {
        'positive_visual_cues': [
            'smiling faces', 'bright colors', 'clean environment', 'organized',
            'professional setting', 'happy customers', 'product in use', 'beautiful setting',
            'luxury presentation', 'well-lit', 'high quality photography', 'polished'
        ],
        'negative_visual_cues': [
            'damaged products', 'dirty', 'poorly lit', 'blurry', 'cluttered',
            'unprofessional', 'broken items', 'worn out', 'cheap looking',
            'chaotic', 'low quality', 'disorganized', 'sad faces'
        ],
        'neutral_visual_cues': [
            'product photo', 'catalog image', 'technical diagram', 'standard layout',
            'informational graphic', 'screenshot', 'office setting', 'generic'
        ]
    }
    
    # Scene context interpretation
    SCENE_SENTIMENT_MAP = {
        'use_case_positive': [
            'person enjoying product', 'successful outcome', 'attractive setting',
            'professional environment', 'achievement moment', 'celebration', 'success'
        ],
        'use_case_negative': [
            'product failure', 'damaged goods', 'unhappy user', 'problematic situation',
            'emergency', 'crisis', 'negative outcome', 'frustration'
        ]
    }
    
    # Composition analysis rules
    COMPOSITION_RULES = {
        'balance': {
            'positive': ['centered', 'symmetrical', 'rule of thirds', 'well-composed'],
            'negative': ['off-center', 'chaotic', 'unbalanced', 'cluttered']
        },
        'framing': {
            'positive': ['full product visible', 'clean background', 'focused', 'clear subject'],
            'negative': ['partially hidden', 'obscured', 'distracted', 'poor cropping']
        },
        'lighting': {
            'positive': ['well-lit', 'professional lighting', 'shadows enhance', 'natural'],
            'negative': ['dark', 'harsh shadows', 'overexposed', 'poor contrast']
        }
    }
    
    def detect_visual_mentions(self, image_description: str, context_text: str = "") -> List[VisualMention]:
        """
        Detect brand/object mentions from image analysis.
        
        In production, this would use actual ML models like:
        - YOLOv8 for object detection
        - ResNet for scene understanding
        - Custom logo recognition models
        - Optical Character Recognition (OCR)
        
        Args:
            image_description: Text description or metadata about image
            context_text: Surrounding text context (caption, comments, etc.)
            
        Returns:
            List of detected visual mentions with confidence
        """
        mentions = []
        
        # Detect objects in image
        objects = self._detect_objects(image_description)
        
        # Detect logos
        logos = self._detect_logos(image_description)
        
        # Analyze composition
        composition_sentiment = self._analyze_composition(image_description)
        
        # Combine all detections
        for obj in objects:
            sentiment_context = self._infer_visual_sentiment(obj, image_description, context_text)
            mentions.append(VisualMention(
                detected_object=obj,
                confidence=0.75,  # Would be from ML model
                location=self._infer_object_location(image_description, obj),
                sentiment_context=sentiment_context,
                image_context=image_description,
                timestamp=datetime.now().isoformat()
            ))
        
        for logo in logos:
            mentions.append(VisualMention(
                detected_object=f"logo:{logo}",
                confidence=0.85,
                location="variable",
                sentiment_context=composition_sentiment,
                image_context=image_description,
                timestamp=datetime.now().isoformat()
            ))
        
        return mentions
    
    def _detect_objects(self, image_desc: str) -> List[str]:
        """Detect objects in image description."""
        keywords = ['product', 'person', 'people', 'group', 'scene', 'setting', 'environment',
                   'object', 'item', 'packaging', 'logo', 'text', 'interface', 'design']
        
        detected = []
        for keyword in keywords:
            if keyword in image_desc.lower():
                detected.append(keyword)
        
        return detected
    
    def _detect_logos(self, image_desc: str) -> List[str]:
        """Detect brand logos in image."""
        logo_keywords = ['logo', 'brand', 'trademark', 'symbol', 'emblem', 'icon', 'badge']
        
        logos = []
        for keyword in logo_keywords:
            if keyword in image_desc.lower():
                logos.append(keyword)
        
        return logos
    
    def _infer_visual_sentiment(self, obj: str, image_desc: str, context: str) -> str:
        """Infer sentiment from visual context."""
        full_text = f"{image_desc} {context}".lower()
        
        positive_count = sum(1 for cue in self.VISUAL_SENTIMENT_CUES['positive_visual_cues'] 
                            if cue in full_text)
        negative_count = sum(1 for cue in self.VISUAL_SENTIMENT_CUES['negative_visual_cues']
                            if cue in full_text)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    def _infer_object_location(self, image_desc: str, obj: str) -> str:
        """Infer location of object in image."""
        locations = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right',
                    'background', 'foreground', 'left', 'right', 'top', 'bottom']
        
        for location in locations:
            if location in image_desc.lower():
                return location
        
        return 'variable'
    
    def _analyze_composition(self, image_desc: str) -> str:
        """Analyze visual composition for sentiment."""
        positive_rules = sum(1 for rule in self.COMPOSITION_RULES['balance']['positive'] 
                            if rule in image_desc.lower())
        negative_rules = sum(1 for rule in self.COMPOSITION_RULES['balance']['negative']
                            if rule in image_desc.lower())
        
        if positive_rules > negative_rules:
            return 'positive'
        elif negative_rules > positive_rules:
            return 'negative'
        else:
            return 'neutral'
    
    def analyze_scene_sentiment(self, image_description: str) -> Dict:
        """
        Analyze overall scene sentiment from visual composition.
        Returns sentiment inferred purely from visual elements.
        """
        desc_lower = image_description.lower()
        
        # Count visual sentiment indicators
        positive_indicators = sum(1 for cue in self.VISUAL_SENTIMENT_CUES['positive_visual_cues']
                                 if cue in desc_lower)
        negative_indicators = sum(1 for cue in self.VISUAL_SENTIMENT_CUES['negative_visual_cues']
                                 if cue in desc_lower)
        
        total = max(positive_indicators + negative_indicators, 1)
        
        return {
            'visual_sentiment': 'positive' if positive_indicators > negative_indicators 
                               else 'negative' if negative_indicators > positive_indicators
                               else 'neutral',
            'positive_score': positive_indicators / total,
            'negative_score': negative_indicators / total,
            'visual_quality': self._assess_visual_quality(image_description),
            'professionalism': self._assess_professionalism(image_description)
        }
    
    def _assess_visual_quality(self, image_desc: str) -> float:
        """Assess overall visual quality (0-1)."""
        quality_indicators = ['professional', 'high quality', 'clear', 'well-lit', 'polished',
                            'clean', 'organized', 'sharp', 'vibrant', 'balanced']
        
        count = sum(1 for indicator in quality_indicators if indicator in image_desc.lower())
        return min(count / len(quality_indicators), 1.0)
    
    def _assess_professionalism(self, image_desc: str) -> float:
        """Assess professional appearance (0-1)."""
        professional_indicators = ['professional', 'polished', 'premium', 'luxury', 'elegant',
                                 'sophisticated', 'refined', 'high-end', 'modern']
        
        count = sum(1 for indicator in professional_indicators if indicator in image_desc.lower())
        return min(count / len(professional_indicators), 1.0)
    
    def find_brand_visibility(self, images_descriptions: List[str]) -> Dict[str, int]:
        """
        Find overall brand visibility across multiple images.
        Counts how many images feature the brand prominently.
        """
        visibility = {
            'primary': 0,      # Brand is main subject
            'secondary': 0,    # Brand visible but not main
            'background': 0,   # Brand barely visible
            'not_visible': 0   # Brand not visible
        }
        
        for desc in images_descriptions:
            # Heuristic: longer/more detailed descriptions = more prominent placement
            words = len(desc.split())
            
            if any(term in desc.lower() for term in ['primary', 'main', 'focus', 'featured']):
                visibility['primary'] += 1
            elif any(term in desc.lower() for term in ['logo', 'brand', 'visible', 'shown']):
                visibility['secondary'] += 1
            elif any(term in desc.lower() for term in ['background', 'behind', 'subtle']):
                visibility['background'] += 1
            else:
                visibility['not_visible'] += 1
        
        return visibility
    
    def analyze_ugc_sentiment(self, ugc_images_with_context: List[Tuple[str, str]]) -> Dict:
        """
        Analyze sentiment from user-generated content images.
        Detects brand visibility in UGC where brand is often not mentioned in text.
        
        Args:
            ugc_images_with_context: List of (image_description, caption/context) tuples
            
        Returns:
            Aggregate sentiment from UGC analysis
        """
        ugc_sentiment = {
            'positive': 0,
            'negative': 0,
            'neutral': 0,
            'brand_visibility_score': 0.0,
            'authenticity_score': 0.0
        }
        
        for img_desc, caption in ugc_images_with_context:
            # Analyze visual sentiment
            visual_sent = self.analyze_scene_sentiment(img_desc)
            
            # Map to sentiment
            if visual_sent['visual_sentiment'] == 'positive':
                ugc_sentiment['positive'] += 1
            elif visual_sent['visual_sentiment'] == 'negative':
                ugc_sentiment['negative'] += 1
            else:
                ugc_sentiment['neutral'] += 1
            
            # Check brand visibility
            mentions = self.detect_visual_mentions(img_desc, caption)
            if mentions:
                ugc_sentiment['brand_visibility_score'] += 0.3
        
        total = len(ugc_images_with_context) or 1
        ugc_sentiment['brand_visibility_score'] /= total
        ugc_sentiment['authenticity_score'] = 0.8  # UGC is inherently authentic
        
        return ugc_sentiment
    
    def compare_visual_brand_presence(self, own_brand_images: List[str], 
                                     competitor_images: List[str]) -> Dict:
        """
        Compare visual brand presence with competitors.
        Useful for understanding relative visual impact.
        """
        own_quality = sum(self._assess_visual_quality(img) for img in own_brand_images) / max(len(own_brand_images), 1)
        comp_quality = sum(self._assess_visual_quality(img) for img in competitor_images) / max(len(competitor_images), 1)
        
        own_prof = sum(self._assess_professionalism(img) for img in own_brand_images) / max(len(own_brand_images), 1)
        comp_prof = sum(self._assess_professionalism(img) for img in competitor_images) / max(len(competitor_images), 1)
        
        return {
            'own_visual_quality': own_quality,
            'competitor_quality': comp_quality,
            'quality_advantage': own_quality - comp_quality,
            'own_professionalism': own_prof,
            'competitor_professionalism': comp_prof,
            'professionalism_advantage': own_prof - comp_prof,
            'recommendation': 'Invest in visual content' if own_quality < comp_quality else 'Maintain visual strategy'
        }
