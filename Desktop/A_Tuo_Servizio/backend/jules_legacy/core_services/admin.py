from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ProfessionalProfile, ClientProfile, ServiceCategory, Service, PortfolioItem, Review, Address, OperatingArea, Certification

class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'role', 'is_staff']
    search_fields = ['email', 'username']
    list_filter = ['role', 'is_staff', 'is_superuser']
    fieldsets = BaseUserAdmin.fieldsets + ((None, {'fields': ('role',)}),)
    add_fieldsets = BaseUserAdmin.add_fieldsets + ((None, {'fields': ('email', 'role',)}),)

class ProfessionalProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'business_name', 'is_verified']
    search_fields = ['user__email', 'user__username', 'business_name']
    list_filter = ['is_verified']
    raw_id_fields = ['user']

class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number']
    search_fields = ['user__email', 'user__username']
    raw_id_fields = ['user']

class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'professional_profile', 'category', 'price_indication']
    search_fields = ['name', 'professional_profile__user__email', 'category__name']
    list_filter = ['category']
    raw_id_fields = ['professional_profile', 'category']

class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'professional_profile', 'project_date']
    search_fields = ['title', 'professional_profile__user__email']
    raw_id_fields = ['professional_profile']
    list_filter = ['project_date']

class ReviewAdmin(admin.ModelAdmin):
    list_display = ['professional_profile', 'client', 'rating', 'created_at']
    search_fields = ['professional_profile__user__email', 'client__email']
    list_filter = ['rating', 'created_at']
    raw_id_fields = ['professional_profile', 'client']

class AddressAdmin(admin.ModelAdmin):
    list_display = ['street', 'city', 'postal_code', 'country']
    search_fields = ['street', 'city', 'postal_code']

class OperatingAreaAdmin(admin.ModelAdmin):
    list_display = ['professional_profile', 'city', 'radius_km']
    search_fields = ['professional_profile__user__email', 'city']
    raw_id_fields = ['professional_profile']

class CertificationAdmin(admin.ModelAdmin):
    list_display = ['name', 'professional_profile', 'issuing_organization', 'issue_date', 'expiry_date']
    search_fields = ['name', 'professional_profile__user__email', 'issuing_organization']
    raw_id_fields = ['professional_profile']
    list_filter = ['issue_date', 'expiry_date']

admin.site.register(User, UserAdmin)
admin.site.register(ProfessionalProfile, ProfessionalProfileAdmin)
admin.site.register(ClientProfile, ClientProfileAdmin)
admin.site.register(ServiceCategory, ServiceCategoryAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(PortfolioItem, PortfolioItemAdmin)
admin.site.register(Review, ReviewAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(OperatingArea, OperatingAreaAdmin)
admin.site.register(Certification, CertificationAdmin)
