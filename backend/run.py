import sys
 
sys.path.insert(0, './app')
sys.path.insert(0, './app/interfaces')
sys.path.insert(0, './app/implementations')

from app import BackendApp
from dbSQL import SQLDatabase 
from emailServerImpl import EmailServerImpl
from routes import bp, limiter

if __name__ == '__main__':
    db = SQLDatabase('sqlite:///test_db')
    emailServer = EmailServerImpl()
    app = BackendApp(db, emailServer)
    app.app.register_blueprint(bp)
    limiter.init_app(app.app)
    emailServer.configure(app.app)
    app.run()