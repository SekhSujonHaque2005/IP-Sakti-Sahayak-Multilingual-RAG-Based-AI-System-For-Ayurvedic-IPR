from slowapi import Limiter
from slowapi.util import get_remote_address

# Global Rate Limiter based on user IP Address
limiter = Limiter(key_func=get_remote_address)
