from rest_framework import serializers
from .models import Enrollment
from courses.models import Course


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'student_id', 'course', 'enrolled_at']
        read_only_fields = ['id', 'enrolled_at']

    def validate(self, attrs):
        student_id = attrs.get('student_id')
        course = attrs.get('course')
        if Enrollment.objects.filter(student_id=student_id, course=course).exists():
            raise serializers.ValidationError('Student already enrolled in this course')
        return attrs


class CourseEnrollmentCreateSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()

    def validate(self, attrs):
        course: Course = self.context['course']
        student_id = attrs['student_id']
        exists = Enrollment.objects.filter(course=course, student_id=student_id).exists()
        if exists:
            raise serializers.ValidationError('Student already enrolled in this course')
        return attrs


