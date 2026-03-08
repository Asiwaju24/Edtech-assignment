from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Course, Enrollment, Resource, Assignment, Submission, Notification

admin.site.register(User, UserAdmin)
admin.site.register(Course)
admin.site.register(Enrollment)
admin.site.register(Resource)
admin.site.register(Assignment)
admin.site.register(Submission)
admin.site.register(Notification)
