/**
 * Open AI utils
 */

const PROMPT_PRICE_1K = 0.01
const OUTPUT_PRICE_1K = 0.03

export const Detail = {
    LOW: "low",
    HIGH: "high"
};

function isBase64(str) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

export function calculateGPT4VPrice(response) {
    const promptCost = response.usage.prompt_tokens * PROMPT_PRICE_1K / 1000.0;
    const outputCost = response.usage.completion_tokens * OUTPUT_PRICE_1K / 1000.0;

    return outputCost + promptCost;
}

export function estimateGPT4VPrice(detail) {
    if (detail === Detail.LOW) {
        return 0.005;
    } else if (detail === Detail.HIGH) {
        return 0.015;
    }

    return 0.00;
}

export function getGPT4Vpayload(imageUrl, instruction, detail, maxtokens = 300) {
    const payload = {
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: instruction
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageUrl,
                            detail: detail,
                        }
                    }
                ],
            }
        ],
        max_tokens: maxtokens,
    };

    return payload
}

export async function sendGPT4VInstruction(apiKey, image, instruction, detail = Detail.LOW) {
    if (!image || !instruction) {
        throw new TypeError("Please provide image and instruction.");
    }

    let imageUrl;
    if (isBase64(image)) {
        imageUrl = `data:image/jpeg;base64,${image}`;
    } else if (typeof image === "string") {
        imageUrl = image;
    } else {
        console.error("image must be a base64 string or URL string");
        throw new TypeError("image must be a base64 string or URL string");
    }

    let payload = getGPT4Vpayload(imageUrl, instruction, detail);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = new Error(`${response.status}`);
        error.response = response;
        throw error;
    }

    const json = await response.json();
    return json;
}