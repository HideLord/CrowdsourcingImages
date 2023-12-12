from flask import Blueprint, request, jsonify, url_for, redirect, session
from flask_limiter import Limiter
from werkzeug.exceptions import BadRequest
from flask_limiter.util import get_remote_address

from tempStorage import otps

import secrets
import urllib

limiter = Limiter(key_func=get_remote_address, 
                  storage_uri="memory://")
bp = Blueprint("routes", __name__)

"""
POST request used to store an image/data pair inside the DB. 
Expects "image_url" and "data" attributes at top level.
"""
@bp.route("/store_pair", methods=["POST"])
@limiter.limit("120/minute")
def store_pair():
    if not _is_authenticated():
        return "Invalid or expired session token", 401
    
    try:
        # This needs to be imported inside the request context.
        from flask import current_app

        image_url = request.get_json()["image_url"]
        data = request.get_json()["data"]

        db = current_app.config["db"]
        db.store_pair(image_url, data)

        return "Pair stored successfully", 200

    except BadRequest as e:
        return str(e), 400

    except Exception as e:
        return f"Unexpected error: {str(e)}", 500


"""
POST request used to update a user's username.
"""
@bp.route("/update_user", methods=["POST"])
@limiter.limit("6/minute")
def update_user():
    if not _is_authenticated():
        return "Invalid or expired session token", 401
    
    try:
        # This needs to be imported inside the request context.
        from flask import current_app

        email = session["email"]
        data = request.get_json()["data"]

        db = current_app.config["db"]
        db.update_user(email, data["username"])

        return "Username successfully updated", 200

    except BadRequest as e:
        return str(e), 400

    except Exception as e:
        return f"Unexpected error: {str(e)}", 500
    

"""
POST request used to get the current user's info. It uses the session to get the email.
"""
@bp.route("/user", methods=["GET"])
@limiter.limit("30/minute")
def user():
    if not _is_authenticated():
        return "Invalid or expired session token", 401
    
    try:
        # This needs to be imported inside the request context.
        from flask import current_app

        db = current_app.config["db"]
        user_info = db.get_user_info(session["email"])

        return user_info._asdict(), 200

    except BadRequest as e:
        return str(e), 400

    except Exception as e:
        return f"Unexpected error: {str(e)}", 500
    
    
@bp.route("/generate_otp", methods=["POST"])
def generate_otp():
    # This needs to be imported inside the request context.
    from flask import current_app

    email = request.json.get("email")
    link = request.json.get("link")

    if not email:
        return "Email is required", 400
    
    otp = secrets.token_urlsafe(16)
    otps[otp] = email # store the otp -> email pair 
    
    login_url = url_for("routes.login", _external=True)
    login_url += f"?otp={otp}&email={urllib.parse.quote(email)}&link={urllib.parse.quote(link)}" # query params otp and email

    current_app.config["email_server"].send_email("Your OTP", [email], "Click here to login:\n" + login_url) # Send login link

    return "OTP has been sent to your email", 200


@bp.route("/login", methods=["GET"])
def login():
    otp = request.args.get("otp")
    email = request.args.get("email")
    link = request.args.get("link")

    if otp and otp in otps and otps[otp] == email:
        session['email'] = email  # Store the email in session

        # Check if the email is new and create a user if so.
        from flask import current_app
        db = current_app.config["db"]
        user_info = db.get_user_info(email)
        if not user_info: # user does not exist
            db.create_user(email, secrets.token_hex(16))
        return redirect(link)
    else:
        return "Invalid OTP", 400
    

@bp.route("/is_authenticated", methods=["GET"])
def is_authenticated():
    return jsonify({'isAuthenticated': _is_authenticated()}), 200


def _is_authenticated():
    return bool(session.get("email"))