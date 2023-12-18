from flask import request, jsonify, session
from werkzeug.exceptions import BadRequest

from initRoutes import bp, limiter
from authenticationRoutes import _is_authenticated

from tempStorage import archive_pages

from utils.exportToDataset import export_to_git 

MAX_IMAGES = 10000
ARCHIVE_PAGE_PKS = "archive_page_pks"

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

        email = session["email"]
        image_url = request.get_json()["image_url"]
        data = request.get_json()["data"]

        db = current_app.config["db"]

        if (data["type"] == "instruction"):
            db.update_instruction_count(email, 1)
        elif (data["type"] == "description"):
            db.update_description_count(email, 1)
        else:
            return f"Unknown type {data["type"]}", 400
        
        db.store_pair(image_url, data)

        _update_archive(image_url)

        return "Pair stored successfully", 200

    except BadRequest as e:
        return str(e), 400

    except Exception as e:
        return f"Unexpected error: {str(e)}", 500


"""
GET request to retrieve a number of image urls
"""
@bp.route("/get_image_urls", methods=["GET"])
@limiter.limit("30/minute")
def get_image_urls():
    if not _is_authenticated():
        return "Invalid or expired session token", 401
    
    try:
        # This needs to be imported inside the request context.
        from flask import current_app
        db = current_app.config["db"]

        num_images = request.args.get("num_images", type=int)
        if num_images is None:
            return "Number of images not specified.", 400
        
        if num_images > MAX_IMAGES:
            return f"Too many images requested. Maximum is {MAX_IMAGES}.", 400

        # Unlock the previously locked pages
        locked_pks = session.get(ARCHIVE_PAGE_PKS)
        if locked_pks:
            db.unlock_archive_pages(locked_pks)

        image_urls, pks = db.get_image_urls(num_images)
        
        # Store the new ones
        session[ARCHIVE_PAGE_PKS] = pks

        return jsonify({"image_urls": image_urls})

    except BadRequest as e:
        return str(e), 400

    except Exception as e:
        return f"Unexpected error: {str(e)}", 500
    

"""
POST requests the server to update the dataset and post it to huggingface
"""
@bp.route("/update_dataset", methods=["POST"])
@limiter.limit("1/minute")
def update_dataset():
    try:
        # This needs to be imported inside the request context.
        from flask import current_app

        db = current_app.config["db"]
        pairs = db.get_all_pairs()

        export_to_git(pairs)

        return "Successfully updated dataset", 200

    except BadRequest as e:
        return str(e), 400

    except Exception as e:
        return f"Unexpected error: {str(e)}", 500


"""
Removes image_url from the stored pages of the user.
"""
def _update_archive(image_url: str):
    print(f"Updating archive with {image_url}")
    locked_pks = session.get(ARCHIVE_PAGE_PKS)
    if locked_pks:
        for pk in locked_pks:
            page = archive_pages.get(pk)
            if page and image_url in page:
                page.remove(image_url)
                print(f"Removing {image_url}")
                if len(page) == 0:
                    archive_pages.pop(pk)