import random
import string

def random_lower_string(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=length))

def random_email() -> str:
    return f"{random_lower_string()}@{random_lower_string()}.com"

def get_valid_password() -> str:
    return "validPassword123"

def create_user_data(email: str = None, password: str = None, tipo_utente: str = "cliente") -> dict:
    if email is None:
        email = random_email()
    if password is None:
        password = get_valid_password()
    
    return {
        "email": email,
        "password": password,
        "nome": random_lower_string(5).capitalize(),
        "cognome": random_lower_string(7).capitalize(),
        "tipo_utente": tipo_utente,
    }

def create_user_update_data() -> dict:
    return {
        "nome": random_lower_string(6).capitalize(),
        "cognome": random_lower_string(8).capitalize(),
    }
