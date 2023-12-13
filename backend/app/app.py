from flask import Flask
from flask_cors import CORS
from interfaces.dbInterface import DBInterface
from interfaces.emailServerInterface import EmailServerInterface 
import os

class BackendApp:
    def __init__(self, db: DBInterface, email_server: EmailServerInterface):
        self.app = Flask(__name__)
        CORS(self.app, supports_credentials=True, origins=['http://localhost:3000'])
        self.db = db
        self.app.config['db'] = db
        self.app.config['email_server'] = email_server
        self.app.config['SECRET_KEY'] = os.urandom(24) # for secure sign-in cookies.

    def run(self):
        self.app.run()