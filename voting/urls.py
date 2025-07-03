"""
URL configuration for voting project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    # Django Admin Panel
    path('admin/', admin.site.urls),

    # API endpoints (served by Django REST Framework)
    # We assume your API urls are defined in the 'observe' app's urls.py
    path('api/', include('observe.urls')),

    # Frontend (served by React)
    # This "catch-all" pattern serves the React app's index.html for any non-API URL.
    re_path(r'^.*', TemplateView.as_view(template_name='index.html')),
]