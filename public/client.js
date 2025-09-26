const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', {
      userId: socket.id, // or a custom ID if you assign one
      message: input.value
    });
    input.value = '';
  }
});


socket.on('chat message', (data) => {
  const item = document.createElement('li');
  item.textContent = `${data.userId}: ${data.message}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});


// On disconnect (Button)
const toggleButton = document.getElementById('toggle-btn');
toggleButton.addEventListener('click', (e) => {
  e.preventDefault();
  if (socket.connected) {
    toggleButton.innerText = 'Connect';
    socket.disconnect();
  } else {
    toggleButton.innerText = 'Disconnect';
    socket.connect();
  }
});