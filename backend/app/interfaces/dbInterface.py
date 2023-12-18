from abc import ABC, abstractmethod

class DBInterface(ABC):
    @abstractmethod
    def store_pair(self, image_url: str, data: dict):
        pass

    @abstractmethod
    def get_all_pairs(self):
        pass

    @abstractmethod
    def update_instruction_count(self, email: str, count: int):
        pass

    @abstractmethod
    def update_description_count(self, email: str, count: int):
        pass

    @abstractmethod
    def get_ordered_users(self, column, offset):
        pass

    @abstractmethod
    def get_user(self, email: str):
        pass

    @abstractmethod
    def create_user(self, email: str, username: str):
        pass

    @abstractmethod
    def update_user(self, email: str, data):
        pass

    @abstractmethod
    def delete_user(self, email: str):
        pass

    @abstractmethod
    def update_funds(self, email: str, cost: float):
        pass

    @abstractmethod
    def unlock_archive_pages(self, pks: list):
        pass

    @abstractmethod
    def get_image_urls(self, num_images: int):
        pass