"""
Multi-Source Data Integration Module
Integrates data from social media, news, blogs, forums, and other sources
"""

from typing import Dict, List, Optional
from datetime import datetime
from abc import ABC, abstractmethod
import requests
import json

class DataSource(ABC):
    """Abstract base class for data sources"""
    
    def __init__(self, source_name: str, api_key: str = None):
        self.source_name = source_name
        self.api_key = api_key
        self.last_sync = None
        self.data_count = 0
    
    @abstractmethod
    def fetch_data(self, query: str, limit: int = 100) -> List[Dict]:
        """Fetch data from source"""
        pass
    
    @abstractmethod
    def search(self, keyword: str, filters: Dict = None) -> List[Dict]:
        """Search for specific content"""
        pass


class TwitterDataSource(DataSource):
    """Twitter/X data source integration"""
    
    API_ENDPOINT = "https://api.twitter.com/2"
    
    def __init__(self, api_key: str = None):
        super().__init__("Twitter", api_key)
        self.headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    
    def fetch_data(self, query: str, limit: int = 100) -> List[Dict]:
        """Fetch tweets matching query"""
        if not self.api_key:
            return self._mock_twitter_data(query, limit)
        
        data = []
        try:
            # In production, would use actual Twitter API v2
            endpoint = f"{self.API_ENDPOINT}/tweets/search/recent"
            params = {
                "query": query,
                "max_results": min(limit, 100),
                "tweet.fields": "created_at,author_id,public_metrics"
            }
            
            # Placeholder for actual API call
            data = self._mock_twitter_data(query, limit)
        except Exception as e:
            print(f"Twitter API Error: {e}")
        
        self.last_sync = datetime.now()
        self.data_count += len(data)
        return data
    
    def search(self, keyword: str, filters: Dict = None) -> List[Dict]:
        """Search tweets by keyword"""
        filters = filters or {}
        
        # Advanced search options
        query = keyword
        if filters.get('language'):
            query += f" lang:{filters['language']}"
        if filters.get('verified_only'):
            query += " is:verified"
        if filters.get('with_links'):
            query += " has:links"
        
        return self.fetch_data(query, filters.get('limit', 50))
    
    def _mock_twitter_data(self, query: str, limit: int) -> List[Dict]:
        """Return mock Twitter data"""
        return [
            {
                "id": f"tweet_{i}",
                "text": f"Tweet about {query} #{i}",
                "source": "Twitter",
                "created_at": datetime.now(),
                "engagement": {"likes": 10 + i*2, "retweets": 5 + i},
                "author": {"followers": 1000 + i*100, "verified": False}
            }
            for i in range(min(limit, 10))
        ]


class RedditDataSource(DataSource):
    """Reddit data source integration"""
    
    API_ENDPOINT = "https://www.reddit.com/r"
    
    def __init__(self, client_id: str = None, client_secret: str = None):
        super().__init__("Reddit", client_id)
        self.client_secret = client_secret
    
    def fetch_data(self, query: str, limit: int = 100) -> List[Dict]:
        """Fetch Reddit posts matching query"""
        data = self._mock_reddit_data(query, limit)
        self.last_sync = datetime.now()
        self.data_count += len(data)
        return data
    
    def search(self, keyword: str, filters: Dict = None) -> List[Dict]:
        """Search Reddit by keyword and subreddits"""
        filters = filters or {}
        
        data = []
        subreddits = filters.get('subreddits', ['all'])
        
        for subreddit in subreddits:
            posts = self.fetch_data(f"{subreddit} {keyword}", filters.get('limit', 50))
            data.extend(posts)
        
        return data
    
    def _mock_reddit_data(self, query: str, limit: int) -> List[Dict]:
        """Return mock Reddit data"""
        return [
            {
                "id": f"reddit_{i}",
                "title": f"Discussion about {query}",
                "text": f"Reddit post content about {query} #{i}",
                "source": "Reddit",
                "created_at": datetime.now(),
                "subreddit": "general",
                "engagement": {"upvotes": 50 + i*5, "comments": 10 + i},
                "author": {"karma": 1000 + i*100, "age_days": 365}
            }
            for i in range(min(limit, 10))
        ]


class NewsDataSource(DataSource):
    """News articles data source integration"""
    
    API_ENDPOINT = "https://newsapi.org/v2"
    
    def __init__(self, api_key: str = None):
        super().__init__("NewsAPI", api_key)
    
    def fetch_data(self, query: str, limit: int = 100) -> List[Dict]:
        """Fetch news articles"""
        data = self._mock_news_data(query, limit)
        self.last_sync = datetime.now()
        self.data_count += len(data)
        return data
    
    def search(self, keyword: str, filters: Dict = None) -> List[Dict]:
        """Search news by keyword"""
        filters = filters or {}
        
        # Filter options: category, language, country, sort_by
        return self.fetch_data(keyword, filters.get('limit', 50))
    
    def _mock_news_data(self, query: str, limit: int) -> List[Dict]:
        """Return mock news data"""
        return [
            {
                "id": f"news_{i}",
                "title": f"News article about {query} #{i}",
                "description": f"Article content about {query}",
                "source": "NewsAPI",
                "url": f"https://news.example.com/{i}",
                "created_at": datetime.now(),
                "author": f"Reporter {i}",
                "publisher": "News Publisher"
            }
            for i in range(min(limit, 10))
        ]


