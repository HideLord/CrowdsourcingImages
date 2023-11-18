from abc import ABC, abstractmethod

class DBInterface(ABC):
    @abstractmethod
    def store_pair(self, image, json):
        pass