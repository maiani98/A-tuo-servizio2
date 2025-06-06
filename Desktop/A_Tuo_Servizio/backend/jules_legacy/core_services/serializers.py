from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import ClientProfile, ProfessionalProfile, PortfolioItem, Address, OperatingArea, Certification, Service, ServiceCategory

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password")
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=True, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name', 'role')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user_role = validated_data.pop('role')
        validated_data.pop('password2')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=user_role
        )
        if user_role == 'client':
            ClientProfile.objects.create(user=user)
        elif user_role == 'professional':
            ProfessionalProfile.objects.create(user=user)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(label="Email Address")
    password = serializers.CharField(
        label="Password",
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user_obj = None
            try:
                user_obj = User.objects.get(email__iexact=email)
                if not user_obj.check_password(password) or not user_obj.is_active:
                    user_obj = None
            except User.DoesNotExist:
                user_obj = None

            if not user_obj:
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Must include "email" and "password".'
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user_obj
        return attrs

class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display', 'is_staff', 'is_superuser', 'is_active')
        read_only_fields = ('id', 'is_staff', 'is_superuser', 'role', 'role_display', 'is_active')

class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=500)

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email__iexact=value, is_active=True).exists():
            raise serializers.ValidationError("No active user found with this email address.")
        return value

class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=500)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(write_only=True, required=True, label="Confirm New Password")

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "Password fields didn't match."})
        return attrs



class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'slug', 'description']


class ServiceSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.all(), source='category', write_only=True, allow_null=True, required=False
    )
    category = ServiceCategorySerializer(read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'price_indication', 'category', 'category_id']
        read_only_fields = ['professional_profile']

    def create(self, validated_data):
        # Ensure user has a professional profile
        if not hasattr(self.context['request'].user, 'professional_profile'):
            raise serializers.ValidationError('User does not have a professional profile.')
        profile = self.context['request'].user.professional_profile
        validated_data['professional_profile'] = profile
        return super().create(validated_data)


class PortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = ['id', 'title', 'description', 'image', 'project_date']
        read_only_fields = ['professional_profile']

    def create(self, validated_data):
        if not hasattr(self.context['request'].user, 'professional_profile'):
            raise serializers.ValidationError('User does not have a professional profile.')
        profile = self.context['request'].user.professional_profile
        validated_data['professional_profile'] = profile
        return super().create(validated_data)


class OperatingAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatingArea
        fields = ['id', 'city', 'postal_code', 'radius_km']
        read_only_fields = ['professional_profile']


    def create(self, validated_data):
        if not hasattr(self.context['request'].user, 'professional_profile'):
            raise serializers.ValidationError('User does not have a professional profile.')
        profile = self.context['request'].user.professional_profile
        validated_data['professional_profile'] = profile
        return super().create(validated_data)


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'name', 'issuing_organization', 'issue_date', 'expiry_date', 'certificate_file', 'certificate_number']
        read_only_fields = ['professional_profile']

    def create(self, validated_data):
        if not hasattr(self.context['request'].user, 'professional_profile'):
            raise serializers.ValidationError('User does not have a professional profile.')
        profile = self.context['request'].user.professional_profile
        validated_data['professional_profile'] = profile
        return super().create(validated_data)


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    portfolio_items = PortfolioItemSerializer(many=True, read_only=True)
    operating_areas = OperatingAreaSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)

    class Meta:
        model = ProfessionalProfile
        fields = [
            'id', 'user', 'business_name', 'vat_number', 'tax_code',
            'years_of_experience', 'profile_picture', 'cover_image',
            'tagline', 'description', 'phone_number', 'website_url', 'is_verified',
            'services', 'portfolio_items', 'operating_areas', 'certifications'
        ]
        read_only_fields = ['is_verified', 'user']
