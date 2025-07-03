from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'lgas', views.LGAViewSet)
router.register(r'polling-units', views.PollingUnitViewSet)
router.register(r'assignments', views.AssignmentViewSet)
router.register(r'observer-assignments', views.ObserverAssignmentViewSet, basename='observer-assignments')
router.register(r'form-templates', views.FormTemplateViewSet)
router.register(r'submissions', views.SubmissionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
]