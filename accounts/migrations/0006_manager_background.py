from django.db import migrations, models
from django.core.validators import FileExtensionValidator

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_add_manager_field'),
    ]

    operations = [
        migrations.CreateModel(
            name='ManagerBackground',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='manager_backgrounds/', validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])])),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-uploaded_at'],
            },
        ),
    ]