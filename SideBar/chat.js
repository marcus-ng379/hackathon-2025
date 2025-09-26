const messageBtn = document.getElementById('messageBtn');

messageBtn.addEventListener('click', () => {
    const message = "You: " + document.getElementById('message').value.trim();
    if (!message) return; // ignore empty messages
    const messageBox = document.createElement('p');
    messageBox.textContent = message;
    messageBox.classList.add('chatMessage');

    const container = document.getElementById('chatMessages');
    container.appendChild(messageBox);

    container.scrollTop = container.scrollHeight; // scroll to bottom
});