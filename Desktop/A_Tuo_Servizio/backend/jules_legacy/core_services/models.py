from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils.text import slugify
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, blank=True, null=True, unique=True)
    email_verification_token_expiry = models.DateTimeField(blank=True, null=True)
    password_reset_token = models.CharField(max_length=100, blank=True, null=True, unique=True)
    password_reset_token_expiry = models.DateTimeField(blank=True, null=True)

    ROLE_CHOICES = (
        ('client', 'Client'),
        ('professional', 'Professional'),
    )
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='client')
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def generate_email_verification_token(self):
        self.email_verification_token = get_random_string(length=60)
        self.email_verification_token_expiry = timezone.now() + timedelta(days=1) # Token valid for 1 day
        self.save()
        return self.email_verification_token

    def verify_email(self):
        self.is_email_verified = True
        self.is_active = True # Also activate user upon email verification
        self.email_verification_token = None
        self.email_verification_token_expiry = None
        self.save()

    def generate_password_reset_token(self):
        self.password_reset_token = get_random_string(length=60)
        self.password_reset_token_expiry = timezone.now() + timedelta(hours=1) # Token valid for 1 hour
        self.save()
        return self.password_reset_token

    def reset_password(self, new_password):
        self.set_password(new_password)
        self.password_reset_token = None
        self.password_reset_token_expiry = None
        self.save()

class ProfessionalProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='professional_profile')
    business_name = models.CharField(max_length=255, blank=True, null=True)
    vat_number = models.CharField(max_length=50, blank=True, null=True)
    tax_code = models.CharField(max_length=50, blank=True, null=True)
    years_of_experience = models.PositiveIntegerField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='cover_images/', blank=True, null=True)
    tagline = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.email}"

class ClientProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='client_profile')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Client Profile of {self.user.email}"

class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Service Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Service(models.Model):
    professional_profile = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='services_in_category')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price_indication = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., '€50/ora', 'A partire da €X', 'Su Preventivo'")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} by {self.professional_profile.user.email}"

class PortfolioItem(models.Model):
    professional_profile = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='portfolio_items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='portfolio_images/', blank=True, null=True)
    project_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Review(models.Model):
    professional_profile = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='reviews')
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_reviews')
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review for {self.professional_profile.user.email} by {self.client.email}"

class Address(models.Model):
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    state_province = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Italy')

    def __str__(self):
        return f"{self.street}, {self.city}, {self.postal_code}"

    class Meta:
        verbose_name_plural = "Addresses"

class OperatingArea(models.Model):
    professional_profile = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='operating_areas')
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    radius_km = models.PositiveIntegerField(blank=True, null=True, help_text="Operational radius in km from this point, if applicable")

    def __str__(self):
        return f"{self.city} (Profile: {self.professional_profile.user.email})"

class Certification(models.Model):
    professional_profile = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200, blank=True)
    issue_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    certificate_file = models.FileField(upload_to='certifications/', blank=True, null=True)
    certificate_number = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name
