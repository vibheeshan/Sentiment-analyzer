"""
Generative AI & Intelligent Narratives
LLM-powered summaries, AI copilots, and automated insight generation.
Inspired by Brandwatch Iris AI, Talkwalker Yeti, Meltwater Mira, and YouScan Copilot.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import re

@dataclass
class AIInsight:
    """Represents an AI-generated insight."""
    title: str
    narrative: str
    type: str  # summary, trend, anomaly, recommendation, alert
    confidence: float
    source_count: int
    timestamp: str
    supporting_data: Dict


class GenerativeInsightEngine:
    """
    Enterprise-grade generative AI for sentiment analysis.
    Produces human-like narratives explaining "why" sentiment changed,
    automated alerts, and strategic recommendations.
    
    In production, this would use:
    - GPT-4, Claude, or Llama for text generation
    - Specialized fine-tuning for marketing/brand voice
    - RAG (Retrieval-Augmented Generation) for factual grounding
    """
    
    # Insight templates for different scenarios
    INSIGHT_TEMPLATES = {
        'positive_spike': {
            'patterns': [
                "Surge in positive mentions driven by {driver}",
                "Brand sentiment improved {percent}% - attributed to {driver}",
                "{driver} generated significant positive buzz ({mentions} mentions)",
                "Customer enthusiasm peaked due to {driver}"
            ]
        },
        'negative_spike': {
            'patterns': [
                "Crisis alert: {driver} triggered {mentions} negative mentions",
                "Customer dissatisfaction rose {percent}% following {driver}",
                "Reputation risk identified: {driver} is trending negatively",
                "Urgent: {driver} created backlash ({mentions} negative posts)"
            ]
        },
        'trend_emergence': {
            'patterns': [
                "New trend detected: {trend} gaining momentum ({growth}% week-over-week)",
                "Emerging topic: {trend} is now being discussed in {sources} sources",
                "Market shift: {trend} interest rising among {demographic}",
                "Opportunity identified: {trend} presents {opportunity}"
            ]
        },
        'aspect_analysis': {
            'patterns': [
                "Product quality sentiment is {sentiment} ({percent}% positive mentions)",
                "Customer service receives {sentiment} feedback ({count} mentions)",
                "Pricing competitiveness: {sentiment} compared to competitors",
                "{aspect} is the {ranking} concern among customers"
            ]
        }
    }
    
    # Crisis narrative patterns
    CRISIS_NARRATIVES = {
        'quality_issue': {
            'description': "Product quality concerns are escalating",
            'recommended_action': "Investigate product defects and prepare customer communication",
            'escalation_triggers': ['defect', 'broken', 'cheap', 'poor quality', 'disappointed']
        },
        'customer_service': {
            'description': "Customer service satisfaction declining",
            'recommended_action': "Review support processes and allocate additional resources",
            'escalation_triggers': ['rude', 'unresponsive', 'unhelpful', 'poor service', 'ignored']
        },
        'competitive_loss': {
            'description': "Customers switching to competitors",
            'recommended_action': "Competitive analysis and retention campaign needed",
            'escalation_triggers': ['competitor', 'switching', 'better', 'alternative', 'cheaper']
        },
        'ethical_concern': {
            'description': "Ethical or sustainability concerns emerging",
            'recommended_action': "Prepare public statement addressing concerns",
            'escalation_triggers': ['unethical', 'sustainability', 'environment', 'labor', 'scandal']
        }
    }
    
    def generate_summary_narrative(self, sentiment_data: Dict, mention_sample: List[str]) -> AIInsight:
        """
        Generate human-readable summary explaining sentiment state.
        
        Args:
            sentiment_data: Sentiment statistics (positive%, negative%, neutral%)
            mention_sample: Sample of recent mentions
            
        Returns:
            AIInsight with narrative explanation
        """
        positive_pct = sentiment_data.get('positive_percent', 0)
        negative_pct = sentiment_data.get('negative_percent', 0)
        total_mentions = sentiment_data.get('total_mentions', 0)
        
        # Determine primary sentiment
        if positive_pct > 60:
            tone = "very positive"
            pattern = f"Brand sentiment is {tone} with {positive_pct:.0f}% positive mentions"
        elif positive_pct > 40:
            tone = "positive"
            pattern = f"Overall sentiment leans {tone} ({positive_pct:.0f}% positive)"
        elif negative_pct > 60:
            tone = "very negative"
            pattern = f"⚠️ Brand sentiment is concerning at {tone} ({negative_pct:.0f}% negative)"
        elif negative_pct > 40:
            tone = "mixed"
            pattern = f"Sentiment is {tone}, with equal praise and criticism"
        else:
            tone = "neutral"
            pattern = f"Sentiment remains {tone} across monitored conversations"
        
        # Extract themes
        themes = self._extract_themes(mention_sample)
        
        # Build narrative
        narrative = f"{pattern}. " \
                   f"Across {total_mentions} mentions, " \
                   f"key themes include {', '.join(themes[:3])}. " \
                   f"Recommendation: Monitor closely and prioritize {themes[0]} in communications."
        
        return AIInsight(
            title=f"Sentiment Summary: {tone.title()}",
            narrative=narrative,
            type='summary',
            confidence=0.85,
            source_count=total_mentions,
            timestamp=datetime.now().isoformat(),
            supporting_data=sentiment_data
        )
    
    def generate_spike_explanation(self, current_sentiment: Dict, previous_sentiment: Dict,
                                  recent_mentions: List[str], event_context: str = "") -> AIInsight:
        """
        Generate explanation for sudden sentiment changes (spikes/drops).
        Identifies what triggered the change.
        
        Args:
            current_sentiment: Current sentiment distribution
            previous_sentiment: Previous period sentiment
            recent_mentions: Recent mentions from spike period
            event_context: Optional context about events/announcements
            
        Returns:
            AIInsight explaining the spike
        """
        # Calculate change
        sentiment_change = current_sentiment.get('positive_percent', 0) - \
                          previous_sentiment.get('positive_percent', 0)
        change_direction = "increased" if sentiment_change > 0 else "decreased"
        change_magnitude = abs(sentiment_change)
        
        # Identify driver
        driver = self._identify_spike_driver(recent_mentions, event_context)
        
        # Select template
        if sentiment_change > 10:
            templates = self.INSIGHT_TEMPLATES['positive_spike']['patterns']
        elif sentiment_change < -10:
            templates = self.INSIGHT_TEMPLATES['negative_spike']['patterns']
        else:
            templates = self.INSIGHT_TEMPLATES['trend_emergence']['patterns']
        
        # Generate narrative
        narrative = templates[0].format(
            driver=driver,
            percent=f"{change_magnitude:.1f}",
            mentions=len(recent_mentions)
        )
        
        return AIInsight(
            title=f"Sentiment {change_direction.title()} {change_magnitude:.1f}%",
            narrative=narrative,
            type='anomaly',
            confidence=0.80,
            source_count=len(recent_mentions),
            timestamp=datetime.now().isoformat(),
            supporting_data={
                'change_direction': change_direction,
                'change_magnitude': change_magnitude,
                'driver': driver
            }
        )
    
    def _identify_spike_driver(self, mentions: List[str], event_context: str = "") -> str:
        """Identify what caused a sentiment spike."""
        # Look for common drivers
        drivers = {
            'product_launch': ['launch', 'new product', 'announced', 'release', 'debut'],
            'marketing_campaign': ['campaign', 'advertisement', 'ad', 'promotion', 'event'],
            'customer_service': ['support', 'service', 'help', 'response', 'fixed'],
            'pricing': ['price', 'cost', 'discount', 'sale', 'offer', 'deal'],
            'media_coverage': ['news', 'article', 'press', 'featured', 'reported'],
            'competitor': ['competitor', 'vs', 'comparison', 'better than', 'worse than'],
            'technical_issue': ['bug', 'crash', 'error', 'down', 'broken', 'issue'],
            'employee_action': ['employee', 'staff', 'team', 'ceo', 'founder']
        }
        
        mentioned_drivers = []
        combined_text = " ".join(mentions).lower()
        
        for driver, keywords in drivers.items():
            if any(keyword in combined_text for keyword in keywords):
                mentioned_drivers.append(driver)
        
        # If event context provided, include it
        if event_context:
            return event_context
        
        return mentioned_drivers[0] if mentioned_drivers else "market dynamics"
    
    def _extract_themes(self, mentions: List[str]) -> List[str]:
        """Extract top themes from mentions."""
        theme_keywords = {
            'quality': ['quality', 'durable', 'build', 'performance', 'feature'],
            'price': ['price', 'cost', 'value', 'expensive', 'affordable'],
            'service': ['service', 'support', 'helpful', 'responsive', 'customer care'],
            'delivery': ['shipping', 'delivery', 'fast', 'packaging', 'arrival'],
            'user_experience': ['easy', 'difficult', 'interface', 'ux', 'intuitive'],
            'brand': ['brand', 'reputation', 'trust', 'credibility', 'company'],
            'innovation': ['innovative', 'new', 'features', 'technology', 'modern']
        }
        
        combined = " ".join(mentions).lower()
        theme_scores = {}
        
        for theme, keywords in theme_keywords.items():
            score = sum(combined.count(keyword) for keyword in keywords)
            if score > 0:
                theme_scores[theme] = score
        
        # Return top 5 themes
        return [theme for theme, _ in sorted(theme_scores.items(), 
                key=lambda x: x[1], reverse=True)][:5]
    
    def generate_crisis_alert(self, alert_type: str, severity: float,
                             relevant_mentions: List[str]) -> AIInsight:
        """
        Generate crisis alert with recommended actions.
        
        Args:
            alert_type: Type of crisis (quality_issue, customer_service, etc.)
            severity: Severity score (0-1)
            relevant_mentions: Mentions triggering the alert
            
        Returns:
            Crisis alert insight with actions
        """
        crisis_info = self.CRISIS_NARRATIVES.get(alert_type, 
                                                {
                                                    'description': 'Crisis detected',
                                                    'recommended_action': 'Investigate immediately'
                                                })
        
        severity_label = "CRITICAL" if severity > 0.8 else "HIGH" if severity > 0.6 else "MEDIUM"
        
        narrative = f"🚨 {severity_label} ALERT: {crisis_info['description']}. " \
                   f"Detected in {len(relevant_mentions)} recent mentions. " \
                   f"Recommended action: {crisis_info['recommended_action']}. " \
                   f"Escalation risk: {severity:.0%}"
        
        return AIInsight(
            title=f"{severity_label} Crisis: {alert_type.replace('_', ' ').title()}",
            narrative=narrative,
            type='alert',
            confidence=severity,
            source_count=len(relevant_mentions),
            timestamp=datetime.now().isoformat(),
            supporting_data={
                'alert_type': alert_type,
                'severity': severity,
                'recommended_action': crisis_info['recommended_action']
            }
        )
    
    def generate_strategic_recommendation(self, sentiment_trends: Dict,
                                         aspect_analysis: Dict,
                                         market_position: Dict) -> AIInsight:
        """
        Generate strategic recommendations based on sentiment analysis.
        
        Args:
            sentiment_trends: Sentiment trajectory data
            aspect_analysis: Aspect-based sentiment results
            market_position: Competitive positioning data
            
        Returns:
            Strategic insight with recommendations
        """
        # Identify weaknesses and opportunities
        weaknesses = [aspect for aspect, score in aspect_analysis.items() 
                     if score < 0.4]
        strengths = [aspect for aspect, score in aspect_analysis.items() 
                    if score > 0.7]
        
        # Build recommendation narrative
        narrative = f"Based on {sentiment_trends.get('total_mentions', 0)} analyzed mentions: " \
                   f"Your primary strengths are {', '.join(strengths[:2])}. " \
                   f"Key improvement areas: {', '.join(weaknesses[:2])}. " \
                   f"Strategic priorities: " \
                   f"(1) Double down on {strengths[0] if strengths else 'brand voice'}; " \
                   f"(2) Address {weaknesses[0] if weaknesses else 'feedback'}; " \
                   f"(3) Monitor competitive positioning in {market_position.get('threat_area', 'market')}."
        
        return AIInsight(
            title="Strategic Recommendations",
            narrative=narrative,
            type='recommendation',
            confidence=0.75,
            source_count=sentiment_trends.get('total_mentions', 0),
            timestamp=datetime.now().isoformat(),
            supporting_data={
                'strengths': strengths,
                'weaknesses': weaknesses,
                'market_position': market_position
            }
        )
    
    def generate_competitor_comparison_narrative(self, own_sentiment: Dict,
                                                competitor_sentiment: Dict,
                                                competitor_name: str) -> AIInsight:
        """
        Generate narrative comparing sentiment with competitor.
        
        Args:
            own_sentiment: Your brand sentiment metrics
            competitor_sentiment: Competitor sentiment metrics
            competitor_name: Name of competitor
            
        Returns:
            Competitive insight
        """
        own_pos = own_sentiment.get('positive_percent', 0)
        comp_pos = competitor_sentiment.get('positive_percent', 0)
        
        advantage = own_pos - comp_pos
        
        if abs(advantage) < 5:
            status = "at parity with"
            recommendation = "closely monitor competitive moves"
        elif advantage > 10:
            status = "significantly ahead of"
            recommendation = "maintain messaging advantage"
        else:
            status = "behind"
            recommendation = "develop competitive response strategy"
        
        narrative = f"Your brand sentiment ({own_pos:.0f}% positive) is {status} " \
                   f"{competitor_name} ({comp_pos:.0f}% positive). " \
                   f"Sentiment gap: {abs(advantage):.1f} percentage points. " \
                   f"Action: {recommendation}."
        
        return AIInsight(
            title=f"vs {competitor_name}: Competitive Position",
            narrative=narrative,
            type='summary',
            confidence=0.80,
            source_count=max(own_sentiment.get('total_mentions', 0),
                            competitor_sentiment.get('total_mentions', 0)),
            timestamp=datetime.now().isoformat(),
            supporting_data={
                'advantage': advantage,
                'your_sentiment': own_pos,
                'competitor_sentiment': comp_pos
            }
        )
