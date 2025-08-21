from django.urls import path
from .views import NewsView, GoogleOAuthView, MeView
from rest_framework_simplejwt.views import TokenRefreshView
from app.views import home

urlpatterns = [
    path("api/news/", NewsView.as_view(), name="news"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/google/", GoogleOAuthView.as_view(), name="google_login"),  # frontend expects this
    path("api/me/", MeView.as_view(), name="me"),
    path("", home),
]
