from interfaces.openAIInterface import OpenAIInterface, Detail
from openai import OpenAI
from openai.types.chat.chat_completion import ChatCompletion
from base64 import b64encode
from typing import Union, Tuple, Any

class OpenAIImpl(OpenAIInterface):
    _PROMPT_PRICE_1K = 0.01
    _OUTPUT_PRICE_1K = 0.03
    
    _client = OpenAI()

    @staticmethod
    def _encode_image(image_file: bytes):
        return b64encode(image_file).decode("utf-8")
    
    """
    Calculates the price of the chat completion based on the token usage and some static price numbers.
    Each image is first converted to tokens which is counted towards the prompt token usage.
    """
    @staticmethod
    def calculate_price(response: ChatCompletion) -> float:
        prompt_cost = response.usage["prompt_tokens"] * OpenAIImpl._PROMPT_PRICE_1K / 1000.0
        output_cost = response.usage["completion_tokens"] * OpenAIImpl._OUTPUT_PRICE_1K / 1000.0

        return output_cost + prompt_cost

    """
    Returns the estimated price of this API call.
    
    Args:
        image: Either a string URL or the image bytes.
        instruction: The instruction that the model will follow.
        detail: The level of detail.
            HIGH: It will first pass a 512x512 rescaled image, and then, the individual tiles of 512x512.
            LOW: It will rescale and pass only a single time as a 512x512 image.
    """
    def send_GPT4V_instruction(self, image: Union[bytes,str], instruction: str, detail: Detail = Detail.LOW) -> Tuple[float, Any]:
        if image is not None and instruction is not None:
            if isinstance(image, bytes):
                image_url = f"data:image/jpeg;base64,{OpenAIImpl._encode_image(image)}"
            elif isinstance(image, str):
                image_url = image
            else:
                raise TypeError("image must be bytes or str")
        else:
            return

        response = self._client.chat.completions.create(
                        model="gpt-4-vision-preview",
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text", 
                                        "text": instruction
                                    },
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": image_url,
                                            "detail": detail,
                                        },
                                    },
                                ],
                            }
                        ],
                        max_tokens=300,
                    )
        return OpenAIImpl.calculate_price(response), response
        