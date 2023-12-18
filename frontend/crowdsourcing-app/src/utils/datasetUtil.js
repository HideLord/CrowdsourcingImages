export default async function updateDataset() {
    console.log("Am here!");
    const response = await fetch("http://localhost:5000/update_dataset", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.text();
    return result;
}