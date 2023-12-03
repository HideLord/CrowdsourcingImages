from flask import Blueprint, request
from flask_limiter import Limiter
from werkzeug.exceptions import BadRequest
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, 
                  storage_uri="memory://")
bp = Blueprint('routes', __name__)

"""
POST request used to store an image/data pair inside the DB. 
Expects "image_url" and "data" attributes at top level.
"""
@bp.route('/store_pair', methods=['POST'])
@limiter.limit("120/minute")
def store_pair():
    try:
        # This needs to be imported inside the request context.
        from flask import current_app
    
        json_data = request.get_json()

        image_url = json_data['image_url']
        data = json_data['data']

        db = current_app.config['images_db']
        db.store_pair(image_url, data)

        return "Pair stored successfully", 200

    except BadRequest as e:
        return str(e), 400

    except Exception as e:
        return f"Unexpected error: {str(e)}", 500