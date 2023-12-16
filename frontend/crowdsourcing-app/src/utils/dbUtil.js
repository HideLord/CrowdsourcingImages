export async function storePair(imageUrl, data) {
    const response = await fetch("http://localhost:5000/store_pair", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            image_url: imageUrl,
            data: data,
        }),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.text();
    return result;
}


export async function updateUser(data) {
    const response = await fetch("http://localhost:5000/update_user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            data: data,
        }),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.text();
    return result;
}

export async function getCurrentUserInfo() {
    const response = await fetch("http://localhost:5000/user", {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
}


export async function updateFunds(cost) {
    const response = await fetch("http://localhost:5000/update_funds", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            cost: cost,
        }),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.text();
    return result;
}


export async function getImageUrls(numImages) {
    const response = await fetch(`http://localhost:5000/get_image_urls?num_images=${numImages}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    return result.image_urls;
}