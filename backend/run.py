from app.app import BackendApp
from app.implementations.dbSQL import SQLDatabase 
from app.routes import bp, limiter

if __name__ == '__main__':
    db = SQLDatabase('sqlite:///test_db')
    app = BackendApp(db)
    app.app.register_blueprint(bp)
    limiter.init_app(app.app)
    app.run()