"""
URL configuration for ai_service project.
"""
from django.contrib import admin
from django.urls import path, include

from django.http import JsonResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('ai_tools.urls')),
    path('api/health/', include('ai_tools.urls')),  # Health check is in ai_tools.urls
    path('health/', lambda request: JsonResponse({'status': 'ok', 'service': 'ai-service'})),
    path('', lambda request: JsonResponse({'status': 'ok', 'service': 'ai-service', 'message': 'AI Service is running. Use /api/ endpoints.'})),
]

