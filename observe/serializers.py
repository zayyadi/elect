from rest_framework import serializers
from .models import User, LGA, PollingUnit, Assignment, FormTemplate, Submission

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'is_observer', 'is_staff']

class LGASerializer(serializers.ModelSerializer):
    class Meta:
        model = LGA
        fields = '__all__'

class PollingUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollingUnit
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    polling_units = PollingUnitSerializer(many=True, read_only=True)
    class Meta:
        model = Assignment
        fields = ['id', 'observer', 'lga', 'polling_units']

class FormTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormTemplate
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'
