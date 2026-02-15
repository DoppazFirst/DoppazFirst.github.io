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

const displayedMessageKeys = new Set();
const messagesData = {};
let replyingToId = null;

// --- 1. IDENTITÉ ---
function generateRandomNumberID() { 
    return Math.floor(1000 + Math.random() * 9000).toString(); 
}

const userId = (() => {
    let savedId = localStorage.getItem('chatUserId');
    if (!savedId) {
        const newId = generateRandomNumberID();
        localStorage.setItem('chatUserId', newId);
        alert("Bienvenue ! Ton nouveau numéro est : n°" + newId);
        return newId;
    }
    return savedId;
})();

// --- SONS ---
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
const fartSound = new Audio('https://www.myinstants.com/media/sounds/fart-with-reverb.mp3');
window.addEventListener('click', () => { notificationSound.load(); fartSound.load(); }, { once: true });

// --- COMMANDES SLASH ---
function handleCommands(text) {
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
        const newNum = args[1].substring(0, 4).replace(/\D/g, '');
        if (newNum.length > 0) {
            localStorage.setItem('chatUserId', newNum);
            alert("Numéro changé : n°" + newNum + ". Actualisation...");
            location.reload();
        }
        return true;
    }

    // /COLOR (Nouvelle commande)
    if (cmd === '/color' && args[1]) {
        const newColor = args[1];
        // Vérifie si c'est un format hexadécimal valide (ex: #ff0000)
        if (/^#[0-9A-F]{6}$/i.test(newColor)) {
            localStorage.setItem('userColor', newColor);
            if (colorInput) colorInput.value = newColor;
            applyUserStyle(newColor);
        } else {
            alert("Format invalide ! Utilise le format Hexa (ex: /color #ff0000)");
        }
        return true;
    }

    if (cmd === '/disco') {
        const chatInt = document.querySelector('.chatinterface');
        if (chatInt) {
            chatInt.classList.add('disco-active');
            setTimeout(() => {
                chatInt.classList.remove('disco-active');
                applyUserStyle(localStorage.getItem('userColor') || '#ae00ff');
            }, 10000);
        }
        return true;
    }

    if (cmd === '/fart') { sendMessage("vient de péter bruyamment... 💨", true, "fart"); return true; }
    if (cmd === '/shrug') { sendMessage("¯\\_(ツ)_/¯"); return true; }
    if (cmd === '/tableflip') { sendMessage("(╯°□°）╯︵ ┻━┻"); return true; }
    if (cmd === '/unflip') { sendMessage("┬─┬ノ( º _ ºノ)"); return true; }
    if (cmd === '/roll') { sendMessage(`🎲 lance un dé : **${Math.floor(Math.random()*6)+1}**`); return true; }
    if (cmd === '/flip') { sendMessage(`🪙 lance une pièce : **${Math.random()<0.5?"PILE":"FACE"}**`); return true; }
    if (cmd === '/clear') { chat.innerHTML = ''; displayedMessageKeys.clear(); return true; }
    if (cmd === '/me' && args.length > 1) { sendMessage(args.slice(1).join(' '), true); return true; }
    
    if (cmd === '/calc' && args.length > 1) {
        try {
            const expr = args.slice(1).join('');
            const res = Function(`'use strict'; return (${expr})`)();
            sendMessage(`🧮 Calcul : ${expr} = **${res}**`);
        } catch (e) { alert("Calcul invalide"); }
        return true;
    }
    return false;
}

// --- FORMATAGE TEXTE + IMAGES AUTO ---
function formatMessageText(text) {
    let safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const imgRegex = /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp))/gi;
    if (imgRegex.test(safe)) {
        safe = safe.replace(imgRegex, (url) => {
            return `<br><img src="${url}" class="chat-img" onclick="window.open('${url}', '_blank')"><br>`;
        });
    }
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return safe.replace(/:flamme:/g, '🔥').replace(/:pouce:/g, '👍');
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
    db.ref('typing/' + userId).set(false);
}

sendBtn.addEventListener('click', () => {
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    if (!handleCommands(val)) sendMessage(val);
});
input.addEventListener('keypress', (e) => { if(e.key==='Enter') sendBtn.click(); });

// --- UTILS ---
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
    if (chatInt) chatInt.style.border = `2px solid ${color}`;
    if (subway) subway.style.border = `2px solid ${color}`;
    document.querySelectorAll('.msg.my-message').forEach(m => m.style.borderLeftColor = color);
}

// --- INITIALISATION COULEUR ---
const savedColor = localStorage.getItem('userColor') || '#ae00ff';
colorInput.value = savedColor;
applyUserStyle(savedColor); // Applique la couleur dès le chargement

colorInput.addEventListener('input', (e) => {
    localStorage.setItem('userColor', e.target.value);
    applyUserStyle(e.target.value);
});

// Typing indicator
input.addEventListener('input', () => {
    db.ref('typing/' + userId).set(true);
    clearTimeout(window.tOut);
    window.tOut = setTimeout(() => db.ref('typing/' + userId).set(false), 3000);
});
db.ref('typing').on('value', snap => {
    let list = [];
    snap.forEach(c => { if(c.val() && c.key !== userId) list.push("n°"+c.key); });
    if(typingElem) typingElem.textContent = list.length > 0 ? list.join(', ') + " écrit..." : "";
});
