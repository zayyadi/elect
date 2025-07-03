from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    is_observer = models.BooleanField(default=False)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='observe_users',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='observe_users',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

class LGA(models.Model):
    name = models.CharField(max_length=100)

class PollingUnit(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    lga = models.ForeignKey(LGA, on_delete=models.CASCADE)

class Assignment(models.Model):
    observer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments')
    lga = models.ForeignKey(LGA, on_delete=models.CASCADE)
    polling_units = models.ManyToManyField(PollingUnit)

class FormTemplate(models.Model):
    FORM_TYPES = [
        ('observation', 'Observation'),
        ('result', 'Result'),
        ('vote_counting', 'Vote Counting'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    json_content = models.JSONField()
    form_type = models.CharField(max_length=50, choices=FORM_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

class Submission(models.Model):
    observer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    polling_unit = models.ForeignKey(PollingUnit, on_delete=models.CASCADE)
    form_template = models.ForeignKey(FormTemplate, on_delete=models.CASCADE)
    responses = models.JSONField()
    submitted_at = models.DateTimeField(auto_now_add=True)
