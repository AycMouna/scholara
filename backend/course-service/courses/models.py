from django.db import models


class Course(models.Model):
    name = models.CharField(max_length=200)
    instructor = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    schedule = models.TextField()

    class Meta:
        verbose_name = "Cours"
        verbose_name_plural = "Cours"

    def __str__(self):
        return f"{self.name} - {self.instructor}"

