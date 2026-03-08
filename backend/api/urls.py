from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', TokenObtainPairView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('auth/me/', views.MeView.as_view()),

    # Courses
    path('courses/', views.CourseListCreateView.as_view()),
    path('courses/all/', views.AllCoursesView.as_view()),
    path('courses/<int:pk>/', views.CourseDetailView.as_view()),
    path('courses/<int:course_id>/enroll/', views.EnrollView.as_view()),

    # Resources
    path('courses/<int:course_id>/resources/', views.ResourceListCreateView.as_view()),
    path('resources/<int:pk>/', views.ResourceDetailView.as_view()),

    # Assignments
    path('courses/<int:course_id>/assignments/', views.AssignmentListCreateView.as_view()),
    path('assignments/<int:pk>/', views.AssignmentDetailView.as_view()),

    # Submissions
    path('assignments/<int:assignment_id>/submissions/', views.SubmissionListView.as_view()),
    path('assignments/<int:assignment_id>/submit/', views.SubmitAssignmentView.as_view()),
    path('submissions/<int:pk>/grade/', views.GradeSubmissionView.as_view()),

    # Notifications
    path('notifications/', views.NotificationListView.as_view()),
    path('notifications/read/', views.mark_notifications_read),
]
