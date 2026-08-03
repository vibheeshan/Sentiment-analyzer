# 🚀 Enterprise API Quick Reference

## Module Imports

```python
# 1. Aspect-Based Sentiment
from backend.aspect_sentiment_analyzer import AspectSentimentAnalyzer
analyzer = AspectSentimentAnalyzer()

# 2. Visual Intelligence
from backend.visual_intelligence import VisualIntelligenceAnalyzer
visual = VisualIntelligenceAnalyzer()

# 3. Generative AI
from backend.generative_insights import GenerativeInsightEngine
insights = GenerativeInsightEngine()

# 4. Predictive Analytics
from backend.predictive_analytics import PredictiveAnalyticsEngine
predictor = PredictiveAnalyticsEngine()

# 5. Advanced Dashboarding
from backend.advanced_dashboarding import AdvancedDashboardEngine
dashboard = AdvancedDashboardEngine()

# 6. Custom Classifiers
from backend.custom_classifiers import CustomClassifierEngine
classifier = CustomClassifierEngine()

# 7. CRM/BI Integration
from backend.crm_bi_integration import CRMBIIntegrationEngine
crm = CRMBIIntegrationEngine()

# Master Integration
from backend.enterprise_sentiment_system import get_enterprise_sentiment_system
system = get_enterprise_sentiment_system()
```

---

## Common Tasks (Copy-Paste Ready)

### Task 1: Aspect-Based Analysis

```python
# Find what aspects customers love/hate
aspect_results = analyzer.analyze_aspects(
    "Great product but shipping took forever"
)

for aspect in aspect_results:
    print(f"{aspect.aspect}: {aspect.sentiment} ({aspect.confidence:.0%})")
    # Output:
    # product_quality:quality: positive (95%)
    # delivery:shipping: negative (92%)
```

### Task 2: Identify Pain Points (Bulk)

```python
reviews = ["Review 1 text", "Review 2 text", ...]

pain_points = analyzer.identify_pain_points(reviews)
print(pain_points)
# Output: {'shipping': 45.2, 'packaging': 32.1, 'support': 28.4}
```

### Task 3: Visual Sentiment

```python
# Analyze if image looks positive or negative
visual_result = visual.analyze_scene_sentiment(
    "professional product photo in clean room with smiling model"
)
print(visual_result['visual_sentiment'])  # positive
print(visual_result['professionalism'])   # 0.92
```

### Task 4: 90-Day Forecast

```python
historical_data = [
    ('2024-01-01', 0.65),
    ('2024-01-02', 0.68),
    ('2024-01-03', 0.72),
    # ... 30 more days
]

forecasts = predictor.forecast_sentiment_90_days(historical_data)

for forecast in forecasts[:4]:  # First 4 weeks
    print(f"Week {forecast.forecast_date}: {forecast.predicted_sentiment:.2f} " \
          f"(confidence: {forecast.confidence:.0%})")
```

### Task 5: Anomaly Detection

```python
sentiment_history = [
    ('2024-01-01', 0.65),
    ('2024-01-02', 0.68),
    ('2024-01-03', 0.92),  # SPIKE
    ('2024-01-04', 0.70),
]

anomalies = predictor.detect_anomalies(sentiment_history)
for anomaly in anomalies:
    if anomaly['severity'] > 2:
        print(f"🚨 {anomaly['type']}: {anomaly['recommendation']}")
```

### Task 6: Crisis Prediction

```python
crisis_prediction = predictor.predict_emerging_crisis(
    recent_mentions=["defect", "broken", "dangerous", ...],
    sentiment_trend=-0.05,
    volume_trend=3.2
)

print(f"Risk Level: {crisis_prediction['severity']}")
print(f"Action: {crisis_prediction['recommended_action']}")
print(f"Time: {crisis_prediction['time_to_impact']}")
```

### Task 7: Create Geospatial Heatmap

```python
sentiment_by_country = {
    'US': 0.75,
    'UK': 0.68,
    'DE': 0.71,
}
mention_volume = {
    'US': 2400,
    'UK': 1200,
    'DE': 800,
}

heatmap = dashboard.create_geospatial_heatmap(
    sentiment_by_country, mention_volume
)
# Use in Streamlit: st.json(heatmap)
```

