"""
URL configuration for course_service project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# Health check view
def health_check(request):
    return JsonResponse({'status': 'healthy'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('courses.urls')),
    path('api/', include('enrollments.urls')),
    path('api/health/', health_check),
    # path('graphql/', GraphQLView.as_view(graphiql=True)),  # Temporairement désactivé
]
