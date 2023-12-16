from interfaces.dbInterface import DBInterface
from sqlalchemy import create_engine, Table, MetaData, Column, String, Integer, DateTime, Float, inspect, column, func
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.sql.expression import not_

from json import dumps
from typing import Union
from tqdm import tqdm
from threading import Lock
from random import shuffle

from tempStorage import archive_pks_in_use, archive_pages

import os
import pandas as pd
import time

class SQLDatabase(DBInterface):

    PAIR_TABLE = "pairs"
    USER_TABLE = "users"
    ARCHIVE_TABLE = "archive"

    URL_SEPARATOR = "<|URLSEP|>"
    
    CHUNK_SIZE = 10000

    def __init__(self, database_url):
        self.engine = create_engine(database_url, echo=False)
        self.session = scoped_session(sessionmaker(bind=self.engine))
        self.archive_lock = Lock()

        metadata = MetaData()
        should_load_parquets = False
        
        ins = inspect(self.engine)
        if ins.has_table(SQLDatabase.PAIR_TABLE):
            self.pairs_table = Table(SQLDatabase.PAIR_TABLE, metadata, autoload_with=self.engine)
        else: # Not exactly thread-safe, but the SQL underneath should be.
            self.pairs_table = Table(SQLDatabase.PAIR_TABLE, metadata,
                                     Column("pk", Integer, primary_key=True, autoincrement=True),
                                     Column("image_url", String),
                                     Column("json", String))
            
        if ins.has_table(SQLDatabase.USER_TABLE):
            self.users_table = Table(SQLDatabase.USER_TABLE, metadata, autoload_with=self.engine)
        else:
            self.users_table = Table(SQLDatabase.USER_TABLE, metadata,
                                     Column("pk", Integer, primary_key=True, autoincrement=True),
                                     Column("email", String),
                                     Column("username", String),
                                     Column("instruction_count", Integer),
                                     Column("description_count", Integer),
                                     Column("cash_limit", Float, server_default="10.0"),
                                     Column("cash_spent", Float, server_default="0.0"))
            
        if ins.has_table(SQLDatabase.ARCHIVE_TABLE):
            self.archive_table = Table(SQLDatabase.ARCHIVE_TABLE, metadata, autoload_with=self.engine)
        else:
            self.archive_table = Table(SQLDatabase.ARCHIVE_TABLE, metadata,
                                     Column("pk", Integer, primary_key=True, autoincrement=True),
                                     Column("total_count", Integer),
                                     Column("available_count", Integer),
                                     Column("image_urls", String),
                                     Column("separator", String, default=SQLDatabase.URL_SEPARATOR),)
            should_load_parquets = True
            
        metadata.create_all(self.engine)
        if should_load_parquets:
            self._load_parquets()


    def _load_parquets(self):
        directory_path = os.path.join(os.path.dirname(__file__), "../archive/")
        directory_path = os.path.normpath(directory_path)

        files = [f for f in os.listdir(directory_path) if f.endswith(".parquet")]

        for file_name in files:
            file_path = os.path.join(directory_path, file_name)
            self._insert_into_archive(pd.read_parquet(file_path))

        
    def _insert_into_archive(self, df):
        num_chunks = (len(df) + SQLDatabase.CHUNK_SIZE - 1) // SQLDatabase.CHUNK_SIZE

        pbar = tqdm(total=len(df), desc="Inserting URLs", unit="url")

        for i in range(num_chunks):
            df_chunk = df[i * SQLDatabase.CHUNK_SIZE:(i + 1) * SQLDatabase.CHUNK_SIZE]
            chunk_urls = SQLDatabase.URL_SEPARATOR.join(df_chunk["url"].astype(str))

            with self.session.begin():
                self.session.execute(
                    self.archive_table.insert().values(
                        total_count=len(df_chunk),
                        available_count=len(df_chunk),
                        image_urls=chunk_urls,
                    )
                )

            pbar.update(len(df_chunk))

        pbar.close()

    def get_image_urls(self, num_images: int):
        start_time = time.time()

        random_rows = []

        db_start_time = time.time()
        with self.session.begin():
            random_select = self.archive_table.select()
            random_rows = self.session.execute(random_select).fetchmany((num_images // SQLDatabase.CHUNK_SIZE) + 10)
        db_end_time = time.time()
        print(f"Database query time: {db_end_time - db_start_time} seconds")

        processing_start_time = time.time()
        with self.archive_lock:
            image_urls = []
            page_pks = []
            accumulated_images = 0

            for row in random_rows:
                row = row._asdict()
                pk = int(row["pk"])

                if pk in archive_pks_in_use:
                    continue

                available_start_time = time.time()
                if row["available_count"] > 0:
                    row_image_urls = row["image_urls"].split(SQLDatabase.URL_SEPARATOR)
                    images_to_take = min(len(row_image_urls), num_images - accumulated_images)
                    image_urls.extend(row_image_urls[:images_to_take])
                    accumulated_images += images_to_take

                    page_pks.append(pk)
                    archive_pks_in_use.add(pk)
                    archive_pages[pk] = set(row_image_urls)
                available_end_time = time.time()
                print(f"Processing available_count for a row: {available_end_time - available_start_time} seconds")

                if accumulated_images >= num_images:
                    break

        processing_end_time = time.time()
        print(f"Total processing time: {processing_end_time - processing_start_time} seconds")

        end_time = time.time()
        print(f"Total function time: {end_time - start_time} seconds")

        return image_urls, page_pks
    

    def unlock_archive_pages(self, pks: list):
        print(f"Unlocking archive pages: {pks}")
        with self.session.begin(), self.archive_lock:
            for pk in pks:
                if pk not in archive_pks_in_use:
                    continue
                archive_pks_in_use.remove(pk)
                
                if pk not in archive_pages:
                    self.session.execute(
                        self.archive_table.delete().where(self.archive_table.c.pk == pk)
                    )
                else:
                    shuffled_urls = list(archive_pages[pk])
                    shuffle(shuffled_urls)

                    updated_image_urls = SQLDatabase.URL_SEPARATOR.join(shuffled_urls)
                    self.session.execute(
                        self.archive_table.update().where(self.archive_table.c.pk == pk)\
                            .values(image_urls = updated_image_urls,
                                    available_count = len(archive_pages[pk]))
                    )
                    archive_pages.pop(pk)


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


    def update_user(self, email: str, data: dict):
        if email and data and isinstance(email, str) and isinstance(data, dict):
            with self.session.begin():
                self.session.execute(
                    self.users_table.update().where(self.users_table.c.email == email).values(username=data["username"], 
                                                                                              cash_limit=data["cash_limit"])
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
        

    def update_instruction_count(self, email: str, count: int):
        if email and count and isinstance(email, str) and isinstance(count, int):
            with self.session.begin():
                self.session.execute(
                    self.users_table.update().where(self.users_table.c.email == email).values(instruction_count=column("instruction_count") + count)
                )
        else:
            raise TypeError("email and count must not be None and of type str and int.")


    def update_description_count(self, email: str, count: int):
        if email and count and isinstance(email, str) and isinstance(count, int):
            with self.session.begin():
                self.session.execute(
                    self.users_table.update().where(self.users_table.c.email == email).values(description_count=column("description_count") + count)
                )
        else:
            raise TypeError("email and count must not be None and of type str and int.")


    def update_funds(self, email: str, cost: float):
        if email and cost and isinstance(email, str) and isinstance(cost, float):
            with self.session.begin():
                self.session.execute(
                    self.users_table.update().where(self.users_table.c.email == email).values(cash_spent=column("cash_spent") + cost)
                )
        else:
            raise TypeError("email and cost must not be None and of type str and float.")