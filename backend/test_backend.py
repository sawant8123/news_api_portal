#!/usr/bin/env python
"""
Simple test script to verify backend configuration
"""
import os
import sys
import django

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings

def test_jwt():
    print("Testing JWT configuration...")
    if hasattr(settings, 'SIMPLE_JWT'):
        print("✅ JWT settings found")
        return True
    else:
        print("❌ JWT settings missing")
        return False

def test_env():
    print("Testing environment variables...")
    google_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
    news_key = getattr(settings, 'NEWS_API_KEY', None)
    
    if google_id:
        print("✅ GOOGLE_CLIENT_ID set")
    else:
        print("❌ GOOGLE_CLIENT_ID missing")
    
    if news_key:
        print("✅ NEWS_API_KEY set")
    else:
        print("❌ NEWS_API_KEY missing")
    
    return bool(google_id and news_key)

if __name__ == "__main__":
    print("Backend Configuration Test")
    print("=" * 30)
    
    jwt_ok = test_jwt()
    env_ok = test_env()
    
    if jwt_ok and env_ok:
        print("\n🎉 Backend is properly configured!")
    else:
        print("\n⚠️  Some configuration issues found.")
