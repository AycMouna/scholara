from django.db import models
from courses.models import Course


class Enrollment(models.Model):
    student_id = models.IntegerField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student_id', 'course')
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'

    def __str__(self) -> str:
        return f"Enrollment(student_id={self.student_id}, course_id={self.course_id})"


