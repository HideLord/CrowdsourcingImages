from interfaces.dbInterface import DBInterface
from sqlalchemy import create_engine, Table, MetaData, Column, String, LargeBinary, Integer
from sqlalchemy.orm import scoped_session, sessionmaker

class SQLiteDB(DBInterface):
    engine = create_engine('sqlite:///test_db', echo=True)

    def __init__(self):
        self.session = scoped_session(sessionmaker(bind=self.engine))

        metadata = MetaData()

        self.table = Table('pairs', metadata, autoload_with=self.engine)
        if not self.table.exists(): # Not exactly thread-safe, but the SQL underneath should be.
            self.table = Table('pairs', metadata,
                               Column('pk', Integer, primary_key=True, autoincrement=True),
                               Column('image', LargeBinary),
                               Column('json', String))
            metadata.create_all(self.engine)

    def store_pair(self, image, json):
        with self.session.begin():
            self.session.execute(self.table.insert().values(image=image, json=json))