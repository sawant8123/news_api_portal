# app/views.py
from django.contrib.auth.models import User
from django.db import transaction
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

import requests as py_requests  # normal requests for News API
import re

from google.oauth2 import id_token
from google.auth.transport import requests as grequests

from .models import Profile

from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to my Django backend!")

def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}

def safe_username_from_email(email: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9._-]", "", email.split("@")[0])[:20] or "user"
    candidate = base
    i = 1
    while User.objects.filter(username=candidate).exists():
        candidate = f"{base}{i}"
        i += 1
    return candidate

# ----------------------
# Google OAuth Login
# ----------------------
class GoogleOAuthView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        id_tok = request.data.get("id_token")
        if not id_tok:
            return Response({"detail": "id_token missing"}, status=400)
        try:
            info = id_token.verify_oauth2_token(
                id_tok, grequests.Request(), settings.GOOGLE_CLIENT_ID
            )
            if info.get("aud") != settings.GOOGLE_CLIENT_ID:
                return Response({"detail": "Invalid audience"}, status=400)

            email = info.get("email")
            sub = info.get("sub")
            name = info.get("name", "")
            first = name.split(" ")[0] if name else ""
            last = " ".join(name.split(" ")[1:]) if name and " " in name else ""

            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.create(
                    username=safe_username_from_email(email),
                    email=email,
                    first_name=first,
                    last_name=last,
                )
            else:
                # Update name if changed
                if first and user.first_name != first:
                    user.first_name = first
                if last and user.last_name != last:
                    user.last_name = last
                user.save()

            # Update profile with Google sub
            Profile.objects.update_or_create(user=user, defaults={"google_sub": sub})

            return Response(
                {
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "name": user.get_full_name(),
                    },
                    "tokens": tokens_for_user(user),
                }
            )
        except ValueError as e:
            return Response({"detail": f"Invalid token: {e}"}, status=400)

# ----------------------
# News Fetching
# ----------------------
class NewsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get("q")
        country = request.query_params.get("country", "us")  # Default to US for more reliable results
        # Optional category filter for top-headlines
        category = request.query_params.get("category")
        allowed_categories = {
            "business",
            "entertainment",
            "general",
            "health",
            "science",
            "sports",
            "technology",
        }
        api_key = settings.NEWS_API_KEY

        if not api_key:
            return Response({"detail": "NEWS_API_KEY missing on server. Please set NEWS_API_KEY in your .env file."}, status=500)

        # Build a single fast request (no sequential fallbacks)
        if not q:
            base = "https://newsapi.org/v2/top-headlines"
            params = {"country": country, "apiKey": api_key, "pageSize": 20}
            if category and category in allowed_categories:
                params["category"] = category
            if category and category not in allowed_categories:
                params["q"] = category
        else:
            base = "https://newsapi.org/v2/everything"
            q_terms = q
            if category:
                q_terms = f"{q} {category}"
            params = {"q": q_terms, "sortBy": "publishedAt", "language": "en", "apiKey": api_key, "pageSize": 20}

        try:
            print(f"Making request to: {base}")
            print(f"With params: {params}")
            r = py_requests.get(base, params=params, timeout=6)
            print(f"Response status: {r.status_code}")
            
            if r.status_code != 200:
                print(f"News API error response: {r.text}")
                return Response({"detail": f"News API returned status {r.status_code}: {r.text}"}, status=502)
            
            data = r.json()
            print(f"News API response: {data}")
            
            if "error" in data:
                return Response({"detail": f"News API error: {data['error']}"}, status=502)
            
            articles = data.get("articles", [])
            normalized = [
                {
                    "title": a.get("title"),
                    "description": a.get("description"),
                    "url": a.get("url"),
                    "image": a.get("urlToImage"),
                    "source": (a.get("source") or {}).get("name"),
                    "publishedAt": a.get("publishedAt"),
                }
                for a in articles if a.get("title") and a.get("url")
            ]
            print(f"Normalized {len(normalized)} articles")
            return Response({"count": len(normalized), "articles": normalized})
        except py_requests.exceptions.RequestException as e:
            print(f"Request exception: {e}")
            return Response({"detail": f"News API request error: {e}"}, status=502)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response({"detail": f"Unexpected error: {e}"}, status=500)

# ----------------------
# Current User Info
# ----------------------
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({"id": u.id, "email": u.email, "name": u.get_full_name()})

# Optional home for testing
from django.http import HttpResponse
def home(request):
    return HttpResponse("Welcome to my Django project!")
