"""
URL configuration for ai_service project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('ai_tools.urls')),
    path('health/', lambda request: __import__('django.http').http.JsonResponse({'status': 'ok'})),
]

