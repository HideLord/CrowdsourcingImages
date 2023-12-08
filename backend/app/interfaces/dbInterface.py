from abc import ABC, abstractmethod

class DBInterface(ABC):
    @abstractmethod
    def store_pair(self, image_url: str, data):
        pass

    @abstractmethod
    def create_user(self, email: str, username: str):
        pass

    @abstractmethod
    def update_user(self, email: str, data):
        pass

    @abstractmethod
    def get_user_info(self, email: str):
        pass