"""
URL configuration for ai_service project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_view(request):
    """Root endpoint - returns service status."""
    return JsonResponse({
        'status': 'ok',
        'service': 'ai-service',
        'message': 'AI Service is running. Use /api/ endpoints.',
        'endpoints': {
            'health': '/api/health/',
            'translate': '/api/translate/',
            'summarize': '/api/summarize/',
            'languages': '/api/languages/'
        }
    })

def health_view(request):
    """Health check endpoint."""
    return JsonResponse({'status': 'ok', 'service': 'ai-service'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('ai_tools.urls')),  # This includes /api/health/, /api/translate/, etc.
    path('health/', health_view),
    path('', root_view),
]

