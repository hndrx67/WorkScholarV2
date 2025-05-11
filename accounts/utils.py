from django.shortcuts import redirect
from django.contrib import messages
from functools import wraps
from datetime import datetime, timedelta
from .models import TimeSheet, WorkSchedule, Notification

def user_type_required(allowed_types):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                messages.error(request, 'Please log in to access this page.')
                return redirect('login')
            
            if request.user.user_type not in allowed_types and not request.user.is_superuser:
                messages.error(request, 'You do not have permission to access this page.')
                return redirect('login')
                
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator

def get_weekly_hours(user):
    """Get the total hours worked in the current week"""
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    weekly_timesheets = TimeSheet.objects.filter(
        student=user,
        date__range=[week_start.date(), week_end.date()],
        approved=True
    )
    
    return sum(timesheet.hours_worked for timesheet in weekly_timesheets)

def get_weekly_schedule(user):
    """Get the user's work schedule for the current week"""
    schedules = WorkSchedule.objects.filter(user=user).order_by('day', 'start_time')
    schedule_dict = {}
    
    for schedule in schedules:
        schedule_dict[schedule.day] = {
            'start_time': schedule.start_time.strftime('%I:%M %p'),
            'end_time': schedule.end_time.strftime('%I:%M %p'),
            'location': schedule.location
        }
    
    return schedule_dict

def get_unread_notifications(user):
    """Get unread notifications for the user"""
    return Notification.objects.filter(user=user, read=False).order_by('-timestamp')

def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        notification = Notification.objects.get(id=notification_id)
        notification.read = True
        notification.save()
        return True
    except Notification.DoesNotExist:
        return False

def create_notification(user, title, message, notification_type='info'):
    """Create a new notification for a user"""
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type
    )

def get_total_assignments(user):
    """Get the total number of active work assignments for a student"""
    return user.assignments.filter(is_active=True).count()

def calculate_earnings(user, start_date=None, end_date=None):
    """Calculate earnings for a given time period"""
    timesheets = TimeSheet.objects.filter(student=user, approved=True)
    
    if start_date:
        timesheets = timesheets.filter(date__gte=start_date)
    if end_date:
        timesheets = timesheets.filter(date__lte=end_date)
    
    total_hours = sum(timesheet.hours_worked for timesheet in timesheets)
    return total_hours * user.hourly_rate