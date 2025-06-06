from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, constr

class UserBase(BaseModel):
    email: EmailStr
    nome: Optional[str] = None
    cognome: Optional[str] = None
    tipo_utente: str

class UserCreate(UserBase):
    password: constr(min_length=8)

class UserRead(UserBase):
    id: int
    stato_account: str
    data_creazione: datetime
    data_aggiornamento: datetime

    class Config:
        orm_mode = True

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[EmailStr] = None
    user_id: Optional[int] = None

class UserUpdateSchema(BaseModel):
    nome: Optional[str] = None
    cognome: Optional[str] = None
    # Add other fields that can be updated by the user,
    # but not email, password, tipo_utente, stato_account here.
    # For example:
    # telefono: Optional[str] = None
    # indirizzo: Optional[str] = None

    class Config:
        orm_mode = True