class BlogDataSource(DataSource):
    """Blog posts data source integration"""
    
    def __init__(self, api_key: str = None):
        super().__init__("BlogAggregator", api_key)
    
    def fetch_data(self, query: str, limit: int = 100) -> List[Dict]:
        """Fetch blog posts"""
        data = self._mock_blog_data(query, limit)
        self.last_sync = datetime.now()
        self.data_count += len(data)
        return data
    
    def search(self, keyword: str, filters: Dict = None) -> List[Dict]:
        """Search blogs by keyword"""
        filters = filters or {}
        return self.fetch_data(keyword, filters.get('limit', 50))
    
    def _mock_blog_data(self, query: str, limit: int) -> List[Dict]:
        """Return mock blog data"""
        return [
            {
                "id": f"blog_{i}",
                "title": f"Blog post about {query}",
                "content": f"Detailed blog content about {query} #{i}",
                "source": "BlogAggregator",
                "url": f"https://blog.example.com/post-{i}",
                "created_at": datetime.now(),
                "author": f"Blogger {i}",
                "category": "Technology"
            }
            for i in range(min(limit, 10))
        ]


class ForumDataSource(DataSource):
    """Forum discussions data source"""
    
    def __init__(self, api_key: str = None):
        super().__init__("ForumAggregator", api_key)
    
    def fetch_data(self, query: str, limit: int = 100) -> List[Dict]:
        """Fetch forum discussions"""
        data = self._mock_forum_data(query, limit)
        self.last_sync = datetime.now()
        self.data_count += len(data)
        return data
    
    def search(self, keyword: str, filters: Dict = None) -> List[Dict]:
        """Search forum discussions"""
        filters = filters or {}
        return self.fetch_data(keyword, filters.get('limit', 50))
    
    def _mock_forum_data(self, query: str, limit: int) -> List[Dict]:
        """Return mock forum data"""
        return [
            {
                "id": f"forum_{i}",
                "title": f"Forum discussion about {query}",
                "content": f"Forum post about {query} #{i}",
                "source": "ForumAggregator",
                "forum": "Tech Forum",
                "created_at": datetime.now(),
                "author": f"User {i}",
                "replies": 5 + i,
                "views": 100 + i*10
            }
            for i in range(min(limit, 10))
        ]


class MultiSourceAggregator:
    """Aggregates data from multiple sources"""
    
    def __init__(self):
        self.sources: Dict[str, DataSource] = {}
        self.aggregated_data = []
        self.source_stats = {}
    
    def add_source(self, source: DataSource):
        """Add a data source"""
        self.sources[source.source_name] = source
        self.source_stats[source.source_name] = {
            'added_at': datetime.now(),
            'data_count': 0,
            'last_sync': None
        }
    
    def add_default_sources(self):
        """Add all default sources"""
        self.add_source(TwitterDataSource())
        self.add_source(RedditDataSource())
        self.add_source(NewsDataSource())
        self.add_source(BlogDataSource())
        self.add_source(ForumDataSource())
    
    def aggregate(self, keyword: str, filters: Dict = None) -> List[Dict]:
        """
        Aggregate data from all sources for a keyword.
        
        Args:
            keyword: Search keyword
            filters: Dict with source-specific filters
        
        Returns:
            List of aggregated data points with metadata
        """
        filters = filters or {}
        aggregated = []
        
        enabled_sources = filters.get('sources', list(self.sources.keys()))
        
        for source_name in enabled_sources:
            if source_name not in self.sources:
                continue
            
            source = self.sources[source_name]
            try:
                data = source.search(keyword, filters.get(source_name, {}))
                
                # Enrich data with source metadata
                for item in data:
                    item['_source'] = source_name
                    item['_fetch_time'] = datetime.now()
                    item['_fetch_timestamp'] = datetime.now().isoformat()
                
                aggregated.extend(data)
                self.source_stats[source_name]['data_count'] += len(data)
                self.source_stats[source_name]['last_sync'] = datetime.now()
            
            except Exception as e:
                print(f"Error fetching from {source_name}: {e}")
        
        self.aggregated_data = aggregated
        return aggregated
    
    def get_source_distribution(self) -> Dict:
        """Get distribution of data across sources"""
        if not self.aggregated_data:
            return {}
        
        from collections import Counter
        sources = [d['_source'] for d in self.aggregated_data]
        distribution = Counter(sources)
        
        return dict(distribution)
    
    def get_stats(self) -> Dict:
        """Get aggregator statistics"""
        return {
            'total_sources': len(self.sources),
            'active_sources': len([s for s in self.sources.values() if s.last_sync]),
            'total_data_points': sum(stat['data_count'] for stat in self.source_stats.values()),
            'source_stats': self.source_stats,
            'last_aggregation': datetime.now() if self.aggregated_data else None
        }
    
    def export_aggregated_data(self, format: str = 'json') -> str:
        """Export aggregated data in specified format"""
        if format == 'json':
            # Convert datetime objects to strings
            data_copy = []
            for item in self.aggregated_data:
                item_copy = item.copy()
                if isinstance(item_copy.get('created_at'), datetime):
                    item_copy['created_at'] = item_copy['created_at'].isoformat()
                if isinstance(item_copy.get('_fetch_time'), datetime):
                    item_copy['_fetch_time'] = item_copy['_fetch_time'].isoformat()
                data_copy.append(item_copy)
            
            return json.dumps(data_copy, indent=2)
        
        return str(self.aggregated_data)


def get_multi_source_aggregator():
    """Factory function to get aggregator instance"""
    aggregator = MultiSourceAggregator()
    aggregator.add_default_sources()
    return aggregator
