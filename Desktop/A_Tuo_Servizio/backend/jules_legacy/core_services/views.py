from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import generics, status, views, permissions, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse


from .serializers import (PasswordResetRequestSerializer, PasswordResetSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    ProfessionalProfileSerializer,
    ServiceSerializer,
    ServiceCategorySerializer,
    PortfolioItemSerializer,
    OperatingAreaSerializer,
    CertificationSerializer)

User = get_user_model()
from .models import ProfessionalProfile, Service, ServiceCategory, PortfolioItem, OperatingArea, Certification

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.is_active = False # Deactivate account until email is verified
        user.generate_email_verification_token()
        # user.save() # generate_email_verification_token already saves

        # Send verification email
        subject = 'Verify your A Tuo Servizio account'
        message = (
            f'Hi {user.username},\n\n'
            f'Please use this token to verify your email: {user.email_verification_token}\n'
            f'Or click the link: {request.scheme}://{request.get_host()}/api/core/auth/verify-email/{user.email_verification_token}/ '
            f'(adjust link as needed for frontend routing)'
        )

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            print(f'Verification email sent to {user.email} (check console). Token: {user.email_verification_token}')
        except Exception as e:
            print(f'Error sending verification email: {e}')
            # Handle error: For instance, do not proceed with user creation or log it.
            # For now, we let it pass, but user won't get an email.

        # Tokens are not returned until email is verified.
        return Response({
            'message': 'User registered successfully. Please check your email to verify your account.'
        }, status=status.HTTP_201_CREATED)

class UserLoginView(TokenObtainPairView):
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            return Response({'errors': e.detail}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user_data
        })

class UserLogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({"detail": "Token is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class EmailVerificationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token, *args, **kwargs):
        try:
            user = User.objects.get(email_verification_token=token)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid or expired verification token.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.email_verification_token_expiry and user.email_verification_token_expiry < timezone.now():
            user.email_verification_token = None
            user.email_verification_token_expiry = None
            user.save()
            return Response({'detail': 'Verification token has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_email_verified:
            return Response({'detail': 'Email is already verified.'}, status=status.HTTP_200_OK)

        user.verify_email()

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response({
            'message': 'Email verified successfully. You can now log in.',
            'user': user_data,
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)


class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            return Response({'detail': 'If an account with this email exists, a password reset link has been sent.'}, status=status.HTTP_200_OK)

        token = user.generate_password_reset_token()

        subject = 'Reset Your A Tuo Servizio Password'
        message = (
            f'Hi {user.username},\n\n'
            f'Please use this token to reset your password: {token}\n'
            f'Or click the link: {request.scheme}://{request.get_host()}/api/core/auth/password-reset/confirm/{token}/ '
            f'(adjust link as needed for frontend routing)'
        )

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            print(f'Password reset email sent to {user.email} (check console). Token: {token}')
        except Exception as e:
            print(f'Error sending password reset email: {e}')

        return Response({'detail': 'If an account with this email exists, a password reset link has been sent.'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, token, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            user = User.objects.get(password_reset_token=token, is_active=True)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid or expired password reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.password_reset_token_expiry and user.password_reset_token_expiry < timezone.now():
            user.password_reset_token = None
            user.password_reset_token_expiry = None
            user.save()
            return Response({'detail': 'Password reset token has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer.is_valid(raise_exception=True)
        new_password = serializer.validated_data['new_password']

        user.reset_password(new_password)

        return Response({'detail': 'Password has been reset successfully. You can now log in with your new password.'}, status=status.HTTP_200_OK)


class ProfessionalProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfessionalProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            if not hasattr(self.request.user, 'professional_profile'):
                 from django.http import Http404 # Local import fine here
                 raise Http404("User is not a professional or profile does not exist.")
            return self.request.user.professional_profile
        except ProfessionalProfile.DoesNotExist:
            from django.http import Http404
            raise Http404("Professional profile not found for this user.")
        except Exception as e:
            from django.http import Http404
            print(f"Error getting profile: {e}")
            raise Http404("Could not retrieve profile.")

    def perform_update(self, serializer):
        # Ensure that the user performing the update is the owner of the profile.
        # get_object already ensures this as it fetches based on request.user.
        serializer.save()


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'professional_profile'):
            return Service.objects.filter(professional_profile=self.request.user.professional_profile)
        return Service.objects.none() # Return empty queryset if no profile


class PortfolioItemViewSet(viewsets.ModelViewSet):
    serializer_class = PortfolioItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'professional_profile'):
            return PortfolioItem.objects.filter(professional_profile=self.request.user.professional_profile)
        return PortfolioItem.objects.none()


class OperatingAreaViewSet(viewsets.ModelViewSet):
    serializer_class = OperatingAreaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'professional_profile'):
            return OperatingArea.objects.filter(professional_profile=self.request.user.professional_profile)
        return OperatingArea.objects.none()


class CertificationViewSet(viewsets.ModelViewSet):
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'professional_profile'):
            return Certification.objects.filter(professional_profile=self.request.user.professional_profile)
        return Certification.objects.none()
