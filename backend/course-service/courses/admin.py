from django.contrib import admin
from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'instructor', 'category', 'schedule']
    list_filter = ['category', 'instructor']
    search_fields = ['name', 'instructor']
