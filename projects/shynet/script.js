// 🔥 Config Firebase
const firebaseConfig = {
    apiKey: "AIzaSyADCSPTs3UWMqAeYWkautbG2B9LSMOO7yE",
    authDomain: "shynet-project.firebaseapp.com",
    databaseURL: "https://shynet-project-default-rtdb.firebaseio.com",
    projectId: "shynet-project",
    storageBucket: "shynet-project.firebasestorage.app",
    messagingSenderId: "958400032907",
    appId: "1:958400032907:web:58da8a5b3657995b08648e"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const chat = document.getElementById('chat');
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const colorInput = document.getElementById('colorInput');
const typingElem = document.getElementById('typingIndicator');
const myNumberDisplay = document.getElementById('my-number-display');

const displayedMessageKeys = new Set();
const messagesData = {};
let replyingToId = null;

// --- 1. IDENTITÉ (Anti-doublons) ---
async function getExistingIds() {
    const snapshot = await db.ref('messages').limitToLast(100).once('value');
    const ids = [];
    snapshot.forEach(child => { ids.push(child.val().id); });
    return ids;
}

async function generateUniqueId() {
    const existing = await getExistingIds();
    let newId = "";
    let isUnique = false;
    while (!isUnique) {
        newId = Math.floor(1000 + Math.random() * 9000).toString();
        if (!existing.includes(newId)) isUnique = true;
    }
    return newId;
}

let userId = localStorage.getItem('chatUserId');
if (!userId) {
    generateUniqueId().then(id => {
        localStorage.setItem('chatUserId', id);
        alert("Bienvenue ! Ton numéro unique est : n°" + id);
        location.reload();
    });
}

function updateIdentityDisplay(color) {
    if (myNumberDisplay && userId) {
        myNumberDisplay.textContent = "n°" + userId;
        myNumberDisplay.style.color = color;
    }
}

// --- SONS ---
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
const fartSound = new Audio('https://www.myinstants.com/media/sounds/fart-with-reverb.mp3');
window.addEventListener('click', () => { notificationSound.load(); fartSound.load(); }, { once: true });

// --- COMMANDES SLASH ---
async function handleCommands(text) {
    if (!text.startsWith('/')) return false;
    const args = text.split(' ');
    const cmd = args[0].toLowerCase();

    // /SUBWAY
    if (cmd === '/subway') {
        const subwayDiv = document.getElementById('subway-container');
        if (subwayDiv) {
            if (subwayDiv.style.display === 'block') {
                subwayDiv.style.display = 'none';
                subwayDiv.innerHTML = '';
            } else {
                subwayDiv.style.display = 'block';
                subwayDiv.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/zZ7AimPACzc?autoplay=1&mute=1&loop=1&playlist=zZ7AimPACzc" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
            }
        }
        return true;
    }

    // /NICK
    if (cmd === '/nick' && args[1]) {
        let newNum;
        const existing = await getExistingIds();
        if (args[1].toLowerCase() === 'random') {
            newNum = await generateUniqueId();
        } else {
            newNum = args[1].substring(0, 4).replace(/\D/g, '');
            if (existing.includes(newNum)) {
                alert("Ce numéro est déjà pris !");
                return true;
            }
        }
        if (newNum && newNum.length > 0) {
            localStorage.setItem('chatUserId', newNum);
            location.reload();
        }
        return true;
    }

    // /COLOR
    if (cmd === '/color' && args[1]) {
        const newColor = args[1];
        if (/^#[0-9A-F]{6}$/i.test(newColor)) {
            localStorage.setItem('userColor', newColor);
            if (colorInput) colorInput.value = newColor;
            applyUserStyle(newColor);
            updateIdentityDisplay(newColor);
        }
        return true;
    }

    // /FART (Cooldown 60s)
    if (cmd === '/fart') {
        const lastFart = localStorage.getItem('lastFartTime') || 0;
        const now = Date.now();
        if (now - lastFart < 60000) {
            alert(`Attends encore ${Math.ceil((60000 - (now - lastFart)) / 1000)}s.`);
        } else {
            localStorage.setItem('lastFartTime', now);
            sendMessage("vient de péter bruyamment... 💨", true, "fart");
        }
        return true;
    }

    // Autres commandes simples
    if (cmd === '/disco') {
        const chatInt = document.querySelector('.chatinterface');
        if (chatInt) {
            chatInt.classList.add('disco-active');
            setTimeout(() => { chatInt.classList.remove('disco-active'); applyUserStyle(localStorage.getItem('userColor') || '#ae00ff'); }, 10000);
        }
        return true;
    }
    if (cmd === '/shrug') { sendMessage("¯\\_(ツ)_/¯"); return true; }
    if (cmd === '/clear') { chat.innerHTML = ''; displayedMessageKeys.clear(); return true; }
    
    return false;
}

// --- FORMATAGE TEXTE ---
function formatMessageText(text) {
    let safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const imgRegex = /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp))/gi;
    if (imgRegex.test(safe)) {
        safe = safe.replace(imgRegex, (url) => `<br><img src="${url}" class="chat-img" onclick="window.open('${url}', '_blank')"><br>`);
    }
    return safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// --- RÉCEPTION ---
