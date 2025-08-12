from fastapi import HTTPException, status

class BaseAPIException(HTTPException):
    """Base API Exception that can be thrown from anywhere in the application"""
    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_400_BAD_REQUEST
    ):
        super().__init__(status_code=status_code, detail=detail)

class NotFoundException(BaseAPIException):
    """Exception raised when an entity is not found"""
    def __init__(self, entity: str):
        super().__init__(
            detail=f"{entity} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

class ValidationException(BaseAPIException):
    """Exception raised for validation errors"""
    def __init__(self, detail: str):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

class AuthenticationException(BaseAPIException):
    """Exception raised for authentication errors"""
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_401_UNAUTHORIZED
        )

class AuthorizationException(BaseAPIException):
    """Exception raised for authorization errors"""
    def __init__(self, detail: str = "Not enough privileges"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_403_FORBIDDEN
        )