### Task 8: Create Crisis Risk Gauge

```python
gauge = dashboard.create_crisis_risk_gauge(
    crisis_risk_score=0.75,
    trend='increasing',
    recent_indicators=['Volume spike', 'Negative spike', 'Competitor activity']
)
# Shows red gauge at 75% with warning
```

### Task 9: Custom Domain Classifier

```python
# Train for healthcare
healthcare_classifier = classifier.create_custom_classifier(
    name='Hospital Sentiment',
    domain='healthcare',
    training_data=[
        ('Doctor was excellent', 'positive'),
        ('Long wait time', 'negative'),
    ]
)

# Use it
result = classifier.classify_with_custom_model(
    "Great service but expensive",
    healthcare_classifier
)
print(result['primary_category'])  # healthcare-specific
```

### Task 10: Salesforce Integration

```python
salesforce_config = crm.integrate_with_salesforce(
    org_id='00D50000000IZ3E',
    api_version='v57.0',
    auth_token='YOUR_OAUTH_TOKEN'
)
# Sentiment scores now sync hourly to Accounts
```

### Task 11: HubSpot Integration

```python
hubspot_config = crm.integrate_with_hubspot(
    api_key='YOUR_API_KEY',
    account_id='YOUR_ACCOUNT_ID'
)
# Real-time sync enabled
```

### Task 12: Customer 360 View

```python
customer_360 = crm.sync_customer_sentiment_360(
    customer_data={
        'id': 'CUST123',
        'name': 'TechCorp Inc',
        'stage': 'Negotiation',
        'deal_value': 500000
    },
    sentiment_data={
        'sentiment_score': 0.65,
        'trend': 'negative',
        'pain_points': ['pricing', 'integration']
    }
)

print(f"Churn Risk: {customer_360['behavioral_insights']['churn_risk']}")
print(f"Action: {customer_360['next_best_action']}")
```

### Task 13: Complete Enterprise Analysis

```python
results = system.perform_enterprise_analysis(
    texts=customer_reviews,
    images=product_photos,
    historical_sentiment=past_30_days_sentiment,
    custom_classifier_id='my_healthcare_classifier'
)

print("Aspect Analysis:", results['aspect_analysis'])
print("Visual Intelligence:", results['visual_intelligence'])
print("AI Insights:", results['ai_insights'])
print("Predictions:", results['predictive_analytics'])
print("CRM Status:", results['crm_bi_status'])
```

### Task 14: AI Insight Generation

```python
insight = insights.generate_summary_narrative(
    sentiment_data={
        'positive_percent': 72,
        'negative_percent': 18,
        'total_mentions': 1500
    },
    mention_sample=["Great product!", "Shipping slow", ...]
)

print(insight.narrative)
# "Brand sentiment is very positive with 72% positive mentions..."
```

### Task 15: Competitive Comparison

```python
comparison = analyzer.compare_aspects(
    texts1=our_reviews,      # Our product reviews
    texts2=competitor_reviews # Competitor reviews
)

for aspect, metrics in comparison.items():
    print(f"{aspect}: We {metrics['change']:+.0%} vs them")
```

---

## Common Code Patterns

### Pattern 1: Batch Analysis

```python
results = []
for text in texts:
    aspects = analyzer.analyze_aspects(text)
    results.append(aspects)

# Aggregate
pain_points = analyzer.identify_pain_points(texts)
```

### Pattern 2: Dashboard Creation

```python
dashboard_config = dashboard.create_interactive_dashboard_config(
    widgets=['sentiment_gauge', 'emotion_radar', 'aspect_bubble_chart'],
    layout='2x2',
    theme='light'
)

# Export to PDF
pdf_export = dashboard.export_dashboard_to_pdf(dashboard_config)
```

### Pattern 3: Forecast with Confidence

