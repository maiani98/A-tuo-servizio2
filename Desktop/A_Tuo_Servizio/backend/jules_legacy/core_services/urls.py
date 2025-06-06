from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    EmailVerificationView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ProfessionalProfileDetailView,
    ServiceViewSet,
    PortfolioItemViewSet,
    OperatingAreaViewSet,
    CertificationViewSet
)

app_name = 'core_services'

router = DefaultRouter()
router.register(r'profile/services', ServiceViewSet, basename='profile-service')
router.register(r'profile/portfolio-items', PortfolioItemViewSet, basename='profile-portfolioitem')
router.register(r'profile/operating-areas', OperatingAreaViewSet, basename='profile-operatingarea')
router.register(r'profile/certifications', CertificationViewSet, basename='profile-certification')

urlpatterns = [
path('profile/me/', ProfessionalProfileDetailView.as_view(), name='profile-me-detail'),
    path('', include(router.urls)), # Include router URLs

    path('auth/register/', UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', UserLoginView.as_view(), name='token-obtain-pair'),
    path('auth/login/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/logout/', UserLogoutView.as_view(), name='user-logout'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    path('auth/verify-email/<str:token>/', EmailVerificationView.as_view(), name='verify-email'),
    path('auth/password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset/confirm/<str:token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
