from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.http import JsonResponse
from django.db import models, transaction
from datetime import timedelta
from .models import User, WorkAssignment, TimeSheet, LoginBackground, ManagerBackground
from .utils import (
    user_type_required,
    get_weekly_hours,
    get_weekly_schedule,
    get_unread_notifications,
    get_total_assignments,
    calculate_earnings,
    create_notification
)
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.utils.cache import add_never_cache_headers
from .forms import LoginBackgroundForm, ManagerBackgroundForm

@never_cache
def login_view(request):
    if request.user.is_authenticated:
        messages.info(request, 'You are already logged in')
        if request.user.user_type == 'student_working':
            return redirect('student_dashboard')
        elif request.user.user_type == 'supervisor':
            return redirect('supervisor_dashboard')
        elif request.user.user_type == 'director':
            return redirect('director_dashboard')
        elif request.user.user_type == 'admin' or request.user.is_superuser:
            return redirect('admin_dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, f'Welcome back, {user.username}!')
            
            # Redirect based on user type
            if user.user_type == 'student_working':
                return redirect('student_dashboard')
            elif user.user_type == 'supervisor':
                return redirect('supervisor_dashboard')
            elif user.user_type == 'director':
                return redirect('director_dashboard')
            elif user.user_type == 'admin' or user.is_superuser:
                return redirect('admin_dashboard')
            else:
                messages.error(request, 'Invalid user type')
                return redirect('login')
        else:
            messages.error(request, 'Invalid username or password')
    
    # Get the latest login background
    login_background = LoginBackground.objects.first()
    
    response = render(request, 'login.html', {'login_background': login_background})
    add_never_cache_headers(response)
    return response

@never_cache
def custom_logout(request):
    if request.user.is_authenticated:
        messages.success(request, 'You have been successfully logged out.')
        logout(request)
    else:
        messages.warning(request, 'You are not logged in')
    response = redirect('login')
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response

@never_cache
@login_required
@user_type_required(['student_working'])
def student_dashboard(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Please login first')
        return redirect('login')
    user = request.user
    current_date = timezone.now()
    
    # Get work statistics
    hours_this_week = get_weekly_hours(user)
    total_hours = user.total_hours
    total_assignments = get_total_assignments(user)
    earnings_this_week = calculate_earnings(user, 
                                         start_date=current_date - timedelta(days=current_date.weekday()),
                                         end_date=current_date)
    
    # Get schedule and notifications
    weekly_schedule = []
    schedule_dict = get_weekly_schedule(user)
    
    for day, schedule in schedule_dict.items():
        weekly_schedule.append({
            'day': day.capitalize(),
            'time': f"{schedule['start_time']} - {schedule['end_time']}",
            'location': schedule['location']
        })
    
    notifications = get_unread_notifications(user)
    
    # Get active assignments
    active_assignments = WorkAssignment.objects.filter(
        student=user,
        is_active=True
    ).select_related('supervisor')
    
    # Get recent timesheets
    recent_timesheets = TimeSheet.objects.filter(
        student=user
    ).order_by('-date')[:5]
    
    context = {
        'hours_this_week': hours_this_week,
        'total_hours': total_hours,
        'total_assignments': total_assignments,
        'earnings_this_week': earnings_this_week,
        'weekly_schedule': weekly_schedule,
        'notifications': notifications,
        'active_assignments': active_assignments,
        'recent_timesheets': recent_timesheets,
    }
    
    response = render(request, 'student_dashboard.html', context)
    add_never_cache_headers(response)
    return response

@never_cache
@login_required
@user_type_required(['admin'])
def edit_user(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        target_user = get_object_or_404(User, id=user_id)
        
        # Check if current user has permission to edit the target user
        if target_user.user_type == 'admin' and not request.user.is_absolute_admin():
            messages.error(request, 'You do not have permission to edit admin accounts')
            return redirect('add_user')
            
        username = request.POST.get('username')
        email = request.POST.get('email')
        user_type = request.POST.get('user_type')
        id_number = request.POST.get('id_number')
        
        if User.objects.exclude(id=user_id).filter(username=username).exists():
            messages.error(request, 'Username already exists')
            return redirect('add_user')
            
        if User.objects.exclude(id=user_id).filter(email=email).exists():
            messages.error(request, 'Email already exists')
            return redirect('add_user')
            
        try:
            target_user.username = username
            target_user.email = email
            target_user.user_type = user_type
            target_user.id_number = id_number
            target_user.save()
            
            messages.success(request, f'Successfully updated user: {username}')
        except Exception as e:
            messages.error(request, f'Error updating user: {str(e)}')
            
        return redirect('add_user')
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
@user_type_required(['admin'])
def delete_user(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        user = get_object_or_404(User, id=user_id)
        
        # Check if current user has permission to delete the target user
        if user.user_type == 'admin' and not request.user.is_absolute_admin():
            messages.error(request, 'You do not have permission to delete admin accounts')
            return redirect('add_user')
        
        try:
            username = user.username
            user.delete()
            messages.success(request, f'Successfully deleted user: {username}')
        except Exception as e:
            messages.error(request, f'Error deleting user: {str(e)}')
            
        return redirect('add_user')
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
@user_type_required(['admin'])
def change_password(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        user = get_object_or_404(User, id=user_id)
        
        # Check if current user has permission to change password of target user
        if user.user_type == 'admin' and not request.user.is_absolute_admin():
            messages.error(request, 'You do not have permission to change admin passwords')
            return redirect('add_user')
            
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_new_password')
        
        if new_password != confirm_password:
            messages.error(request, 'Passwords do not match')
            return redirect('add_user')
            
        try:
            user.set_password(new_password)
            user.save()
            messages.success(request, f'Successfully changed password for user: {user.username}')
        except Exception as e:
            messages.error(request, f'Error changing password: {str(e)}')
            
        return redirect('add_user')
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
@user_type_required(['admin'])
def admin_dashboard(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Please login first')
        return redirect('login')

    # Get statistics for the dashboard
    total_students = User.objects.filter(user_type='student_working').count()
    active_assignments = WorkAssignment.objects.filter(is_active=True).count()
    total_departments = WorkAssignment.objects.values('department').distinct().count()
    total_hours = TimeSheet.objects.filter(approved=True).aggregate(
        total=models.Sum('hours_worked')
    )['total'] or 0

    # Get the manager background if it exists
    manager_background = ManagerBackground.objects.first()

    context = {
        'total_students': total_students,
        'active_assignments': active_assignments,
        'total_departments': total_departments,
        'total_hours': total_hours,
        'is_manager': request.user.is_absolute_admin(),
        'manager_background': manager_background,
    }

    template = 'admin_dashboard_manager.html' if request.user.is_absolute_admin() else 'admin_dashboard.html'
    response = render(request, template, context)
    add_never_cache_headers(response)
    return response

@login_required
@user_type_required(['supervisor'])
def supervisor_dashboard(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Please login first')
        return redirect('login')
    # Get supervised students and assignments
    supervised_assignments = WorkAssignment.objects.filter(
        supervisor=request.user,
        is_active=True
    ).select_related('student')
    
    pending_timesheets = TimeSheet.objects.filter(
        assignment__supervisor=request.user,
        approved=False
    ).select_related('student', 'assignment').order_by('-date')
    
    context = {
        'supervised_assignments': supervised_assignments,
        'pending_timesheets': pending_timesheets,
    }
    
    response = render(request, 'supervisor_dashboard.html', context)
    add_never_cache_headers(response)
    return response

@never_cache
@login_required
@user_type_required(['director'])
def director_dashboard(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Please login first')
        return redirect('login')
    # Get department statistics
    department_stats = WorkAssignment.objects.values('department').annotate(
        total_students=models.Count('student', distinct=True),
        total_hours=models.Sum('student__total_hours'),
        active_assignments=models.Count('id', filter=models.Q(is_active=True))
    )
    
    # Get overall statistics
    total_work_scholars = User.objects.filter(user_type='student_working').count()
    total_supervisors = User.objects.filter(user_type='supervisor').count()
    total_hours = TimeSheet.objects.filter(approved=True).aggregate(
        total=models.Sum('hours_worked')
    )['total'] or 0
    
    context = {
        'department_stats': department_stats,
        'total_work_scholars': total_work_scholars,
        'total_supervisors': total_supervisors,
        'total_hours': total_hours,
    }
    
    response = render(request, 'director_dashboard.html', context)
    add_never_cache_headers(response)
    return response

@login_required
@user_type_required(['supervisor'])
def approve_timesheet(request, timesheet_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    timesheet = get_object_or_404(TimeSheet, id=timesheet_id)
    
    # Verify the supervisor has permission to approve this timesheet
    if timesheet.assignment.supervisor != request.user:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    try:
        with transaction.atomic():
            timesheet.approved = True
            timesheet.approved_by = request.user
            timesheet.approved_at = timezone.now()
            timesheet.save()
            
            # Update student's total hours
            timesheet.student.total_hours += timesheet.hours_worked
            timesheet.student.save()
            
            # Create notification for the student
            create_notification(
                timesheet.student,
                'Timesheet Approved',
                f'Your timesheet for {timesheet.date} has been approved by {request.user.get_full_name()}',
                'success'
            )
            
        return JsonResponse({
            'success': True,
            'message': 'Timesheet approved successfully',
            'hours_worked': float(timesheet.hours_worked),
            'total_hours': float(timesheet.student.total_hours)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@user_type_required(['supervisor'])
def reject_timesheet(request, timesheet_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    timesheet = get_object_or_404(TimeSheet, id=timesheet_id)
    reason = request.POST.get('reason', '')
    
    # Verify the supervisor has permission to reject this timesheet
    if timesheet.assignment.supervisor != request.user:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    if not reason:
        return JsonResponse({'error': 'Rejection reason is required'}, status=400)
    
    try:
        # Create notification for the student
        create_notification(
            timesheet.student,
            'Timesheet Rejected',
            f'Your timesheet for {timesheet.date} was rejected by {request.user.get_full_name()}. Reason: {reason}',
            'error'
        )
        
        # Delete the timesheet
        timesheet.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Timesheet rejected successfully'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@user_type_required(['student_working', 'supervisor'])
def submit_timesheet(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    try:
        assignment_id = request.POST.get('assignment')
        date = request.POST.get('date')
        start_time = request.POST.get('start_time')
        end_time = request.POST.get('end_time')
        description = request.POST.get('description', '')
        
        if not all([assignment_id, date, start_time, end_time]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        
        assignment = get_object_or_404(WorkAssignment, id=assignment_id)
        
        # Verify the student is assigned to this work assignment
        if request.user.user_type == 'student_working' and assignment.student != request.user:
            return JsonResponse({'error': 'Permission denied'}, status=403)
        
        timesheet = TimeSheet.objects.create(
            student=assignment.student,
            assignment=assignment,
            date=date,
            start_time=start_time,
            end_time=end_time,
            description=description
        )
        
        # Create notification for the supervisor
        create_notification(
            assignment.supervisor,
            'New Timesheet Submitted',
            f'A new timesheet has been submitted by {timesheet.student.get_full_name()} for {date}',
            'info'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Timesheet submitted successfully',
            'timesheet_id': timesheet.id
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@user_type_required(['admin'])
def update_login_background(request):
    if request.method == 'POST':
        form = LoginBackgroundForm(request.POST, request.FILES)
        if form.is_valid():
            # Delete existing background if any
            LoginBackground.objects.all().delete()
            # Save the new background
            background = form.save()
            messages.success(request, 'Login background updated successfully.')
            return redirect('admin_dashboard')
        else:
            messages.error(request, 'Error updating login background. Please check the file and try again.')
    else:
        form = LoginBackgroundForm()
    
    return render(request, 'admin/update_login_background.html', {'form': form})

@login_required
@user_type_required(['admin'])
def update_manager_background(request):
    if not request.user.is_absolute_admin():
        messages.error(request, 'Only the manager has permission to change the dashboard background')
        return redirect('admin_dashboard')
        
    if request.method == 'POST':
        form = ManagerBackgroundForm(request.POST, request.FILES)
        if form.is_valid():
            # Delete existing background if any
            ManagerBackground.objects.all().delete()
            # Save the new background with opacity
            background = form.save()
            messages.success(request, 'Dashboard background and opacity updated successfully.')
            return redirect('admin_dashboard')
        else:
            messages.error(request, 'Error updating background. Please check the file and try again.')
    else:
        # Get current background settings if they exist
        current_background = ManagerBackground.objects.first()
        form = ManagerBackgroundForm(instance=current_background)
    
    return render(request, 'admin/update_manager_background.html', {'form': form})

@login_required
@user_type_required(['admin'])
def add_user(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Please login first')
        return redirect('login')

    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        user_type = request.POST.get('user_type')
        id_number = request.POST.get('id_number')
        
        # Validate passwords match
        if password != confirm_password:
            messages.error(request, 'Passwords do not match')
            return redirect('add_user')
            
        # Check if username exists
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
            return redirect('add_user')
            
        # Check if email exists
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists')
            return redirect('add_user')
            
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                user_type=user_type,
                id_number=id_number
            )
            messages.success(request, f'Successfully created user: {username}')
        except Exception as e:
            messages.error(request, f'Error creating user: {str(e)}')
        
        return redirect('add_user')
        
    # Get all users for display
    users = User.objects.all().order_by('username')
    
    context = {
        'users': users,
    }
    
    response = render(request, 'add_user.html', context)
    add_never_cache_headers(response)
    return response
