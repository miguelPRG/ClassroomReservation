from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    """
    Modelo para criação de um novo utilizador. Inclui validação de email e password.
    """

    nome: str = Field(..., max_length=50)
    email: EmailStr = Field(..., max_length=150)
    password: str = Field(..., min_length=10, max_length=150)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 10:
            raise ValueError("Password deve conter pelo menos 10 caracteres")
        if not any(c.islower() for c in value):
            raise ValueError("Password deve conter pelo menos uma letra minúscula")
        if not any(c.isupper() for c in value):
            raise ValueError("Password deve conter pelo menos uma letra maiúscula")
        if not any(c.isdigit() for c in value):
            raise ValueError("Password deve conter pelo menos um dígito ")
        if not any(not c.isalnum() for c in value):
            raise ValueError("Password deve conter pelo menos um caractere especial")

        return value


class UserLogin(BaseModel):
    """
    Modelo para autenticação de um utilizador. Inclui validação de email e password.
    """

    email: EmailStr = Field(..., max_length=150)
    password: str = Field(..., min_length=10, max_length=150)


class UserLogout(BaseModel):
    """
    Modelo para logout de um utilizador.
    """

    message: str = "Logout bem-sucedido"


class User(BaseModel):
    """
    Modelo para retorno de informações de um utilizador. Inclui o ID, nome e email.
    """

    id: str
    nome: str
    email: str
