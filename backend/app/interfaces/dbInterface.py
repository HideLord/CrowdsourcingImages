from abc import ABC, abstractmethod

class DBInterface(ABC):
    @abstractmethod
    def store_pair(self, image: str, data):
        pass

    @abstractmethod
    def update_user(self, email: str, data):
        pass