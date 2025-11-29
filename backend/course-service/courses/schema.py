import graphene
from graphene_django import DjangoObjectType
from .models import Course, StudentCourse


class CourseType(DjangoObjectType):
    class Meta:
        model = Course
        fields = "__all__"

    current_students_count = graphene.Int()
    is_full = graphene.Boolean()

    def resolve_current_students_count(self, info):
        return self.current_students_count

    def resolve_is_full(self, info):
        return self.is_full


class StudentCourseType(DjangoObjectType):
    class Meta:
        model = StudentCourse
        fields = "__all__"


class Query(graphene.ObjectType):
    courses = graphene.List(CourseType)
    course = graphene.Field(CourseType, id=graphene.Int())
    search_courses = graphene.List(CourseType, search_term=graphene.String())
    courses_by_instructor = graphene.List(CourseType, instructor=graphene.String())
    courses_by_category = graphene.List(CourseType, category=graphene.String())
    student_courses = graphene.List(StudentCourseType, student_id=graphene.Int())

    def resolve_courses(self, info):
        return Course.objects.all()

    def resolve_course(self, info, id):
        try:
            return Course.objects.get(id=id)
        except Course.DoesNotExist:
            return None

    def resolve_search_courses(self, info, search_term):
        return Course.objects.filter(
            name__icontains=search_term
        ) | Course.objects.filter(
            instructor__icontains=search_term
        ) | Course.objects.filter(
            description__icontains=search_term
        )

    def resolve_courses_by_instructor(self, info, instructor):
        return Course.objects.filter(instructor__icontains=instructor)

    def resolve_courses_by_category(self, info, category):
        return Course.objects.filter(category=category)

    def resolve_student_courses(self, info, student_id):
        return StudentCourse.objects.filter(student_id=student_id, is_active=True)


class CreateCourse(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        instructor = graphene.String(required=True)
        category = graphene.String(required=True)
        schedule = graphene.String(required=True)
        description = graphene.String()
        max_students = graphene.Int()

    course = graphene.Field(CourseType)

    def mutate(self, info, name, instructor, category, schedule, description=None, max_students=30):
        course = Course.objects.create(
            name=name,
            instructor=instructor,
            category=category,
            schedule=schedule,
            description=description,
            max_students=max_students
        )
        return CreateCourse(course=course)


class UpdateCourse(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        name = graphene.String()
        instructor = graphene.String()
        category = graphene.String()
        schedule = graphene.String()
        description = graphene.String()
        max_students = graphene.Int()
        is_active = graphene.Boolean()

    course = graphene.Field(CourseType)

    def mutate(self, info, id, **kwargs):
        try:
            course = Course.objects.get(id=id)
            for field, value in kwargs.items():
                if value is not None:
                    setattr(course, field, value)
            course.save()
            return UpdateCourse(course=course)
        except Course.DoesNotExist:
            return None


class DeleteCourse(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            course = Course.objects.get(id=id)
            course.delete()
            return DeleteCourse(success=True)
        except Course.DoesNotExist:
            return DeleteCourse(success=False)


class EnrollStudent(graphene.Mutation):
    class Arguments:
        course_id = graphene.Int(required=True)
        student_id = graphene.Int(required=True)

    student_course = graphene.Field(StudentCourseType)

    def mutate(self, info, course_id, student_id):
        try:
            course = Course.objects.get(id=course_id)
            if course.is_full:
                raise Exception("Course is full")
            
            student_course, created = StudentCourse.objects.get_or_create(
                course=course,
                student_id=student_id,
                defaults={'is_active': True}
            )
            
            if not created:
                student_course.is_active = True
                student_course.save()
            
            return EnrollStudent(student_course=student_course)
        except Course.DoesNotExist:
            raise Exception("Course not found")


class UnenrollStudent(graphene.Mutation):
    class Arguments:
        course_id = graphene.Int(required=True)
        student_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(self, info, course_id, student_id):
        try:
            student_course = StudentCourse.objects.get(
                course_id=course_id,
                student_id=student_id
            )
            student_course.delete()
            return UnenrollStudent(success=True)
        except StudentCourse.DoesNotExist:
            return UnenrollStudent(success=False)


class Mutation(graphene.ObjectType):
    create_course = CreateCourse.Field()
    update_course = UpdateCourse.Field()
    delete_course = DeleteCourse.Field()
    enroll_student = EnrollStudent.Field()
    unenroll_student = UnenrollStudent.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
