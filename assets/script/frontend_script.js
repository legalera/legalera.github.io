const chatWindow = document.getElementById('chat');
const inputBox = document.getElementById('input');
const sendBtn = document.getElementById('send');

let thinkingInterval = null;

function typeWriterEffect(element, message, sender = 'bot', speed = 10) {
  const prefix = sender === 'bot' ? 'Lexera AI: ' : 'Anda: ';
  let i = 0;
  // Bersihkan konten elemen sebelum mengetik
  element.textContent = ''; 
  //
  function typing() {
    if (i <= message.length) {
      element.textContent = prefix + message.slice(0, i);
      i++;
      setTimeout(typing, speed);
    } else {
      element.innerHTML = marked.parse((sender === 'bot' ? '**Lexera AI:** ' : '**Anda:** ') + message);
    }
  }
  typing();
}

function addMessage(message, sender = 'user', useTypewriter = false) {
  const row = document.createElement('div');
  row.className = 'message-row';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble ' + (sender === 'bot' ? 'bot' : 'user');
  //Selalu tambahkan ke DOM duluan
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  if (sender === 'bot' && useTypewriter) {
    typeWriterEffect(bubble, message, sender);
  } else {
    const prefix = sender === 'bot' ? '**Lexera AI:** ' : '**Anda:** ';
    bubble.innerHTML = marked.parse(prefix + (message || ""));
  }
    return row;//kembalikan ke row agar bisa showThinkingAnimation lagi
}

// NEW: Animated reasoning/thinking message
function showThinkingAnimation() {
  const thinkingRow = addMessage('Sedang menganalisis', 'bot');
  const bubble = thinkingRow.querySelector('.message-bubble');
  let dots = 0;
  //Hapus interval sebelumnya untuk mencegah duplikasi
  if (thinkingInterval) {
    clearInterval(thinkingInterval);
  }
  thinkingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    bubble.textContent = 'Lexera AI sedang menganalisis' + '.'.repeat(dots);
  }, 500);
  return thinkingRow;
}

sendBtn.onclick = async () => {
    inputBox.disabled = true;
    sendBtn.disabled = true;
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
    // Selalu bersihkan interval thinking saat respons diterima atau error
    clearInterval(thinkingInterval);
    thinkingInterval = null; // Reset interval id
    thinkingRow.remove();//Hapus animasi
    
    if (!res.ok) {
        let errorMessage = 'Terjadi kesalahan saat berkomunikasi dengan Lexera AI.';
        if (data.error && data.details) {
            if (data.details.includes('API Key missing')) {
                errorMessage = 'Maaf, ada masalah konfigurasi server (API Key hilang). Silakan coba lagi nanti.';
            } else if (data.details.includes('Authentication error')) {
                errorMessage = 'Autentikasi ke AI service gagal. Silakan coba lagi nanti.';
            } else if (data.details.includes('Rate limit exceeded')) {
                errorMessage = 'Maaf, batas penggunaan AI terlampaui untuk sementara. Silakan coba beberapa saat lagi.';
            } else {
                errorMessage = `Error dari AI: ${data.error}.`;
            }
        }
        addMessage(errorMessage, 'bot');
    } else if (data.reply) {
        addMessage(data.reply, 'bot', true);
    } else {
        addMessage('Lexera AI tidak dapat memberikan balasan saat ini.', 'bot');
    }

  } catch (err) {
     // Penanganan error jaringan atau parsing JSON
     console.error(`Handler Error:`, err); // Log error lebih detail
     addMessage(`Maaf, terjadi kesalahan jaringan atau server: ${err.message}`, 'bot');
  } finally { // Blok finally akan selalu dieksekusi setelah try/catch
    inputBox.disabled = false;
    sendBtn.disabled = false;
    }
};

inputBox.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendBtn.onclick();
});

// Menampilkan pesan pembuka
function displayWelcomeMessage() {
  // Isi pesan pembuka Anda
  const appVersion = "alpha-0.5";
  const updateDate = "19/Juni/2025"; // Disesuaikan dengan tanggal saat ini
  // Buat pesan yang ingin ditampilkan
  const initNotesText= `**versi ${appVersion}**
  *Diperbarui: ${updateDate}*
  
  ---
  
  Notes:  
  - Coding lebih improve dari versi sebelumnya
  - Lexera masih berada di server pribadi Yosia Ardianto (belum publik)

  ---
  
  Halo! Saya **Lexera AI**, asisten hukum digital Anda. Ada yang bisa Lexera bantu?`;
  addMessage(initNotesText, 'bot', true);//tunggu selesai
  }
// Panggil fungsi displayWelcomeMessage saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  displayWelcomeMessage(); //menampilkan versi dan info statis  
});
