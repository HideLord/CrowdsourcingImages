from flask import request, session, redirect
from werkzeug.exceptions import BadRequest

from initRoutes import bp, limiter
from authenticationRoutes import _is_authenticated

"""
POST request used to update a user's username.
"""
@bp.route("/update_user", methods=["POST"])
@limiter.limit("120/minute")
def update_user():
    if not _is_authenticated():
        return "Invalid or expired session token", 401
    
    try:
        # This needs to be imported inside the request context.
        from flask import current_app

        email = session["email"]
        data = request.get_json()["data"]
        data["email"] = email # this is done to prevent the user from modifying their email.

        db = current_app.config["db"]
        db.update_user(email, data)

        return "Username successfully updated", 200

    except BadRequest as e:
        return str(e), 400

    except Exception as e:
        return f"Unexpected error: {str(e)}", 500
    

"""
DELETE user profile from db.
"""
@bp.route("/delete_user", methods=["DELETE"])
@limiter.limit("120/minute")
def delete_user():
    if not _is_authenticated():
        return "Invalid or expired session token", 401
    
    try:
        # This needs to be imported inside the request context.
        from flask import current_app

        email = session["email"]

        db = current_app.config["db"]
        db.delete_user(email)

        session.clear()
        
        return "Successfully deleted user profile", 200

    except BadRequest as e:
        return str(e), 400

    except Exception as e:
        return f"Unexpected error: {str(e)}", 500
    

"""
GET request used to get the current user's info. It uses the session to get the email.
"""
@bp.route("/user", methods=["GET"])
@limiter.limit("240/minute")
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
    

"""
POST request used to update a user's funds.
"""
@bp.route("/update_funds", methods=["POST"])
@limiter.limit("120/minute")
def update_funds():
    if not _is_authenticated():
        return "Invalid or expired session token", 401
    
    try:
        # This needs to be imported inside the request context.
        from flask import current_app

        email = session["email"]
        cost = request.get_json()["cost"]

        db = current_app.config["db"]
        db.update_funds(email, cost)

        return "Username successfully updated", 200

    except BadRequest as e:
        return str(e), 400

    except Exception as e:
        return f"Unexpected error: {str(e)}", 500