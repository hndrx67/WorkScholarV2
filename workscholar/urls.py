"""
URL configuration for workscholar project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from accounts import views as accounts_views

urlpatterns = [
    path('django-admin/', admin.site.urls),  # Changed from 'admin/' to 'django-admin/'
    path('login/', accounts_views.login_view, name='login'),
    path('logout/', accounts_views.custom_logout, name='logout'),
    path('', accounts_views.login_view, name='home'),
    
    # Admin URLs
    path('admin/dashboard/', accounts_views.admin_dashboard, name='admin_dashboard'),
    path('admin/add-user/', accounts_views.add_user, name='add_user'),
    path('admin/edit-user/', accounts_views.edit_user, name='edit_user'),
    path('admin/delete-user/', accounts_views.delete_user, name='delete_user'),
    path('admin/change-password/', accounts_views.change_password, name='change_password'),
    path('admin/update-login-background/', accounts_views.update_login_background, name='update_login_background'),
    path('admin/update-manager-background/', accounts_views.update_manager_background, name='update_manager_background'),
    
    # Dashboard URLs - Note the admin dashboard URL is now before django-admin
    path('dashboard/', accounts_views.student_dashboard, name='student_dashboard'),
    path('supervisor/dashboard/', accounts_views.supervisor_dashboard, name='supervisor_dashboard'),
    path('director/dashboard/', accounts_views.director_dashboard, name='director_dashboard'),
    
    # Timesheet management URLs
    path('timesheet/submit/', accounts_views.submit_timesheet, name='submit_timesheet'),
    path('timesheet/<int:timesheet_id>/approve/', accounts_views.approve_timesheet, name='approve_timesheet'),
    path('timesheet/<int:timesheet_id>/reject/', accounts_views.reject_timesheet, name='reject_timesheet'),
    
    # Password Reset URLs
    path('password_reset/', auth_views.PasswordResetView.as_view(
        template_name='password_reset.html'
    ), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(
        template_name='password_reset_done.html'
    ), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='password_reset_confirm.html'
    ), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(
        template_name='password_reset_complete.html'
    ), name='password_reset_complete'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
