from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, LGA, PollingUnit, Assignment, FormTemplate, Submission
from .permissions import IsAdminUserOrReadOnly
from .serializers import (
    UserSerializer, LGASerializer, PollingUnitSerializer, AssignmentSerializer,
    FormTemplateSerializer, SubmissionSerializer
)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class LGAViewSet(viewsets.ModelViewSet):
    queryset = LGA.objects.all()
    serializer_class = LGASerializer
    permission_classes = [IsAdminUserOrReadOnly]

class PollingUnitViewSet(viewsets.ModelViewSet):
    queryset = PollingUnit.objects.all()
    serializer_class = PollingUnitSerializer
    permission_classes = [IsAdminUserOrReadOnly]

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAdminUser]

class ObserverAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_observer:
            raise PermissionDenied("Only observers can access this.")
        return Assignment.objects.filter(observer=user)

class FormTemplateViewSet(viewsets.ModelViewSet):
    queryset = FormTemplate.objects.all()
    serializer_class = FormTemplateSerializer
    permission_classes = [permissions.IsAdminUser]

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Submission.objects.all()
        return Submission.objects.filter(observer=user)

    def perform_create(self, serializer):
        observer = self.request.user
        polling_unit = serializer.validated_data['polling_unit']
        assigned_units = PollingUnit.objects.filter(assignment__observer=observer)
        if polling_unit not in assigned_units:
            raise PermissionDenied("You are not assigned to this polling unit.")
        serializer.save(observer=observer)
