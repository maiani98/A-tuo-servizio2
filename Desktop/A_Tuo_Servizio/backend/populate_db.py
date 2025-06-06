import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'autoservizio_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from core_services.models import ProfessionalProfile, OperatingArea, Service, ServiceCategory

User = get_user_model()

def populate_db():
    # Create a service category
    idraulico_category = ServiceCategory.objects.create(name='Idraulico')
    elettricista_category = ServiceCategory.objects.create(name='Elettricista')

    # Create some users
    user1 = User.objects.create_user(username='mario.rossi', email='mario.rossi@example.com', password='password', role='professional', first_name='Mario', last_name='Rossi')
    user2 = User.objects.create_user(username='laura.bianchi', email='laura.bianchi@example.com', password='password', role='professional', first_name='Laura', last_name='Bianchi')

    # Create professional profiles
    profile1 = ProfessionalProfile.objects.create(user=user1, business_name='Mario Rossi Idraulico', tagline='Idraulico esperto a Roma', description='Offro servizi di idraulica a Roma e dintorni.')
    profile2 = ProfessionalProfile.objects.create(user=user2, business_name='Laura Bianchi Elettricista', tagline='Elettricista certificata a Milano', description='Offro servizi di elettricista a Milano e dintorni.')

    # Create operating areas
    OperatingArea.objects.create(professional_profile=profile1, city='Roma')
    OperatingArea.objects.create(professional_profile=profile2, city='Milano')

    # Create services
    Service.objects.create(professional_profile=profile1, name='Riparazione tubi', category=idraulico_category, description='Riparazione di tubi di ogni tipo.')
    Service.objects.create(professional_profile=profile2, name='Installazione impianti elettrici', category=elettricista_category, description='Installazione di impianti elettrici civili e industriali.')

if __name__ == '__main__':
    populate_db()
    print('Database populated successfully!')
