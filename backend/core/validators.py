import re
from django.core.exceptions import ValidationError

LOGIN_RE = re.compile(r'^[A-Za-z][A-Za-z0-9]{3,19}$')
EMAIL_RE = re.compile(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
PASSWORD_RE = re.compile(r'^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$')

def validate_login(v: str):
    if not LOGIN_RE.match(v or ''):
        raise ValidationError('Логин: латиница/цифры, буква первым, длина 4–20.')

def validate_email_fmt(v: str):
    if not EMAIL_RE.match(v or ''):
        raise ValidationError('Некорректный email.')

def validate_password_strength(v: str):
    if not PASSWORD_RE.match(v or ''):
        raise ValidationError('Пароль: ≥6 символов, 1 заглавная, 1 цифра, 1 спецсимвол.')