/*
//SENDS TEXT
function sendMessages(text) {
    const name = localStorage.getItem('name');
    fetch('https://5e2b62bc-3c14-4aff-b3ed-a90fff910650-00-21sf5eeropuu7.riker.replit.dev/messages', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text })
    })
        .then(res => res.json())
        .then(data => console.log("Success :)"))
        .catch(err => console.log("Uh oh >:(", err))
}


const messageBtn = document.getElementById('messageBtn');
const message = document.getElementById('Hello')
messageBtn.addEventListener('click', () => {
    sendMessages(message.value);
});

*/