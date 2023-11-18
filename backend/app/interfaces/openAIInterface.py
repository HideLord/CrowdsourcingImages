from abc import ABC, abstractmethod
from enum import Enum
from typing import Union, Tuple, Any

class Detail(Enum):
    HIGH = "high"
    LOW = "low"

class OpenAIInterface(ABC):
    """
    Returns the estimated price of this API call.
    """
    @abstractmethod
    def send_GPT4V_instruction(self, image: Union[bytes,str], instruction: str, detail: Detail) -> Tuple[float, Any]:
        pass