from flask import Flask
from interfaces.dbInterface import DBInterface
from interfaces.emailServerInterface import EmailServerInterface 

class BackendApp:
    def __init__(self, images_db: DBInterface, email_server: EmailServerInterface):
        self.app = Flask(__name__)
        self.images_db = images_db
        self.app.config['images_db'] = images_db
        self.app.config['email_server'] = email_server

    def run(self):
        self.app.run()