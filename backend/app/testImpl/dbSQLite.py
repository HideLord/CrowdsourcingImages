from interfaces.dbInterface import DBInterface
from sqlalchemy import create_engine, Table, MetaData, Column, String, LargeBinary, Integer
from sqlalchemy.orm import scoped_session, sessionmaker

from json import dumps
from typing import Union

class SQLiteDB(DBInterface):
    _engine = create_engine('sqlite:///test_db', echo=True)

    def __init__(self):
        self.session = scoped_session(sessionmaker(bind=self._engine))

        metadata = MetaData()

        self.pairs_table = Table('pairs', metadata, autoload_with=self._engine)
        if not self.pairs_table.exists(): # Not exactly thread-safe, but the SQL underneath should be.
            self.pairs_table = Table('pairs', metadata,
                               Column('pk', Integer, primary_key=True, autoincrement=True),
                               Column('image', LargeBinary),
                               Column('json', String))
            metadata.create_all(self._engine)

    def store_pair(self, image: bytes, json: Union[str, dict, list]):
        if json is not None and image is not None:
            if isinstance(json, (dict, list)):
                json = dumps(json)
        else:
            return

        with self.session.begin():
            self.session.execute(self.pairs_table.insert().values(image=image, json=json))