import pytest
from backend.utils.validation import AccountConnection, RequestValidationError

def test_rejects_invalid_role():
    with pytest.raises(RequestValidationError): AccountConnection(accountName="Demo", roleArn="nope", externalId="x" * 16)
