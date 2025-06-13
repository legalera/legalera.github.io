const chatWindow = document.getElementById('chat');
const inputBox = document.getElementById('input');
const sendBtn = document.getElementById('send');

function typeWriterEffect(element, message, sender = 'bot', speed = 25) {
  // Prefix (plain, not markdown)
  const prefix = sender === 'bot' ? 'LSHI AI: ' : 'Anda: ';
  let i = 0;
  function typing() {
    if (i <= message.length) {
      element.textContent = prefix + message.slice(0, i);
      i++;
      setTimeout(typing, speed);
    } else {
      // Once done, parse as markdown for bold prefix (optional)
      element.innerHTML = marked.parse((sender === 'bot' ? '**LSHI AI:** ' : '**Anda:** ') + message);
    }
  }
  typing();
}

function addMessage(message, sender = 'user', typewriter = false) {
  const row = document.createElement('div');
  row.className = 'message-row';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble ' + (sender === 'bot' ? 'bot' : 'user');
   // Prefix with Markdown bold for the label
  if (sender === 'bot' && useTypewriter) {
    typeWriterEffect(bubble, message, sender);
  } else {
    // Markdown parse for bold label
    const prefix = sender === 'bot' ? '**LSHI AI:** ' : '**Anda:** ';
    bubble.innerHTML = marked.parse(prefix + (message || ""));
  }

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return row; // return for possible removal
}

sendBtn.onclick = async () => {
  const message = inputBox.value.trim();
  if (!message) return;
  addMessage(message, 'user');
  inputBox.value = '';
  // Show "Sedang berpikir..." bot message and keep reference for removal
  const thinkingRow = addMessage('Sedang berpikir...', 'bot');
  try {
    const res = await fetch('https://vercelapi-legaleras-projects.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    chatWindow.removeChild(thinkingRow);
    addMessage(data.reply || data.response || (data.error ? `Error: ${data.error}` : 'No response'), 'bot', true);
  } catch (err) {
    chatWindow.removeChild(thinkingRow);
    addMessage(`Error: ${err.message}`, 'bot');
  }
}
/*
sendBtn.onclick = sendMessage;
inputBox.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});
*/
inputBox.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendBtn.onclick();
});
