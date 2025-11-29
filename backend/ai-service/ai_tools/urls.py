"""
URL configuration for ai_tools app.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('translate/', views.translate, name='translate'),
    path('summarize/', views.summarize, name='summarize'),
    path('languages/', views.supported_languages, name='supported_languages'),
    path('health/', views.health, name='health'),
]

