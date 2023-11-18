from abc import ABC, abstractmethod
from enum import Enum
from typing import Union, Tuple, Any

class Detail(Enum):
    HIGH = "high"
    LOW = "low"

class OpenAIInterface(ABC):
    """
    Returns the estimated price of this API call.
    
    Args:
        image: Either a string URL or the image bytes.
        instruction: The instruction that the model will follow.
        detail: The level of detail.
            HIGH: It will first pass a 512x512 rescaled image, and then, the individual tiles of 512x512.
            LOW: It will rescale and pass only a single time as a 512x512 image.
    """
    @abstractmethod
    def send_GPT4V_instruction(self, image: Union[bytes,str], instruction: str, detail: Detail) -> Tuple[float, Any]:
        pass