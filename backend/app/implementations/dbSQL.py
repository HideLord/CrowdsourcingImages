from interfaces.dbInterface import DBInterface
from sqlalchemy import create_engine, Table, MetaData, Column, String, Integer
from sqlalchemy.orm import scoped_session, sessionmaker

from json import dumps
from typing import Union

class SQLDatabase(DBInterface):

    def __init__(self, database_url):
        self.engine = create_engine(database_url, echo=True)
        self.session = scoped_session(sessionmaker(bind=self.engine))

        metadata = MetaData()

        self.pairs_table = Table('pairs', metadata, autoload_with=self.engine)
        if not self.pairs_table.exists(): # Not exactly thread-safe, but the SQL underneath should be.
            self.pairs_table = Table('pairs', metadata,
                                     Column('pk', Integer, primary_key=True, autoincrement=True),
                                     Column('image_url', String),
                                     Column('json', String))
            metadata.create_all(self.engine)

    def store_pair(self, image_url: str, json: Union[str, dict, list]):
        if json and image_url and isinstance(image_url, str):
            if isinstance(json, (dict, list)):
                json = dumps(json)
            elif not isinstance(json, str):
                raise TypeError(f"Unexpected json type {type(json)}.")
        else:
            raise TypeError("image_url and json must not be None.")

        with self.session.begin():
            self.session.execute(self.pairs_table.insert().values(image_url=image_url, json=json))