from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator, MinValueValidator, MaxValueValidator

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('student_working', 'Work Scholar'),
        ('supervisor', 'Supervisor'),
        ('director', 'Director'),
        ('admin', 'Admin'),
    )

    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='student_working')
    id_number = models.CharField(max_length=20, unique=True, null=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    total_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    hourly_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_manager = models.BooleanField(default=False)

    def is_absolute_admin(self):
        return self.is_manager and self.username == 'admin' and self.email == 'brentifromph696@gmail.com'

    class Meta:
        db_table = 'auth_user'

class WorkSchedule(models.Model):
    DAY_CHOICES = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=100)

    class Meta:
        ordering = ['day', 'start_time']

class WorkAssignment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments')
    supervisor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='supervised_assignments')
    department = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

class TimeSheet(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='timesheets')
    assignment = models.ForeignKey(WorkAssignment, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    hours_worked = models.DecimalField(max_digits=4, decimal_places=2)
    description = models.TextField()
    approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='approved_timesheets')
    approved_at = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.hours_worked:
            # Calculate hours worked
            start = timezone.datetime.combine(self.date, self.start_time)
            end = timezone.datetime.combine(self.date, self.end_time)
            duration = end - start
            self.hours_worked = duration.total_seconds() / 3600
        
        if self.approved and not self.approved_at:
            self.approved_at = timezone.now()
        
        super().save(*args, **kwargs)

        # Update user's total hours
        if self.approved:
            self.student.total_hours += self.hours_worked
            self.student.save()

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    notification_type = models.CharField(max_length=50, default='info')  # info, warning, success, error

    class Meta:
        ordering = ['-timestamp']

class LoginBackground(models.Model):
    image = models.ImageField(
        upload_to='login_backgrounds/',
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

class ManagerBackground(models.Model):
    image = models.ImageField(
        upload_to='manager_backgrounds/',
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])]
    )
    opacity = models.FloatField(default=0.25, validators=[
        MinValueValidator(0.0),
        MaxValueValidator(1.0)
    ])
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
