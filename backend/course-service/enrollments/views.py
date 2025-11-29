from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Enrollment
from .serializers import EnrollmentSerializer, CourseEnrollmentCreateSerializer
from courses.models import Course


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all().order_by('-enrolled_at')
    serializer_class = EnrollmentSerializer


@api_view(['POST'])
def enroll_student(request, course_id: int):
    course = get_object_or_404(Course, pk=course_id)
    serializer = CourseEnrollmentCreateSerializer(data=request.data, context={'course': course})
    serializer.is_valid(raise_exception=True)

    student_id = serializer.validated_data['student_id']
    enrollment, created = Enrollment.objects.get_or_create(course=course, student_id=student_id)
    if not created:
        return Response({'error': 'Student already enrolled'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)


@api_view(['POST', 'DELETE'])
def unenroll_student(request, course_id: int):
    course = get_object_or_404(Course, pk=course_id)
    student_id = request.data.get('student_id') or request.query_params.get('student_id')
    if not student_id:
        return Response({'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    enrollment = Enrollment.objects.filter(course=course, student_id=student_id).first()
    if not enrollment:
        return Response({'error': 'Enrollment not found'}, status=status.HTTP_404_NOT_FOUND)
    enrollment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def list_course_students(request, course_id: int):
    course = get_object_or_404(Course, pk=course_id)
    enrollments = Enrollment.objects.filter(course=course).order_by('-enrolled_at')
    data = {
        'course_id': course.id,
        'student_ids': [e.student_id for e in enrollments],
        'count': enrollments.count(),
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
def list_student_courses(request, student_id: int):
    enrollments = Enrollment.objects.filter(student_id=student_id).select_related('course')
    courses = [
        {
            'id': e.course.id,
            'name': e.course.name,
            'instructor': e.course.instructor,
            'category': e.course.category,
            'schedule': e.course.schedule,
            'enrolled_at': e.enrolled_at,
        }
        for e in enrollments
    ]
    return Response({'student_id': student_id, 'courses': courses, 'count': len(courses)}, status=status.HTTP_200_OK)


