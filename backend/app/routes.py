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
    if not is_authenticated():
        return "Invalid or expired session token", 401
    
    try:
        # This needs to be imported inside the request context.
        from flask import current_app
    
        json_data = request.get_json()

        image_url = json_data["image_url"]
        data = json_data["data"]

        db = current_app.config["images_db"]
        db.store_pair(image_url, data)

        return "Pair stored successfully", 200

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

        return redirect(link)
    else:
        return "Invalid OTP", 400


def is_authenticated():
    email = session.get("email")

    if not email:
        return False
    else:
        return True