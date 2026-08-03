"""
Predictive Analytics & Forecasting
90-day trend forecasting, anomaly detection, and predictive sentiment modeling.
Inspired by Talkwalker's 90-day forecasting and Brand24's predictive features.
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import math

@dataclass
class Forecast:
    """Represents a sentiment forecast."""
    forecast_date: str
    predicted_sentiment: float  # 0-1 positive score
    confidence: float
    upper_bound: float
    lower_bound: float
    drivers: List[str]
    recommendations: List[str]


class PredictiveAnalyticsEngine:
    """
    Enterprise-grade predictive sentiment analysis.
    Forecasts sentiment trajectory, detects anomalies, and predicts emerging crises.
    
    In production, would integrate:
    - Time series models (ARIMA, Prophet)
    - Neural networks (LSTM) for pattern detection
    - Bayesian anomaly detection
    - Causal inference for driver identification
    """
    
    # Sentiment trend patterns
    SENTIMENT_PATTERNS = {
        'upward_momentum': {
            'characteristics': ['consistent gains', 'accelerating positive', 'growing interest'],
            'confidence': 0.85,
            'forecast': 'continued growth',
            'risk_level': 'low'
        },
        'downward_momentum': {
            'characteristics': ['consistent declines', 'accelerating negative', 'deteriorating'],
            'confidence': 0.85,
            'forecast': 'further decline likely',
            'risk_level': 'critical'
        },
        'plateau': {
            'characteristics': ['stable', 'flat', 'no trend'],
            'confidence': 0.70,
            'forecast': 'continuation expected',
            'risk_level': 'low'
        },
        'cyclical': {
            'characteristics': ['periodic swings', 'regular fluctuation', 'seasonal'],
            'confidence': 0.65,
            'forecast': 'pattern repetition expected',
            'risk_level': 'medium'
        },
        'volatility': {
            'characteristics': ['erratic', 'unpredictable', 'high variance'],
            'confidence': 0.50,
            'forecast': 'unpredictable',
            'risk_level': 'high'
        }
    }
    
    # Anomaly indicators
    ANOMALY_THRESHOLDS = {
        'spike_detection': 2.0,      # 2 standard deviations
        'velocity_threshold': 0.15,  # 15% change threshold
        'volume_anomaly': 3.0        # 3x normal volume
    }
    
    # Forecasting parameters
    FORECAST_CONFIDENCE_DECAY = 0.95  # Confidence decreases 5% per week
    
    def forecast_sentiment_90_days(self, historical_data: List[Tuple[str, float]], 
                                   recent_drivers: List[str] = None) -> List[Forecast]:
        """
        Generate 90-day sentiment forecast.
        
        Args:
            historical_data: List of (date, sentiment_score) tuples
            recent_drivers: Recent events/drivers that might influence forecast
            
        Returns:
            List of weekly forecasts for next 90 days
        """
        if not historical_data or len(historical_data) < 2:
            return []
        
        # Extract sentiment trend
        scores = [score for _, score in historical_data]
        trend = self._calculate_trend(scores)
        pattern = self._identify_pattern(scores)
        
        # Generate forecast points (13 weeks)
        forecasts = []
        base_date = datetime.now()
        current_sentiment = scores[-1]
        
        for week in range(1, 14):
            forecast_date = (base_date + timedelta(weeks=week)).isoformat()
            
            # Calculate predicted sentiment
            trend_component = trend * week * 0.01  # Trend grows each week
            volatility_component = self._estimate_volatility(scores) * (0.5 ** week)  # Volatility decays
            
            predicted = max(0, min(1, current_sentiment + trend_component + volatility_component))
            
            # Confidence decreases over time
            confidence = max(0.5, 0.95 * (self.FORECAST_CONFIDENCE_DECAY ** (week - 1)))
            
            # Bounds
            margin = (1 - confidence) * 0.2
            upper = min(1.0, predicted + margin)
            lower = max(0.0, predicted - margin)
            
            # Drivers
            drivers = recent_drivers or [pattern]
            if week > 4:
                drivers.append("regression to mean")
            
            # Recommendations
            recommendations = self._generate_forecast_recommendations(predicted, trend, pattern)
            
            forecasts.append(Forecast(
                forecast_date=forecast_date,
                predicted_sentiment=round(predicted, 3),
                confidence=round(confidence, 3),
                upper_bound=round(upper, 3),
                lower_bound=round(lower, 3),
                drivers=drivers,
                recommendations=recommendations
            ))
        
        return forecasts
    
    def _calculate_trend(self, scores: List[float]) -> float:
        """Calculate linear trend in sentiment scores."""
        if len(scores) < 2:
            return 0.0
        
        # Simple linear regression
        n = len(scores)
        sum_xy = sum(i * scores[i] for i in range(n))
        sum_x = sum(range(n))
        sum_y = sum(scores)
        sum_x2 = sum(i**2 for i in range(n))
        
        denominator = (n * sum_x2 - sum_x**2)
        if denominator == 0:
            return 0.0
        
        slope = (n * sum_xy - sum_x * sum_y) / denominator
        return slope
    
    def _identify_pattern(self, scores: List[float]) -> str:
        """Identify sentiment pattern from historical data."""
        if len(scores) < 3:
            return 'insufficient data'
        
        trend = self._calculate_trend(scores)
        volatility = self._estimate_volatility(scores)
        
        if trend > 0.02:
            return 'upward_momentum'
        elif trend < -0.02:
            return 'downward_momentum'
        elif volatility > 0.15:
            return 'volatility'
        else:
            return 'plateau'
    
    def _estimate_volatility(self, scores: List[float]) -> float:
        """Calculate volatility (standard deviation)."""
        if len(scores) < 2:
            return 0.0
        
        mean = sum(scores) / len(scores)
        variance = sum((s - mean)**2 for s in scores) / len(scores)
        return math.sqrt(variance)
    
    def _generate_forecast_recommendations(self, predicted: float, trend: float, 
                                          pattern: str) -> List[str]:
        """Generate recommendations based on forecast."""
        recommendations = []
        
        # Based on predicted sentiment
        if predicted > 0.7:
            recommendations.append("Capitalize on positive sentiment in marketing")
        elif predicted < 0.3:
            recommendations.append("Prepare crisis management strategy")
        
        # Based on trend
        if trend > 0.05:
            recommendations.append("Maintain current strategy")
        elif trend < -0.05:
            recommendations.append("Increase engagement and positive messaging")
        
        # Based on pattern
        if pattern == 'volatility':
            recommendations.append("Monitor closely - sentiment is unpredictable")
        elif pattern == 'downward_momentum':
            recommendations.append("Implement intervention strategy")
        
        return recommendations
    
    def detect_anomalies(self, sentiment_history: List[Tuple[str, float]], 
                        volume_history: List[Tuple[str, int]] = None) -> List[Dict]:
        """
        Detect sentiment anomalies using statistical methods.
        
        Args:
            sentiment_history: Historical sentiment scores
            volume_history: Optional mention volume history
            
        Returns:
            List of anomalies with details
        """
        scores = [score for _, score in sentiment_history]
        
        # Calculate mean and std dev
        mean = sum(scores) / len(scores)
        variance = sum((s - mean)**2 for s in scores) / len(scores)
        std_dev = math.sqrt(variance)
        
        anomalies = []
        
        for i, (date, score) in enumerate(sentiment_history):
            z_score = abs((score - mean) / std_dev) if std_dev > 0 else 0
            
            # Spike detection (>2 std devs)
            if z_score > self.ANOMALY_THRESHOLDS['spike_detection']:
                anomaly_type = 'positive_spike' if score > mean else 'negative_spike'
                
                # Calculate velocity
                if i > 0:
                    previous_score = scores[i - 1]
                    velocity = abs(score - previous_score)
                else:
                    velocity = 0
                
                anomalies.append({
                    'date': date,
                    'score': score,
                    'type': anomaly_type,
                    'severity': z_score / self.ANOMALY_THRESHOLDS['spike_detection'],
                    'velocity': velocity,
                    'recommendation': self._recommend_for_anomaly(anomaly_type, z_score)
                })
        
        return anomalies
    
    def _recommend_for_anomaly(self, anomaly_type: str, severity: float) -> str:
        """Generate recommendation for detected anomaly."""
        if anomaly_type == 'positive_spike':
            if severity > 3:
                return "Investigate cause of viral sentiment - capitalize immediately"
            else:
                return "Monitor positive trend"
        else:  # negative spike
            if severity > 3:
                return "URGENT: Investigate crisis - activate response team"
            else:
                return "Monitor negative trend closely"
    
    def predict_emerging_crisis(self, recent_mentions: List[str], 
                               sentiment_trend: float,
                               volume_trend: float) -> Dict:
        """
        Predict likelihood of emerging crisis based on patterns.
        
        Args:
            recent_mentions: Recent mentions text
            sentiment_trend: Negative trend magnitude
            volume_trend: Volume increase rate
            
        Returns:
            Crisis prediction with risk level and recommendations
        """
        # Analyze mention content for crisis indicators
        crisis_keywords = {
            'quality': ['defect', 'broken', 'failed', 'poor quality', 'cheap', 'waste'],
            'service': ['rude', 'unresponsive', 'unhelpful', 'ignored', 'slow'],
            'safety': ['unsafe', 'dangerous', 'hazard', 'risk', 'injury'],
            'ethical': ['unethical', 'scandal', 'illegal', 'corruption', 'fraud'],
            'environmental': ['pollution', 'waste', 'environment', 'carbon', 'damage']
        }
        
        combined_text = " ".join(recent_mentions).lower()
        crisis_indicators = {}
        
        for category, keywords in crisis_keywords.items():
            count = sum(combined_text.count(keyword) for keyword in keywords)
            if count > 0:
                crisis_indicators[category] = count
        
        # Calculate crisis risk score
        base_risk = 0.2
        
        # Add sentiment trend risk
        if sentiment_trend < -0.05:
            base_risk += 0.25
        
        # Add volume risk
        if volume_trend > 2.0:  # 2x increase
            base_risk += 0.25
        
        # Add indicator risk
        if crisis_indicators:
            base_risk += 0.3
        
        crisis_risk = min(1.0, base_risk)
        
        # Determine severity level
        if crisis_risk > 0.8:
            severity = "CRITICAL"
            action = "Activate crisis response team immediately"
        elif crisis_risk > 0.6:
            severity = "HIGH"
            action = "Prepare response plan and monitor closely"
        elif crisis_risk > 0.4:
            severity = "MEDIUM"
            action = "Increase monitoring and prepare for escalation"
        else:
            severity = "LOW"
            action = "Continue normal monitoring"
        
        return {
            'crisis_risk_score': round(crisis_risk, 3),
            'severity': severity,
            'primary_concern': max(crisis_indicators, key=crisis_indicators.get, 
                                  default='general sentiment'),
            'contributing_factors': crisis_indicators,
            'recommended_action': action,
            'time_to_impact': self._estimate_crisis_timeline(crisis_risk)
        }
    
    def _estimate_crisis_timeline(self, risk_score: float) -> str:
        """Estimate how soon crisis might occur."""
        if risk_score > 0.8:
            return "Hours to 1-2 days"
        elif risk_score > 0.6:
            return "1-3 days"
        elif risk_score > 0.4:
            return "3-7 days"
        else:
            return "1-2 weeks"
    
    def predict_influencer_impact(self, influencer_reach: int, 
                                 current_sentiment: float) -> Dict:
        """
        Predict sentiment impact if influencer with given reach mentions brand.
        Useful for influencer marketing planning.
        
        Args:
            influencer_reach: Number of followers
            current_sentiment: Current sentiment baseline
            
        Returns:
            Impact prediction
        """
        # Rough impact model
        reach_multiplier = min(2.0, influencer_reach / 100000)  # Scales with reach
        
        if current_sentiment > 0.6:
            # Positive brand already - positive influencer mention amplifies
            predicted_impact = 0.15 * reach_multiplier
            reach_estimate = influencer_reach * 0.8  # 80% engagement rate estimate
        else:
            # Negative brand - less impactful
            predicted_impact = 0.08 * reach_multiplier
            reach_estimate = influencer_reach * 0.4
        
        return {
            'estimated_sentiment_lift': round(predicted_impact, 3),
            'estimated_reach': int(reach_estimate),
            'roi_potential': 'High' if predicted_impact > 0.1 else 'Medium' if predicted_impact > 0.05 else 'Low',
            'recommendation': 'Priority influencer' if reach_estimate > 50000 else 'Secondary tier'
        }
    
    def forecast_seasonal_trends(self, monthly_data: List[Tuple[str, float]],
                                years_of_data: int = 2) -> Dict:
        """
        Forecast seasonality in sentiment.
        Useful for retail, hospitality, travel industries.
        
        Args:
            monthly_data: Monthly sentiment scores
            years_of_data: Number of years of historical data
            
        Returns:
            Seasonal forecast by month
        """
        if len(monthly_data) < 12:
            return {'note': 'Insufficient data for seasonal analysis (need 12+ months)'}
        
        # Group by month
        monthly_sentiments = {}
        for date_str, sentiment in monthly_data:
            # Extract month
            month = int(date_str.split('-')[1])  # Assumes YYYY-MM format
            if month not in monthly_sentiments:
                monthly_sentiments[month] = []
            monthly_sentiments[month].append(sentiment)
        
        # Calculate average by month
        seasonal_forecast = {}
        overall_mean = sum(sentiment for _, sentiment in monthly_data) / len(monthly_data)
        
        for month in range(1, 13):
            if month in monthly_sentiments:
                avg = sum(monthly_sentiments[month]) / len(monthly_sentiments[month])
                seasonal_forecast[month] = {
                    'average_sentiment': round(avg, 3),
                    'seasonal_index': round(avg / overall_mean, 3),
                    'trend': 'Above average' if avg > overall_mean else 'Below average',
                    'month_name': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1]
                }
        
        return seasonal_forecast
