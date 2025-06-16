"""
Custom exception classes for the application.
"""

class MaxKBError(Exception):
    """Base exception class for MaxKB."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class ValidationError(MaxKBError):
    """Raised when there is a data validation error."""
    def __init__(self, message: str = "Validation Error"):
        super().__init__(message, status_code=400)

class NotFoundError(MaxKBError):
    """Raised when a resource is not found."""
    def __init__(self, message: str = "Resource Not Found"):
        super().__init__(message, status_code=404)

class AuthorizationError(MaxKBError):
    """Raised for authorization failures."""
    def __init__(self, message: str = "Not Authorized"):
        super().__init__(message, status_code=403)

class AuthenticationError(MaxKBError):
    """Raised for authentication failures."""
    def __init__(self, message: str = "Not Authenticated"):
        super().__init__(message, status_code=401) 