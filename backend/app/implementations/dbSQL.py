from interfaces.dbInterface import DBInterface
from sqlalchemy import create_engine, Table, MetaData, Column, String, Integer, DateTime, Float, inspect
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
        else:
            self.users_table = Table(SQLDatabase.USER_TABLE, metadata,
                                     Column('pk', Integer, primary_key=True, autoincrement=True),
                                     Column('email', String),
                                     Column('username', String),
                                     Column('instruction_count', Integer),
                                     Column('description_count', Integer),
                                     Column('cash_limit', Float, default=10.0),
                                     Column('cash_spent', Float, default=0.0))
            
        metadata.create_all(self.engine)


    def store_pair(self, image_url: str, data: Union[str, dict, list]):
        if data and image_url and isinstance(image_url, str):
            if isinstance(data, (dict, list)):
                data = dumps(data)
            elif not isinstance(data, str):
                raise TypeError(f"Unexpected json type {type(data)}.")
        else:
            raise TypeError("image_url and json must not be None.")

        with self.session.begin():
            self.session.execute(self.pairs_table.insert().values(image_url=image_url, json=data))


    def create_user(self, email: str, username: str):
        if email and username and isinstance(email, str) and isinstance(username, str):
            with self.session.begin():
                self.session.execute(
                    self.users_table.insert().values(email=email, username=username)
                )
        else:
            raise TypeError("email and username must not be None and must be of type str.")


    def update_user(self, email: str, new_username: str, new_limit: float):
        if email and new_username and isinstance(email, str) and isinstance(new_username, str):
            with self.session.begin():
                self.session.execute(
                    self.users_table.update().where(self.users_table.c.email == email).values(username=new_username, cash_limit=new_limit)
                )
        else:
            raise TypeError("email and new_username must not be None and must be of type str.")
        

    def get_user_info(self, email: str):
        if email and isinstance(email, str):
            with self.session.begin():
                return self.session.execute(
                        self.users_table.select().where(self.users_table.c.email == email)
                    ).fetchone()
        else:
            raise TypeError("email must not be None and must be of type str.")