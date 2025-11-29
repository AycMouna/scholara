from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    EnrollmentViewSet,
    enroll_student,
    unenroll_student,
    list_course_students,
    list_student_courses,
)

router = DefaultRouter()
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    path('courses/<int:course_id>/enroll/', enroll_student, name='enroll-student'),
    path('courses/<int:course_id>/unenroll/', unenroll_student, name='unenroll-student'),
    path('courses/<int:course_id>/students/', list_course_students, name='course-students'),
    path('students/<int:student_id>/courses/', list_student_courses, name='student-courses'),
]


