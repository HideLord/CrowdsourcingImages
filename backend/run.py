from app.app import BackendApp
from app.testImpl.dbSQLite import SQLiteDB 
from app.routes import bp

if __name__ == '__main__':
    db = SQLiteDB()
    app = BackendApp(db)
    app.app.register_blueprint(bp)
    app.run()