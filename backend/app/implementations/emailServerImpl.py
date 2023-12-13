from flask import Flask
from flask_mail import Mail, Message
import os
from interfaces.emailServerInterface import EmailServerInterface

class EmailServerImpl(EmailServerInterface):
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USE_TLS = False
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'polimonom@gmail.com')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')

    def configure(self, app: Flask = None):
        self.app = app

        self.app.config['MAIL_SERVER'] = EmailServerImpl.MAIL_SERVER
        self.app.config['MAIL_PORT'] = EmailServerImpl.MAIL_PORT
        self.app.config['MAIL_USERNAME'] = EmailServerImpl.MAIL_USERNAME
        self.app.config['MAIL_PASSWORD'] = EmailServerImpl.MAIL_PASSWORD
        self.app.config['MAIL_USE_TLS'] = EmailServerImpl.MAIL_USE_TLS
        self.app.config['MAIL_USE_SSL'] = EmailServerImpl.MAIL_USE_SSL

        self.mail = Mail(self.app)
        print('Email configured with password {} and username {}'.format(EmailServerImpl.MAIL_PASSWORD, EmailServerImpl.MAIL_USERNAME))

    def send_email(self, subject: str, recipients: list, body: str):
        msg = Message(subject)
        msg.sender = EmailServerImpl.MAIL_USERNAME
        msg.recipients = recipients
        msg.body = body
        self.mail.send(msg)