db.ref('messages').on('child_added', snapshot => {
    const key = snapshot.key;
    if (displayedMessageKeys.has(key)) return;
    displayedMessageKeys.add(key);
    const msg = snapshot.val();
    
    if (msg.special === "fart") { fartSound.currentTime = 0; fartSound.play().catch(() => {}); }
    else if (msg.id !== userId) { notificationSound.currentTime = 0; notificationSound.play().catch(() => {}); }

    const div = document.createElement('div');
    div.classList.add('msg');
    div.setAttribute('data-key', key);
    if (msg.id === userId) div.classList.add('my-message');
    messagesData[key] = { id: msg.id, color: msg.color, text: msg.text };

    let html = '';
    if (msg.parentId && messagesData[msg.parentId]) {
        const p = messagesData[msg.parentId];
        html += `<div class="reply-context" onclick="window.scrollToMessage('${msg.parentId}')" style="border-left-color: ${p.color};">
            <span style="color:${p.color}">n°${p.id}</span>: ${p.text.substring(0,20)}...</div>`;
    }

    const isAction = msg.type === 'action';
    html += `<div class="message-content" style="${isAction ? 'font-style: italic; color: #bbb;' : ''}">
        <span class="user" style="color: ${msg.color};">n°${msg.id}</span> 
        ${isAction ? '' : ':'} 
        <span class="text-body">${formatMessageText(msg.text)}</span> 
        <button class="reply-btn" onclick="window.startReply('${key}')">↪</button>
    </div>`;

    div.innerHTML = html;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    applyUserStyle(localStorage.getItem('userColor') || '#ae00ff');
});

// --- ENVOI ---
function sendMessage(text, isAction = false, specialType = "normal") {
    const messageData = {
        text: text, id: userId,
        color: localStorage.getItem('userColor') || '#ae00ff',
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        type: isAction ? 'action' : 'normal',
        special: specialType
    };
    if (replyingToId) { messageData.parentId = replyingToId; window.cancelReply(); }
    db.ref('messages').push(messageData);
}

sendBtn.addEventListener('click', async () => {
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    if (!(await handleCommands(val))) sendMessage(val);
});
input.addEventListener('keypress', async (e) => { if(e.key==='Enter') sendBtn.click(); });

// --- UTILS RÉPONSE ---
window.startReply = (id) => {
    replyingToId = id;
    const ind = document.getElementById('reply-indicator');
    const txt = document.getElementById('reply-to-text');
    if(ind && txt && messagesData[id]) {
        txt.textContent = "n°" + messagesData[id].id;
        ind.style.display = 'flex';
        input.focus();
    }
};

window.cancelReply = () => {
    replyingToId = null;
    const ind = document.getElementById('reply-indicator');
    if(ind) ind.style.display = 'none';
};

window.scrollToMessage = (key) => {
    const target = document.querySelector(`.msg[data-key="${key}"]`);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('highlight');
        setTimeout(() => target.classList.remove('highlight'), 1500);
    }
};

function applyUserStyle(color) {
    const chatInt = document.querySelector('.chatinterface');
    const subway = document.getElementById('subway-container');
    const replyInd = document.getElementById('reply-indicator');
    if (chatInt) chatInt.style.border = `2px solid ${color}`;
    if (subway) subway.style.border = `2px solid ${color}`;
    if (replyInd) replyInd.style.borderLeftColor = color;
    document.querySelectorAll('.msg.my-message').forEach(m => m.style.borderLeftColor = color);
}

// --- INITIALISATION ---
const savedColor = localStorage.getItem('userColor') || '#ae00ff';
colorInput.value = savedColor;
applyUserStyle(savedColor);
updateIdentityDisplay(savedColor);

colorInput.addEventListener('input', (e) => {
    localStorage.setItem('userColor', e.target.value);
    applyUserStyle(e.target.value);
    updateIdentityDisplay(e.target.value);
});
