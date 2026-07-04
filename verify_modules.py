#!/usr/bin/env python
"""
Verification script to ensure all dependencies are properly loaded
"""

import sys
import os

# Add project root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def verify_database():
    """Verify DatabaseManager has all required methods"""
    from backend.database import DatabaseManager
    
    db = DatabaseManager()
    required_methods = [
        'get_connection',
        'init_database',
        'get_user',
        'get_user_info',  # NEW METHOD
        'get_user_analyses',
        'save_analysis',
        'save_analysis_entry',
        'save_analysis_summary',
        'get_analysis_entries',
        'get_analysis_summary',
        'delete_analysis'
    ]
    
    print("✓ DatabaseManager Methods Check:")
    for method in required_methods:
        has_method = hasattr(db, method)
        status = "✓" if has_method else "✗"
        print(f"  {status} {method}")
    
    return all(hasattr(db, m) for m in required_methods)

def verify_sentiment_service():
    """Verify SentimentAnalyzer has required methods"""
    from backend.sentiment_service import get_sentiment_analyzer, SentimentAnalyzer
    
    analyzer = get_sentiment_analyzer()
    required_methods = ['analyze', 'analyze_sentiment', 'batch_analyze']
    
    print("\n✓ SentimentAnalyzer Methods Check:")
    for method in required_methods:
        has_method = hasattr(analyzer, method)
        status = "✓" if has_method else "✗"
        print(f"  {status} {method}")
    
    return all(hasattr(analyzer, m) for m in required_methods)

def verify_auth_service():
    """Verify AuthenticationManager exists"""
    from backend.auth_service import AuthenticationManager
    
    auth = AuthenticationManager()
    required_methods = ['signup', 'login']
    
    print("\n✓ AuthenticationManager Methods Check:")
    for method in required_methods:
        has_method = hasattr(auth, method)
        status = "✓" if has_method else "✗"
        print(f"  {status} {method}")
    
    return all(hasattr(auth, m) for m in required_methods)

def main():
    print("=" * 50)
    print("BrandPulse - Module Verification")
    print("=" * 50)
    
    try:
        db_ok = verify_database()
        sentiment_ok = verify_sentiment_service()
        auth_ok = verify_auth_service()
        
        print("\n" + "=" * 50)
        all_ok = db_ok and sentiment_ok and auth_ok
        
        if all_ok:
            print("✓ ALL CHECKS PASSED - Ready to run!")
            print("=" * 50)
            print("\nRun the app with:")
            print("  streamlit run app/main.py")
            return 0
        else:
            print("✗ SOME CHECKS FAILED")
            print("=" * 50)
            return 1
    
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
