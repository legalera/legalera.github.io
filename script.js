const chatWindow = document.getElementById('chat');
const inputBox = document.getElementById('input');
const sendBtn = document.getElementById('send');

let thinkingInterval = null;

function typeWriterEffect(element, message, sender = 'bot', speed = 40) {
  const prefix = sender === 'bot' ? 'LSHI AI: ' : 'Anda: ';
  let i = 0;
  function typing() {
    if (i <= message.length) {
      element.textContent = prefix + message.slice(0, i);
      i++;
      setTimeout(typing, speed);
    } else {
      element.innerHTML = marked.parse((sender === 'bot' ? '**LSHI AI:** ' : '**Anda:** ') + message);
    }
  }
  typing();
}

function addMessage(message, sender = 'user', useTypewriter = false) {
  const row = document.createElement('div');
  row.className = 'message-row';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble ' + (sender === 'bot' ? 'bot' : 'user');
  if (sender === 'bot' && useTypewriter) {
    typeWriterEffect(bubble, message, sender);
  } else {
    const prefix = sender === 'bot' ? '**LSHI AI:** ' : '**Anda:** ';
    bubble.innerHTML = marked.parse(prefix + (message || ""));
  }
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return row;
}

// NEW: Animated reasoning/thinking message
function showThinkingAnimation() {
  const thinkingRow = addMessage('Sedang menganalisis', 'bot');
  const bubble = thinkingRow.querySelector('.message-bubble');
  let dots = 0;
  thinkingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    bubble.textContent = 'LSHI AI sedang berpikir' + '.'.repeat(dots);
  }, 500);
  return thinkingRow;
}

sendBtn.onclick = async () => {
  const message = inputBox.value.trim();
  if (!message) return;
  addMessage(message, 'user');
  inputBox.value = '';
  
  // Show animated "thinking" message
  const thinkingRow = showThinkingAnimation();
  try {
    const res = await fetch('https://vercelapi-legaleras-projects.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    clearInterval(thinkingInterval);
    chatWindow.removeChild(thinkingRow);
    addMessage(data.reply || data.response || (data.error ? `Error: ${data.error}` : 'No response'), 'bot', true);
  } catch (err) {
    clearInterval(thinkingInterval);
    chatWindow.removeChild(thinkingRow);
    addMessage(`Error: ${err.message}`, 'bot');
  }
};

inputBox.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendBtn.onclick();
});
