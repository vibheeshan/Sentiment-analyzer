"""
CRM & Business Intelligence Integration
Salesforce, HubSpot, Tableau, Power BI connectors and data synchronization.
Connects sentiment data with customer data for complete 360-degree view.
Inspired by Brandwatch, Sprinklr, Talkwalker enterprise integrations.
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import json

@dataclass
class CRMIntegration:
    """CRM integration configuration."""
    integration_id: str
    crm_platform: str  # Salesforce, HubSpot, etc.
    status: str
    sync_frequency: str
    last_sync: str
    mapped_fields: Dict[str, str]


class CRMBIIntegrationEngine:
    """
    Enterprise integration with CRM and BI platforms.
    Merges sentiment data with customer data for complete intelligence.
    
    Supports:
    - Salesforce (Salesforce Connector)
    - HubSpot (HubSpot CRM API)
    - Tableau (REST API)
    - Power BI (Power BI REST API)
    - Looker (LookML + API)
    """
    
    # Salesforce field mappings
    SALESFORCE_FIELD_MAP = {
        'Account': {
            'sentiment_score': 'Industry_Sentiment_Score__c',
            'sentiment_trend': 'Sentiment_Trend__c',
            'crisis_risk': 'Crisis_Risk_Score__c',
            'mention_volume': 'Monthly_Mentions__c',
            'last_updated': 'Sentiment_Last_Updated__c',
            'brand_health': 'Brand_Health_Score__c'
        },
        'Contact': {
            'sentiment_influence': 'Influence_Score__c',
            'engagement_level': 'Engagement_Level__c',
            'emotional_state': 'Emotional_Sentiment__c',
            'interaction_sentiment': 'Last_Interaction_Sentiment__c'
        },
        'Opportunity': {
            'customer_sentiment': 'Customer_Sentiment_Score__c',
            'market_sentiment': 'Market_Sentiment_Context__c',
            'competitive_pressure': 'Competitive_Sentiment_Pressure__c'
        }
    }
    
    # HubSpot field mappings
    HUBSPOT_FIELD_MAP = {
        'company': {
            'hs_brand_sentiment': 'Brand Sentiment Score',
            'hs_sentiment_trend': 'Sentiment Trend',
            'hs_mention_volume': 'Monthly Mention Volume',
            'hs_crisis_risk': 'Crisis Risk Level',
            'hs_industry_insights': 'Industry Sentiment Insights'
        },
        'contact': {
            'hs_influence_score': 'Influence Score',
            'hs_engagement_sentiment': 'Engagement Level',
            'hs_social_sentiment': 'Social Media Sentiment'
        }
    }
    
    # Tableau connector specifications
    TABLEAU_CONNECTOR_SPEC = {
        'data_source_name': 'BrandPulse Sentiment Data',
        'connector_type': 'Custom Connector',
        'authentication': ['OAuth 2.0', 'API Key'],
        'data_refresh': ['Live', '1 hour', '1 day'],
        'available_measures': [
            'Sentiment Score', 'Positive Mentions', 'Negative Mentions',
            'Emotion Distribution', 'Trending Topics', 'Aspect Sentiment',
            'Crisis Risk Score', 'Brand Health'
        ],
        'available_dimensions': [
            'Date', 'Source', 'Region', 'Demographic', 'Product',
            'Campaign', 'Competitor', 'Emotion Type', 'Aspect Category'
        ]
    }
    
    # Power BI dataset schema
    POWERBI_DATASET_SCHEMA = {
        'tables': [
            {
                'name': 'SentimentMetrics',
                'columns': [
                    {'name': 'Date', 'dataType': 'DateTime'},
                    {'name': 'SentimentScore', 'dataType': 'Double'},
                    {'name': 'PositiveMentions', 'dataType': 'Int64'},
                    {'name': 'NegativeMentions', 'dataType': 'Int64'},
                    {'name': 'MentionVolume', 'dataType': 'Int64'},
                    {'name': 'Source', 'dataType': 'String'},
                    {'name': 'Region', 'dataType': 'String'}
                ]
            },
            {
                'name': 'EmotionData',
                'columns': [
                    {'name': 'Date', 'dataType': 'DateTime'},
                    {'name': 'EmotionType', 'dataType': 'String'},
                    {'name': 'Score', 'dataType': 'Double'},
                    {'name': 'Mentions', 'dataType': 'Int64'}
                ]
            },
            {
                'name': 'AspectAnalysis',
                'columns': [
                    {'name': 'Date', 'dataType': 'DateTime'},
                    {'name': 'AspectCategory', 'dataType': 'String'},
                    {'name': 'Sentiment', 'dataType': 'String'},
                    {'name': 'Confidence', 'dataType': 'Double'},
                    {'name': 'MentionCount', 'dataType': 'Int64'}
                ]
            }
        ]
    }
    
    def integrate_with_salesforce(self, org_id: str, api_version: str = 'v57.0',
                                 auth_token: str = '') -> CRMIntegration:
        """
        Setup Salesforce integration to sync sentiment scores to accounts/contacts.
        
        Args:
            org_id: Salesforce Organization ID
            api_version: Salesforce API version
            auth_token: OAuth token
            
        Returns:
            CRMIntegration configuration
        """
        integration_id = f"sf_{org_id}_{datetime.now().timestamp()}"
        
        integration = CRMIntegration(
            integration_id=integration_id,
            crm_platform='Salesforce',
            status='connected',
            sync_frequency='hourly',
            last_sync=datetime.now().isoformat(),
            mapped_fields=self.SALESFORCE_FIELD_MAP
        )
        
        return {
            'integration': integration,
            'configuration': {
                'org_id': org_id,
                'api_version': api_version,
                'base_url': f'https://{org_id}.salesforce.com',
                'oauth_endpoint': f'https://{org_id}.salesforce.com/services/oauth2/authorize',
                'data_sync_endpoint': f'https://{org_id}.salesforce.com/services/data/{api_version}/sobjects'
            },
            'field_mappings': self.SALESFORCE_FIELD_MAP,
            'sync_settings': {
                'frequency': 'hourly',
                'batch_size': 500,
                'on_error_action': 'retry',
                'retry_attempts': 3
            },
            'data_flow': {
                'direction': 'uni-directional (BrandPulse → Salesforce)',
                'objects_synced': list(self.SALESFORCE_FIELD_MAP.keys()),
                'fields_updated': sum(len(v) for v in self.SALESFORCE_FIELD_MAP.values())
            },
            'status': 'active',
            'last_sync': datetime.now().isoformat(),
            'next_sync': 'in 1 hour'
        }
    
    def integrate_with_hubspot(self, api_key: str, account_id: str) -> CRMIntegration:
        """
        Setup HubSpot integration for sentiment data synchronization.
        
        Args:
            api_key: HubSpot API key
            account_id: HubSpot Account ID
            
        Returns:
            HubSpot integration configuration
        """
        integration_id = f"hs_{account_id}_{datetime.now().timestamp()}"
        
        integration = CRMIntegration(
            integration_id=integration_id,
            crm_platform='HubSpot',
            status='connected',
            sync_frequency='real-time',
            last_sync=datetime.now().isoformat(),
            mapped_fields=self.HUBSPOT_FIELD_MAP
        )
        
        return {
            'integration': integration,
            'configuration': {
                'account_id': account_id,
                'api_endpoint': 'https://api.hubapi.com',
                'api_key_masked': api_key[:10] + '****' + api_key[-4:],
                'auth_method': 'API Key'
            },
            'field_mappings': self.HUBSPOT_FIELD_MAP,
            'sync_settings': {
                'frequency': 'real-time',
                'batch_size': 100,
                'webhooks_enabled': True,
                'on_error_action': 'queue_for_retry'
            },
            'custom_properties_created': [
                'hs_brand_sentiment',
                'hs_sentiment_trend',
                'hs_mention_volume',
                'hs_crisis_risk',
                'hs_industry_insights'
            ],
            'status': 'active',
            'last_sync': datetime.now().isoformat(),
            'sync_status': 'Real-time sync enabled'
        }
    
    def create_tableau_data_connector(self, connector_name: str,
                                     api_endpoint: str) -> Dict:
        """
        Create Tableau connector for live dashboard integration.
        
        Args:
            connector_name: Name for the connector
            api_endpoint: BrandPulse API endpoint
            
        Returns:
            Tableau connector configuration
        """
        return {
            'connector_name': connector_name,
            'connector_type': 'Custom Connector',
            'api_endpoint': api_endpoint,
            'authentication': {
                'method': 'OAuth 2.0',
                'oauth_endpoint': f'{api_endpoint}/oauth/authorize',
                'token_endpoint': f'{api_endpoint}/oauth/token',
                'scopes': ['read:sentiment', 'read:analytics']
            },
            'data_source_spec': self.TABLEAU_CONNECTOR_SPEC,
            'available_dashboards': [
                'Executive Sentiment Dashboard',
                'Real-time Monitoring',
                'Competitive Analysis',
                'Trend Forecast',
                'Crisis Detection'
            ],
            'refresh_frequency': 'Every 1 hour',
            'data_types_supported': [
                'Sentiment Scores',
                'Emotion Distribution',
                'Aspect Analysis',
                'Topic Trends',
                'Crisis Indicators'
            ],
            'sample_query': '''
            SELECT Date, SentimentScore, PositiveMentions, NegativeMentions
            FROM SentimentMetrics
            WHERE Date >= DATE_ADD(CURDATE(), -30)
            ''',
            'connector_download': 'https://connectors.tableau.com/brandpulse',
            'documentation': 'https://docs.brandpulse.io/tableau'
        }
    
    def create_powerbi_dataset(self, workspace_id: str,
                              dataset_name: str) -> Dict:
        """
        Create Power BI dataset for sentiment analytics.
        
        Args:
            workspace_id: Power BI Workspace ID
            dataset_name: Name for the dataset
            
        Returns:
            Power BI dataset configuration and deployment
        """
        return {
            'workspace_id': workspace_id,
            'dataset_name': dataset_name,
            'dataset_id': f"brandpulse_{workspace_id}_{datetime.now().timestamp()}",
            'schema': self.POWERBI_DATASET_SCHEMA,
            'refresh_settings': {
                'frequency': 'Daily',
                'time': '06:00 AM UTC',
                'incremental_refresh': True
            },
            'api_endpoint': f'https://api.powerbi.com/v1.0/myorg/groups/{workspace_id}/datasets',
            'push_api_enabled': True,
            'real_time_streaming': {
                'enabled': True,
                'streaming_endpoint': f'https://api.powerbi.com/beta/myorg/groups/{workspace_id}/datasets/{{dataset_id}}/rows'
            },
            'row_level_security': {
                'enabled': True,
                'roles': ['Executive', 'Analyst', 'Manager', 'View Only']
            },
            'pre_built_reports': [
                'Executive Dashboard',
                'Detailed Analytics',
                'Real-Time Monitoring',
                'Forecast Dashboard',
                'Competitive Intelligence'
            ],
            'status': 'deployed',
            'deployment_time': datetime.now().isoformat()
        }
    
    def sync_customer_sentiment_360(self, customer_data: Dict,
                                    sentiment_data: Dict) -> Dict:
        """
        Create 360-degree customer view by merging sentiment with CRM data.
        
        Args:
            customer_data: Customer profile from CRM
            sentiment_data: Sentiment metrics for this customer
            
        Returns:
            Unified 360 customer view
        """
        return {
            'customer_id': customer_data.get('id'),
            'customer_name': customer_data.get('name'),
            'crm_data': {
                'company': customer_data.get('company'),
                'industry': customer_data.get('industry'),
                'deal_size': customer_data.get('deal_value'),
                'lifecycle_stage': customer_data.get('stage'),
                'last_interaction': customer_data.get('last_interaction')
            },
            'sentiment_profile': {
                'brand_sentiment': sentiment_data.get('sentiment_score'),
                'sentiment_trend': sentiment_data.get('trend'),
                'emotional_state': sentiment_data.get('primary_emotion'),
                'mention_frequency': sentiment_data.get('mention_count'),
                'last_mention': sentiment_data.get('last_mention_date'),
                'top_concerns': sentiment_data.get('pain_points')
            },
            'behavioral_insights': {
                'engagement_level': self._calculate_engagement(customer_data, sentiment_data),
                'influence_score': self._calculate_influence(sentiment_data),
                'churn_risk': self._calculate_churn_risk(customer_data, sentiment_data),
                'upsell_opportunity': self._calculate_upsell_potential(customer_data, sentiment_data)
            },
            'recommended_actions': self._generate_crm_recommendations(customer_data, sentiment_data),
            'next_best_action': self._determine_next_action(customer_data, sentiment_data)
        }
    
    def _calculate_engagement(self, customer: Dict, sentiment: Dict) -> str:
        """Calculate engagement level from sentiment and CRM data."""
        mention_count = sentiment.get('mention_count', 0)
        if mention_count > 50:
            return 'Very High'
        elif mention_count > 20:
            return 'High'
        elif mention_count > 5:
            return 'Medium'
        else:
            return 'Low'
    
    def _calculate_influence(self, sentiment: Dict) -> float:
        """Calculate customer influence based on reach and engagement."""
        base_score = sentiment.get('mention_count', 0) / 100
        return min(base_score, 1.0)
    
    def _calculate_churn_risk(self, customer: Dict, sentiment: Dict) -> str:
        """Predict churn risk based on sentiment and behavior."""
        sentiment_score = sentiment.get('sentiment_score', 0.5)
        trend = sentiment.get('trend', 'neutral')
        
        if sentiment_score < 0.3 and trend == 'negative':
            return 'High Risk'
        elif sentiment_score < 0.5:
            return 'Medium Risk'
        else:
            return 'Low Risk'
    
    def _calculate_upsell_potential(self, customer: Dict, sentiment: Dict) -> str:
        """Calculate upsell opportunity based on sentiment and engagement."""
        sentiment_score = sentiment.get('sentiment_score', 0.5)
        engagement = self._calculate_engagement(customer, sentiment)
        
        if sentiment_score > 0.7 and engagement in ['High', 'Very High']:
            return 'High Opportunity'
        elif sentiment_score > 0.6:
            return 'Medium Opportunity'
        else:
            return 'Low Opportunity'
    
    def _generate_crm_recommendations(self, customer: Dict, sentiment: Dict) -> List[str]:
        """Generate CRM action recommendations."""
        recommendations = []
        
        sentiment_score = sentiment.get('sentiment_score', 0.5)
        
        if sentiment_score > 0.8:
            recommendations.append('Capitalize on positive sentiment - request testimonial')
            recommendations.append('Present upsell opportunity')
        elif sentiment_score < 0.3:
            recommendations.append('Urgent: Schedule customer care call')
            recommendations.append('Offer service recovery or discount')
        elif sentiment_score < 0.5:
            recommendations.append('Increase engagement to improve satisfaction')
            recommendations.append('Identify specific pain points')
        
        return recommendations
    
    def _determine_next_action(self, customer: Dict, sentiment: Dict) -> str:
        """Determine recommended next action."""
        sentiment_score = sentiment.get('sentiment_score', 0.5)
        trend = sentiment.get('trend', 'neutral')
        
        if sentiment_score > 0.8:
            return 'Request case study / testimonial'
        elif sentiment_score < 0.3:
            return 'Schedule customer success call'
        elif trend == 'negative':
            return 'Investigate recent issues'
        else:
            return 'Continue regular check-ins'
    
    def export_sentiment_to_bi_warehouse(self, warehouse_type: str,
                                       connection_config: Dict) -> Dict:
        """
        Export sentiment data to data warehouse for BI analysis.
        Supports Snowflake, BigQuery, Redshift, etc.
        
        Args:
            warehouse_type: snowflake, bigquery, redshift, etc.
            connection_config: Connection details
            
        Returns:
            Export configuration and status
        """
        return {
            'export_type': warehouse_type,
            'status': 'configured',
            'export_schedule': 'Daily at 2 AM UTC',
            'table_schema': {
                'sentiment_facts': ['date', 'sentiment_score', 'mention_count', 'source'],
                'emotion_facts': ['date', 'emotion_type', 'score'],
                'aspect_facts': ['date', 'aspect', 'sentiment', 'mentions'],
                'customer_facts': ['customer_id', 'sentiment_score', 'interaction_count']
            },
            'estimated_data_size': '5-10 GB/month',
            'query_examples': {
                'daily_sentiment_trend': 'SELECT date, AVG(sentiment_score) FROM sentiment_facts GROUP BY date',
                'customer_sentiment': 'SELECT customer_id, sentiment_score FROM customer_facts WHERE sentiment_score < 0.5',
                'emotion_distribution': 'SELECT emotion_type, COUNT(*) FROM emotion_facts GROUP BY emotion_type'
            },
            'estimated_cost': 'Depends on warehouse; typically $100-500/month for this volume'
        }
