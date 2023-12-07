from interfaces.dbInterface import DBInterface
from sqlalchemy import create_engine, Table, MetaData, Column, String, Integer, inspect
from sqlalchemy.orm import scoped_session, sessionmaker

from json import dumps
from typing import Union

class SQLDatabase(DBInterface):

    PAIR_TABLE = 'pairs'
    USER_TABLE = 'users'

    def __init__(self, database_url):
        self.engine = create_engine(database_url, echo=True)
        self.session = scoped_session(sessionmaker(bind=self.engine))

        metadata = MetaData()

        ins = inspect(self.engine)
        if ins.has_table(SQLDatabase.PAIR_TABLE):
            self.pairs_table = Table(SQLDatabase.PAIR_TABLE, metadata, autoload_with=self.engine)
        else: # Not exactly thread-safe, but the SQL underneath should be.
            self.pairs_table = Table(SQLDatabase.PAIR_TABLE, metadata,
                                     Column('pk', Integer, primary_key=True, autoincrement=True),
                                     Column('image_url', String),
                                     Column('json', String))
            
        if ins.has_table(SQLDatabase.USER_TABLE):
            self.users_table = Table(SQLDatabase.USER_TABLE, metadata, autoload_with=self.engine)
        else: # Not exactly thread-safe, but the SQL underneath should be.
            self.users_table = Table(SQLDatabase.USER_TABLE, metadata,
                                     Column('pk', Integer, primary_key=True, autoincrement=True),
                                     Column('email', String),
                                     Column('username', String),
                                     Column('instruction_count', String),
                                     Column('description_count', String))
            
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