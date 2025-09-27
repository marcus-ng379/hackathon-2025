// For Node 18+ you can use global fetch, otherwise install node-fetch:
// npm install node-fetch
// const fetch = require("node-fetch");
const fetch = require("node-fetch");
async function testFilter() {
    const url = "https://5e2b62bc-3c14-4aff-b3ed-a90fff910650-00-21sf5eeropuu7.riker.replit.dev/filter";

    // Example filters: request 2 "Easy" and 1 "Medium" questions
    const filters = {
        Easy: 2,
        Medium: 1,
        Hard: 0,
        DivisionA: 0,
        DivisionB: 0,
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ filters }),
        });

        if (!response.ok) {
            console.error("Request failed:", response.status, response.statusText);
            const text = await response.text();
            console.log("Response body:", text);
            return;
        }

        const data = await response.json();
        console.log("Filtered questions:", data);
    } catch (err) {
        console.error("Error while fetching:", err);
    }
}

testFilter();
