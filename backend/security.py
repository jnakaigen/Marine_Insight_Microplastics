import os
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
except (TypeError, ValueError):
    raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be set as an integer in the environment.")

if not SECRET_KEY or not ALGORITHM:
    raise ValueError("SECRET_KEY and ALGORITHM must be set in the environment.")

# Setup for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _truncate_to_72_bytes(password: str) -> str:
    """Truncate a string so its UTF-8 encoding is at most 72 bytes."""
    encoded = password.encode("utf-8")
    if len(encoded) <= 72:
        return password
    # Truncate safely
    truncated = encoded[:72]
    # Decode back, ignoring incomplete characters at the end
    return truncated.decode("utf-8", "ignore")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed one."""
    safe_password = _truncate_to_72_bytes(plain_password)
    return pwd_context.verify(safe_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a plain password, truncating to 72 bytes for bcrypt compatibility."""
    safe_password = _truncate_to_72_bytes(password)
    return pwd_context.hash(safe_password)


def create_access_token(data: dict):
    """Creates a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt