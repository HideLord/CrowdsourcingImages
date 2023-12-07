export async function generateOTP(email) {
    let link = window.location.origin + "/instruction";  
    const response = await fetch('http://localhost:5000/generate_otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            link,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.text();
    return result;
}


export async function isAuthenticated() { 
    const response = await fetch('http://localhost:5000/is_authenticated', { credentials: 'include' });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data.isAuthenticated;
}