```python
forecasts = predictor.forecast_sentiment_90_days(historical_data)

for forecast in forecasts:
    print(f"{forecast.forecast_date}: " \
          f"{forecast.predicted_sentiment:.2f} " \
          f"± {(forecast.upper_bound - forecast.lower_bound)/2:.2f}")
```

### Pattern 4: Crisis Alert Workflow

```python
# Detect
crisis_risk = predictor.predict_emerging_crisis(texts, trend, volume)

if crisis_risk['crisis_risk_score'] > 0.7:
    # Generate alert
    alert = insights.generate_crisis_alert(
        alert_type='quality_issue',
        severity=crisis_risk['crisis_risk_score'],
        relevant_mentions=texts
    )

    # Send notification
    print(f"🚨 {alert.title}")
    print(alert.narrative)
```

### Pattern 5: CRM Sync Workflow

```python
# Get customer
customer = crm_system.get_customer(customer_id)

# Get sentiment
sentiment = system.perform_enterprise_analysis([customer_mention])

# Merge
customer_360 = crm.sync_customer_sentiment_360(customer, sentiment)

# Take action
if customer_360['behavioral_insights']['churn_risk'] == 'High Risk':
    # Schedule call
    notify_sales_team(customer_id, 'URGENT: Churn risk high')
```

---

## Return Value Structures

### Aspect Analysis

```python
{
    'aspects_found': 3,
    'summary': {
        'product_quality': {'positive': 0.95, ...},
        'pricing': {'positive': 0.42, ...}
    },
    'pain_points': {'pricing': 45.2, 'shipping': 32.1},
    'strengths': {'quality': 92.4, 'design': 87.3}
}
```

### Visual Sentiment

```python
{
    'visual_sentiment': 'positive',
    'positive_score': 0.85,
    'negative_score': 0.10,
    'visual_quality': 0.92,
    'professionalism': 0.88
}
```

### Forecast

```python
{
    'forecast_date': '2024-02-01',
    'predicted_sentiment': 0.72,
    'confidence': 0.95,
    'upper_bound': 0.85,
    'lower_bound': 0.59,
    'drivers': ['campaign launch'],
    'recommendations': ['Capitalize on momentum']
}
```

### Anomaly

```python
{
    'date': '2024-01-15',
    'score': 0.92,
    'type': 'positive_spike',
    'severity': 2.8,
    'velocity': 0.24,
    'recommendation': 'Investigate cause of viral sentiment...'
}
```

### Crisis Prediction

```python
{
    'crisis_risk_score': 0.87,
    'severity': 'CRITICAL',
    'primary_concern': 'quality',
    'contributing_factors': {'quality': 8, 'safety': 3},
    'recommended_action': 'Activate crisis response team',
    'time_to_impact': 'Hours to 1-2 days'
}
```

---

## Error Handling

```python
try:
    results = system.perform_enterprise_analysis(texts)
except ValueError as e:
    print(f"Invalid input: {e}")
except Exception as e:
    print(f"Analysis failed: {e}")
    # Fallback to basic sentiment
    basic_result = analyzer.detect_emotions(texts[0])
```

---

## Performance Tips

1. **Batch Processing:** Process 100+ texts at once, not individually
2. **Caching:** Store forecasts for 24 hours, refresh daily
3. **Async Tasks:** Run dashboards export in background
4. **Indexing:** For CRM sync, index on customer_id + date
5. **Limits:** Process max 10K mentions at once, paginate

---

## Version Info

```python
system = get_enterprise_sentiment_system()
status = system.get_enterprise_feature_status()

print(f"Version: {status['version']}")  # 4.0 Enterprise
print(f"Initialized: {status['initialized']}")
for feature, details in status['features'].items():
    print(f"  {feature}: {details['status']}")
```

---

## Next Steps

1. Copy a code pattern above
2. Replace sample data with your data
3. Run and customize
4. Check ENTERPRISE_IMPLEMENTATION_GUIDE.md for detailed docs
5. See module docstrings for additional parameters

**Questions?** Check docstrings in each module:

```python
help(analyzer.analyze_aspects)
help(visual.detect_visual_mentions)
help(predictor.forecast_sentiment_90_days)
```
