"""
URL configuration for course_service project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('courses.urls')),
    path('api/', include('enrollments.urls')),
    path('health/', include('courses.urls')),
    # path('graphql/', GraphQLView.as_view(graphiql=True)),  # Temporairement désactivé
]
