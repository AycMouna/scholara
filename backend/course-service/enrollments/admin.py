from django.contrib import admin
from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_id', 'course', 'enrolled_at')
    list_filter = ('course',)
    search_fields = ('student_id',)


