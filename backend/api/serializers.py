from rest_framework import serializers
from .models import User, Course, Enrollment, Resource, Assignment, Submission, Notification


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'bio', 'avatar']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class CourseSerializer(serializers.ModelSerializer):
    tutor = UserSerializer(read_only=True)
    student_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'tutor', 'created_at', 'thumbnail', 'student_count', 'is_enrolled']

    def get_student_count(self, obj):
        return obj.enrollments.count()

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(student=request.user).exists()
        return False


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'


class AssignmentSerializer(serializers.ModelSerializer):
    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = '__all__'

    def get_submission_count(self, obj):
        return obj.submissions.count()


class SubmissionSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ['student', 'submitted_at', 'status', 'score', 'feedback']


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['score', 'feedback', 'status']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'
