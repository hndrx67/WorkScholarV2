from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, WorkSchedule, WorkAssignment, TimeSheet, Notification

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'id_number', 'department')
    list_filter = ('user_type', 'department', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'id_number')
    ordering = ('username',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Work Scholar Information', {
            'fields': ('user_type', 'id_number', 'department', 'total_hours', 'hourly_rate'),
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Work Scholar Information', {
            'fields': ('user_type', 'id_number', 'department', 'hourly_rate'),
        }),
    )

@admin.register(WorkSchedule)
class WorkScheduleAdmin(admin.ModelAdmin):
    list_display = ('user', 'day', 'start_time', 'end_time', 'location')
    list_filter = ('day', 'location')
    search_fields = ('user__username', 'location')
    ordering = ('day', 'start_time')

@admin.register(WorkAssignment)
class WorkAssignmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'supervisor', 'department', 'position', 'start_date', 'end_date', 'is_active')
    list_filter = ('department', 'is_active')
    search_fields = ('student__username', 'supervisor__username', 'department', 'position')
    date_hierarchy = 'start_date'

@admin.register(TimeSheet)
class TimeSheetAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'hours_worked', 'approved', 'approved_by', 'approved_at')
    list_filter = ('approved', 'date', 'student')
    search_fields = ('student__username', 'description')
    date_hierarchy = 'date'
    readonly_fields = ('hours_worked', 'approved_at')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'timestamp', 'read', 'notification_type')
    list_filter = ('read', 'notification_type', 'timestamp')
    search_fields = ('user__username', 'title', 'message')
    date_hierarchy = 'timestamp'
