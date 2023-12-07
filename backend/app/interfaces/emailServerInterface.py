from abc import ABC, abstractmethod
from flask import Flask
import os

class EmailServerInterface(ABC):
    def __init__(self, app: Flask = None):
        if app:
            self.configure(app)

    @abstractmethod
    def configure(self, app: Flask):
        pass

    @abstractmethod
    def send_email(self, subject: str, recipients: list, body: str):
        pass