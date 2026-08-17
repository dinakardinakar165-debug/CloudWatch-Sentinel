import re
from dataclasses import dataclass

class RequestValidationError(ValueError): pass

@dataclass
class AccountConnection:
    accountName: str
    roleArn: str
    externalId: str
    alertEmail: str | None = None
    def __post_init__(self):
        if not 2 <= len(self.accountName) <= 80: raise RequestValidationError("accountName must be 2-80 characters")
        if not re.fullmatch(r"arn:aws:iam::\d{12}:role/[\w+=,.@/-]+", self.roleArn): raise RequestValidationError("roleArn must be a valid IAM role ARN")
        if not 16 <= len(self.externalId) <= 128: raise RequestValidationError("externalId must be 16-128 characters")
    def model_dump(self): return self.__dict__.copy()

@dataclass
class Credentials:
    email: str
    password: str
    def __post_init__(self):
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", self.email): raise RequestValidationError("email is invalid")
        if not 8 <= len(self.password) <= 256: raise RequestValidationError("password must be 8-256 characters")

@dataclass
class Confirmation:
    email: str
    code: str
    def __post_init__(self):
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", self.email): raise RequestValidationError("email is invalid")
        if not 4 <= len(self.code) <= 32: raise RequestValidationError("confirmation code is invalid")
