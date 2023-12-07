from flask import Flask
from flask_mail import Mail, Message
import os
from interfaces.emailServerInterface import EmailServerInterface

class EmailServerImpl(EmailServerInterface):
    def configure(self, app: Flask = None):
        self.app = app
        
        self.app.config['MAIL_SERVER'] = EmailServerInterface.MAIL_SERVER
        self.app.config['MAIL_PORT'] = EmailServerInterface.MAIL_PORT
        self.app.config['MAIL_USERNAME'] = EmailServerInterface.MAIL_USERNAME
        self.app.config['MAIL_PASSWORD'] = EmailServerInterface.MAIL_PASSWORD
        self.app.config['MAIL_USE_TLS'] = EmailServerInterface.MAIL_USE_TLS
        self.app.config['MAIL_USE_SSL'] = EmailServerInterface.MAIL_USE_SSL

        self.mail = Mail(self.app)

    def send_email(self, subject: str, recipients: list, body: str):
        msg = Message(subject)
        msg.sender = EmailServerInterface.MAIL_USERNAME
        msg.recipients = recipients
        msg.body = body
        self.mail.send(msg)