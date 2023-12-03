import sys
 
sys.path.insert(0, './app')
sys.path.insert(0, './app/interfaces')
sys.path.insert(0, './app/implementations')

from app import BackendApp
from dbSQL import SQLDatabase 
from routes import bp, limiter

if __name__ == '__main__':
    db = SQLDatabase('sqlite:///test_db')
    app = BackendApp(db)
    app.app.register_blueprint(bp)
    limiter.init_app(app.app)
    app.run()