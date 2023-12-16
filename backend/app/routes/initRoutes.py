from flask import Blueprint
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")
bp = Blueprint("routes", __name__)