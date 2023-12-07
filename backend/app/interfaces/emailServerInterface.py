from abc import ABC, abstractmethod
from flask import Flask
import os

class EmailServerInterface(ABC):
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USE_TLS = False
    MAIL_USERNAME = 'polimonom@gmail.com'
    MAIL_PASSWORD = 'bzkmypwvldliebsa'

    def __init__(self, app: Flask = None):
        if app:
            self.configure(app)

    @abstractmethod
    def configure(self, app: Flask):
        pass

    @abstractmethod
    def send_email(self, subject: str, recipients: list, body: str):
        pass