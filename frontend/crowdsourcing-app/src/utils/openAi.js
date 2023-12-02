/**
 * Open AI utils
 */

export const Detail = {
    LOW: 'LOW',
    HIGH: 'HIGH'
};

function isBase64(str) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
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
        return;
    }

    let imageUrl;
    if (isBase64(image)) {
        imageUrl = `data:image/jpeg;base64,${image}`;
    } else if (typeof image === 'string') {
        imageUrl = image;
    } else {
        throw new TypeError("image must be a base64 string or URL string");
    }

    let payload = getGPT4Vpayload(imageUrl, instruction, detail);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}