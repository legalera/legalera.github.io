const chatWindow = document.getElementById('chat');
const inputBox = document.getElementById('input');
const sendBtn = document.getElementById('send');

/*function appendMessage(who, text) {
  const msg = document.createElement('div');
  msg.className = who;
  msg.textContent = `${who === "user" ? "You" : "Bot"}: ${text}`;
  chatDiv.appendChild(msg);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}*/

function addMessage(message, sender = 'user') {
  const row = document.createElement('div');
  row.className = 'message-row';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble ' + (sender === 'bot' ? 'bot' : 'user');
   // Prefix with Markdown bold for the label
   const prefix = sender === 'bot' ? '**LSHI AI:** ' : '**Anda:** ';

   // Always use marked.parse for both user and bot to render bold
   bubble.innerHTML = marked.parse(prefix + (message || ""));
  /*let prefix = sender === 'bot' ? "**LSHI AI:** " : "**Anda:** ";
  if (sender === 'bot') {
    bubble.innerHTML = marked.parse(prefix + message || ""); // THIS LINE is the key!
  } else {
    bubble.textContent = marked.parse(prefix + message || "");
  }*/
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/*function addMessage(message, sender = 'user') {
  const row = document.createElement('div');
  row.className = 'message-row';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble message-' + sender;

  // Render markdown for bot, plain for user
  if (sender === 'bot') {
    bubble.innerHTML = marked.parse(message);
  } else {
    bubble.textContent = message;
  }

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}*/

sendBtn.onclick = async () => {
  const message = inputBox.value.trim();
  if (!message) return;
  addMessage(message, 'user');
  inputBox.value = '';
  addMessage('Sedang berpikir...','bot');
  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    // Remove the 'Thinking...' message
    chatWindow.removeChild(chatWindow.lastChild);
    addMessage(data.reply || data.response || (data.error ? `Error: ${data.error}` : 'No response'), 'bot');
  } catch (err) {
    chatWindow.removeChild(chatWindow.lastChild);
    addMessage(`Error: ${err.message}`, 'bot');
  }
};

inputBox.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendBtn.onclick();
});