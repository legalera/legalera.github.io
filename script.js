const chatWindow = document.getElementById('chat');
const inputBox = document.getElementById('input');
const sendBtn = document.getElementById('send');

function typeWriterEffect(element, html, speed = 25) {
  // Parse the markdown to HTML first, then animate
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const fullText = tempDiv.innerHTML;
  let i = 0;
  function typing() {
    element.innerHTML = fullText.slice(0, i);
    if (i < fullText.length) {
      i++;
      setTimeout(typing, speed);
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
   const prefix = sender === 'bot' ? '**LSHI AI:** ' : '**Anda:** ';
const html = marked.parse(prefix + (message || ""));

  if (sender === 'bot' && typewriter) {
    // start typewriter effect
    typeWriterEffect(bubble, html);
  } else {
    bubble.innerHTML = html;
  }

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return row; // return for possible removal
}

async function sendMessage() {
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

sendBtn.onclick = sendMessage;
inputBox.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

/*inputBox.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendBtn.onclick();
});*/
