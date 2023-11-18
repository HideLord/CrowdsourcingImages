from flask import Blueprint, request
from werkzeug.exceptions import BadRequest

bp = Blueprint('routes', __name__)

@bp.route('/store_pair', methods=['POST'])
def store_pair():
    from flask import current_app
    try:
        image = request.files['image']
        json = request.form['json']
        db = current_app.config['db']
        db.store_pair(image, json)
        return "Pair stored successfully", 200
    except BadRequest as e:
        return str(e), 400
    except Exception as e:
        return f"Unexpected error: {str(e)}", 500