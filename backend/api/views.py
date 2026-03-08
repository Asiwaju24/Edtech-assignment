from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import User, Course, Enrollment, Resource, Assignment, Submission, Notification
from .serializers import (
    UserSerializer, RegisterSerializer, CourseSerializer, ResourceSerializer,
    AssignmentSerializer, SubmissionSerializer, GradeSerializer,
    NotificationSerializer, EnrollmentSerializer
)


def send_notification(user, message):
    Notification.objects.create(user=user, message=message)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notifications_{user.id}',
        {'type': 'send_notification', 'message': message}
    )


# Auth
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# Courses
class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'tutor':
            return Course.objects.filter(tutor=user)
        return Course.objects.filter(enrollments__student=user)

    def perform_create(self, serializer):
        if self.request.user.role != 'tutor':
            raise permissions.PermissionDenied("Only tutors can create courses.")
        serializer.save(tutor=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}


class AllCoursesView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}


# Enrollment
class EnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        if request.user.role != 'student':
            return Response({'error': 'Only students can enroll.'}, status=400)
        enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=course)
        if not created:
            return Response({'error': 'Already enrolled.'}, status=400)
        send_notification(course.tutor, f"{request.user.username} enrolled in your course '{course.title}'")
        return Response({'message': 'Enrolled successfully.'})


# Resources
class ResourceListCreateView(generics.ListCreateAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resource.objects.filter(course_id=self.kwargs['course_id'])

    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        if self.request.user != course.tutor:
            raise permissions.PermissionDenied()
        resource = serializer.save(course=course)
        for enrollment in course.enrollments.all():
            send_notification(enrollment.student, f"New resource '{resource.title}' added in '{course.title}'")


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Resource.objects.all()


# Assignments
class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Assignment.objects.filter(course_id=self.kwargs['course_id'])

    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        if self.request.user != course.tutor:
            raise permissions.PermissionDenied()
        assignment = serializer.save(course=course)
        for enrollment in course.enrollments.all():
            send_notification(enrollment.student, f"New assignment '{assignment.title}' in '{course.title}' due {assignment.due_date.strftime('%b %d, %Y')}")


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Assignment.objects.all()


# Submissions
class SubmissionListView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        assignment = get_object_or_404(Assignment, id=self.kwargs['assignment_id'])
        if self.request.user == assignment.course.tutor:
            return Submission.objects.filter(assignment=assignment)
        return Submission.objects.filter(assignment=assignment, student=self.request.user)


class SubmitAssignmentView(generics.CreateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        assignment = get_object_or_404(Assignment, id=self.kwargs['assignment_id'])
        if self.request.user.role != 'student':
            raise permissions.PermissionDenied()
        submission = serializer.save(student=self.request.user, assignment=assignment)
        send_notification(assignment.course.tutor, f"{self.request.user.username} submitted '{assignment.title}'")


class GradeSubmissionView(generics.UpdateAPIView):
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Submission.objects.all()

    def perform_update(self, serializer):
        submission = self.get_object()
        if self.request.user != submission.assignment.course.tutor:
            raise permissions.PermissionDenied()
        submission = serializer.save(status='graded')
        send_notification(submission.student, f"Your submission for '{submission.assignment.title}' was graded: {submission.score}/{submission.assignment.max_score}")


# Notifications
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read.'})
