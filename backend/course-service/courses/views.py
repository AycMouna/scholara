from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
import logging
from .models import Course
from .serializers import CourseSerializer, CourseListSerializer

logger = logging.getLogger(__name__)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'instructor', 'category']
    ordering_fields = ['name', 'instructor']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        return CourseSerializer

    def create(self, request, *args, **kwargs):
        """Override create to add success message"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        # Log success message
        course_name = serializer.data.get('name', 'Unknown')
        logger.info(f"✅ New course created: '{course_name}' by {serializer.data.get('instructor', 'Unknown')}")

        # Return success message with course data
        response_data = {
            'message': f'Course "{course_name}" created successfully!',
            'course': serializer.data
        }
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Override update to add success message"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Log success message
        course_name = serializer.data.get('name', 'Unknown')
        logger.info(f"✅ Course updated: '{course_name}'")
        
        # Return success message with course data
        response_data = {
            'message': f'Course "{course_name}" updated successfully!',
            'course': serializer.data
        }
        return Response(response_data)

    def destroy(self, request, *args, **kwargs):
        """Override destroy to add success message"""
        instance = self.get_object()
        course_name = instance.name
        self.perform_destroy(instance)
        
        # Log success message
        logger.info(f"✅ Course deleted: '{course_name}'")
        
        return Response(
            {'message': f'Course "{course_name}" deleted successfully!'}, 
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Recherche avancée de cours"""
        query = request.query_params.get('q', '')
        category = request.query_params.get('category', '')
        instructor = request.query_params.get('instructor', '')
        
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(instructor__icontains=query) |
                Q(category__icontains=query)
            )
        
        if category:
            queryset = queryset.filter(category=category)
            
        if instructor:
            queryset = queryset.filter(instructor__icontains=instructor)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Obtenir toutes les catégories disponibles"""
        categories = Course.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))

    @action(detail=False, methods=['get'])
    def instructors(self, request):
        """Obtenir tous les instructeurs"""
        instructors = Course.objects.values_list('instructor', flat=True).distinct()
        return Response(list(instructors))

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des cours"""
        total_courses = Course.objects.count()
        
        return Response({
            'total_courses': total_courses
        })


