from flask import Flask
from interfaces.dbInterface import DBInterface

class BackendApp:
    def __init__(self, images_db: DBInterface):
        self.app = Flask(__name__)
        self.images_db = images_db
        self.app.config['images_db'] = images_db

    def run(self):
        self.app.run()