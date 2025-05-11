from django.db import migrations, models

def create_manager_user(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    manager = User.objects.filter(username='admin', email='brentifromph696@gmail.com').first()
    if manager:
        manager.is_manager = True
        manager.save()

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_loginbackground'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_manager',
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(create_manager_user),
    ]