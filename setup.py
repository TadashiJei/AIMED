from setuptools import setup, find_packages

setup(
    name="aimed-backend",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "pydantic",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-dotenv",
        "python-multipart",
        "email-validator"
    ]
)
