from flask import request, jsonify, url_for, redirect, session

from tempStorage import otps
from initRoutes import bp, limiter

import secrets
import urllib

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
        session["email"] = email  # Store the email in session

        # Check if the email is new and create a user if so.
        from flask import current_app
        db = current_app.config["db"]
        user_info = db.get_user_info(email)
        if not user_info: # user does not exist
            db.create_user(email, secrets.token_hex(16))

        otps.pop(otp) # invalidate the OTP once it's been used

        return redirect(link)
    else:
        return "Invalid OTP", 400
    

@bp.route("/logout", methods=["GET"])
def logout():
    session.clear()
    
    return "Successfully logged out", 200


@bp.route("/is_authenticated", methods=["GET"])
def is_authenticated():
    return jsonify({"isAuthenticated": _is_authenticated()}), 200


def _is_authenticated():
    return bool(session.get("email"))