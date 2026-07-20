from fastapi import HTTPException, status


class AppError(HTTPException):
    def __init__(self, status_code: int, message: str, code: str = "ERROR"):
        super().__init__(status_code=status_code, detail={"success": False, "error": {"code": code, "message": message}})

    @classmethod
    def bad_request(cls, message: str = "Bad request", code: str = "BAD_REQUEST"):
        return cls(status.HTTP_400_BAD_REQUEST, message, code)

    @classmethod
    def unauthorized(cls, message: str = "Unauthorized", code: str = "UNAUTHORIZED"):
        return cls(status.HTTP_401_UNAUTHORIZED, message, code)

    @classmethod
    def forbidden(cls, message: str = "Forbidden", code: str = "FORBIDDEN"):
        return cls(status.HTTP_403_FORBIDDEN, message, code)

    @classmethod
    def not_found(cls, message: str = "Not found", code: str = "NOT_FOUND"):
        return cls(status.HTTP_404_NOT_FOUND, message, code)

    @classmethod
    def conflict(cls, message: str = "Conflict", code: str = "CONFLICT"):
        return cls(status.HTTP_409_CONFLICT, message, code)

    @classmethod
    def validation(cls, message: str = "Validation error", code: str = "VALIDATION_ERROR"):
        return cls(status.HTTP_422_UNPROCESSABLE_ENTITY, message, code)

    @classmethod
    def too_many(cls, message: str = "Too many requests", code: str = "TOO_MANY_REQUESTS"):
        return cls(status.HTTP_429_TOO_MANY_REQUESTS, message, code)
