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
const auth = firebase.auth(); 

const chat = document.getElementById('chat');
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const colorInput = document.getElementById('colorInput');
const myNumberDisplay = document.getElementById('my-number-display');

const displayedMessageKeys = new Set();
const messagesData = {};
let replyingToId = null;
let isModo = false;

// Sécurité pour éviter les alertes au chargement
let isInitialLoad = true;
setTimeout(() => { isInitialLoad = false; }, 2500);

// --- 1. MODÉRATION (Firebase Auth) ---
window.checkAdmin = () => {
    const email = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    if(!email || !pass) return alert("Remplis les champs admin !");

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            isModo = true;
            document.body.classList.add('is-modo');
            const status = document.getElementById('adminStatus');
            if(status) { 
                status.textContent = "MODÉRATEUR ACTIVÉ"; 
            }
            document.querySelector('.admin-bar').style.borderBottomColor = "#00ff00";
        })
        .catch((error) => alert("Erreur : " + error.message));
};

window.deleteMessage = (key) => {
    if (!isModo) return;
    if (confirm("Supprimer ce message pour tout le monde ?")) {
        db.ref('messages/' + key).remove()
            .catch(err => alert("Erreur suppression : " + err.message));
    }
};

window.closeAlert = () => {
    const alertBox = document.getElementById('custom-alert');
    if(alertBox) alertBox.style.display = 'none';
};

// --- 2. IDENTITÉ (Multi-onglets) ---
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

// Initialisation de l'ID
let userId = localStorage.getItem('chatUserId');
if (!userId) {
    generateUniqueId().then(id => {
        // On vérifie une dernière fois si un autre onglet n'a pas généré d'ID entre temps
        if (!localStorage.getItem('chatUserId')) {
            localStorage.setItem('chatUserId', id);
            userId = id;
            location.reload(); 
        }
    });
}

// Écouteur de synchronisation entre onglets
window.addEventListener('storage', (e) => {
    if (e.key === 'chatUserId') {
        userId = e.newValue;
        location.reload(); // On reload pour synchroniser l'ID partout
    }
    if (e.key === 'userColor') {
        applyUserStyle(e.newValue);
        updateIdentityDisplay(e.newValue);
    }
});

function updateIdentityDisplay(color) {
    if (myNumberDisplay && userId) {
        myNumberDisplay.textContent = "n°" + userId;
        myNumberDisplay.style.color = color;
    }
}

// --- 3. SONS ---
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
const fartSound = new Audio('https://www.myinstants.com/media/sounds/fart-with-reverb.mp3');
window.addEventListener('click', () => { notificationSound.load(); fartSound.load(); }, { once: true });

// --- 4. TOUTES LES COMMANDES SLASH ---
async function handleCommands(text) {
    if (!text.startsWith('/')) return false;
    const args = text.split(' ');
    const cmd = args[0].toLowerCase();

    if (cmd === '/alert') {
        if (!firebase.auth().currentUser) { 
            alert("Accès refusé : réservé aux modérateurs."); 
            return true; 
        }
        const alertMsg = text.replace('/alert', '').trim();
        if (!alertMsg) { alert("Usage: /alert [message]"); return true; }
        
        db.ref('messages').push({
            text: alertMsg,
            id: "SYSTEM",
            color: "#ff0000",
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            type: "broadcast",
            isAdmin: true
        });
        return true;
    }

    if (cmd === '/subway') {
        const subwayDiv = document.getElementById('subway-container');
        if (subwayDiv) {
            subwayDiv.style.display = (subwayDiv.style.display === 'block') ? 'none' : 'block';
            subwayDiv.innerHTML = subwayDiv.style.display === 'block' ? 
                `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/zZ7AimPACzc?autoplay=1&mute=1&loop=1&playlist=zZ7AimPACzc" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>` : '';
        }
        return true;
    }

    if (cmd === '/nick' && args[1]) {
        let newNum;
        const existing = await getExistingIds();
        if (args[1].toLowerCase() === 'random') { newNum = await generateUniqueId(); } 
        else { newNum = args[1].substring(0, 4).replace(/\D/g, ''); if (existing.includes(newNum)) { alert("Pris !"); return true; } }
        if (newNum) { localStorage.setItem('chatUserId', newNum); location.reload(); }
        return true;
    }

    if (cmd === '/color' && args[1]) {
        const newColor = args[1];
        if (/^#[0-9A-F]{6}$/i.test(newColor)) {
            localStorage.setItem('userColor', newColor);
            applyUserStyle(newColor);
            updateIdentityDisplay(newColor);
        }
        return true;
    }

    if (cmd === '/fart') {
        // Lecture forcée du localStorage pour bloquer le multi-onglet
        const lastFart = parseInt(localStorage.getItem('lastFartTime') || 0);
        const now = Date.now();
        const cooldown = 60000;

        if (now - lastFart < cooldown) { 
            alert(`Cooldown: ${Math.ceil((cooldown - (now - lastFart)) / 1000)}s`); 
        } 
        else { 
            localStorage.setItem('lastFartTime', now); 
            sendMessage("vient de péter bruyamment... 💨", true, "fart"); 
        }
        return true;
    }

    if (cmd === '/disco') {
        const chatInt = document.querySelector('.chatinterface');
        if (chatInt) { chatInt.classList.add('disco-active'); setTimeout(() => { chatInt.classList.remove('disco-active'); applyUserStyle(localStorage.getItem('userColor') || '#ae00ff'); }, 10000); }
        return true;
    }

    if (cmd === '/shrug') { sendMessage("¯\\_(ツ)_/¯"); return true; }
    if (cmd === '/tableflip') { sendMessage("(╯°□°）╯︵ ┻━┻"); return true; }
    if (cmd === '/unflip') { sendMessage("┬─┬ノ( º _ ºノ)"); return true; }
    if (cmd === '/roll') { sendMessage(`🎲 lance un dé : **${Math.floor(Math.random()*6)+1}**`); return true; }
    if (cmd === '/flip') { sendMessage(`🪙 lance une pièce : **${Math.random()<0.5?"PILE":"FACE"}**`); return true; }
    if (cmd === '/clear') { chat.innerHTML = ''; displayedMessageKeys.clear(); return true; }
    if (cmd === '/me' && args.length > 1) { sendMessage(args.slice(1).join(' '), true); return true; }
    
    if (cmd === '/calc' && args.length > 1) {
        try { const expr = args.slice(1).join(''); const res = Function(`'use strict'; return (${expr})`)(); sendMessage(`🧮 Calcul : ${expr} = **${res}**`); } 
        catch (e) { alert("Calcul invalide"); }
        return true;
    }
    return false;
}

// --- 5. RÉCEPTION ---
function formatMessageText(text) {
    let safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const imgRegex = /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp))/gi;
    safe = safe.replace(imgRegex, (url) => `<br><img src="${url}" class="chat-img"><br>`);
    return safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

db.ref('messages').on('child_added', snapshot => {
    const key = snapshot.key;
    if (displayedMessageKeys.has(key)) return;
    displayedMessageKeys.add(key);
    const msg = snapshot.val();
    
    // GESTION DES ALERTES BROADCAST
    if (msg.type === "broadcast") {
        if (!isInitialLoad) {
            const alertText = document.getElementById('alert-text');
            const alertBox = document.getElementById('custom-alert');
            if(alertText && alertBox) {
                alertText.textContent = msg.text;
                alertBox.style.display = 'flex';
            }
        }
    }

    if (msg.special === "fart") { fartSound.currentTime = 0; fartSound.play().catch(()=>{}); }
    else if (msg.id !== userId) { notificationSound.currentTime = 0; notificationSound.play().catch(()=>{}); }

    const div = document.createElement('div');
    div.classList.add('msg');
    div.setAttribute('data-key', key);
    if (msg.id === userId) div.classList.add('my-message');
    if (msg.isAdmin || msg.id === "SYSTEM") div.classList.add('admin-msg');

    messagesData[key] = { id: msg.id, color: msg.color, text: msg.text };

    let html = '';
    if (msg.parentId && messagesData[msg.parentId]) {
        const p = messagesData[msg.parentId];
        html += `<div class="reply-context" onclick="window.scrollToMessage('${msg.parentId}')" style="border-left-color: ${p.color};">
            <span style="color:${p.color}">n°${p.id}</span>: ${p.text.substring(0,20)}...</div>`;
    }

    const isAction = msg.type === 'action';
    const adminBadge = (msg.isAdmin || msg.id === "SYSTEM") ? `<span class="admin-badge">ADMIN</span> ` : '';

    html += `<div class="message-content">
        ${adminBadge}
        <span class="user" style="color: ${msg.color};">n°${msg.id}</span> ${isAction ? '' : ':'} 
        <span class="text-body" style="${isAction ? 'font-style: italic; color: #bbb;' : ''}">${formatMessageText(msg.text)}</span> 
        <button class="reply-btn" onclick="window.startReply('${key}')">↪</button>
        <span class="delete-btn" onclick="window.deleteMessage('${key}')">×</span>
    </div>`;

    div.innerHTML = html;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    applyUserStyle(localStorage.getItem('userColor') || '#ae00ff');
});

db.ref('messages').on('child_removed', snapshot => {
    const el = document.querySelector(`[data-key="${snapshot.key}"]`);
    if (el) el.remove();
    displayedMessageKeys.delete(snapshot.key);
});

// --- 6. ENVOI ---
function sendMessage(text, isAction = false, specialType = "normal") {
    const currentId = localStorage.getItem('chatUserId'); // On reprend l'ID frais du stockage
    const messageData = {
        text: text, 
        id: currentId,
        color: localStorage.getItem('userColor') || '#ae00ff',
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        type: isAction ? 'action' : 'normal',
        special: specialType,
        isAdmin: isModo
    };
    if (replyingToId) { messageData.parentId = replyingToId; window.cancelReply(); }
    db.ref('messages').push(messageData).catch(err => alert("Erreur envoi : " + err.message));
}

sendBtn.addEventListener('click', async () => {
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    if (!(await handleCommands(val))) sendMessage(val);
});
input.addEventListener('keypress', (e) => { if(e.key==='Enter') sendBtn.click(); });

// --- 7. UTILS ---
window.startReply = (id) => {
    replyingToId = id;
    const ind = document.getElementById('reply-indicator');
    const txt = document.getElementById('reply-to-text');
    if(ind && txt && messagesData[id]) { txt.textContent = "n°" + messagesData[id].id; ind.style.display = 'flex'; input.focus(); }
};

window.cancelReply = () => { replyingToId = null; const ind = document.getElementById('reply-indicator'); if(ind) ind.style.display = 'none'; };

window.scrollToMessage = (key) => {
    const target = document.querySelector(`.msg[data-key="${key}"]`);
    if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.classList.add('highlight'); setTimeout(() => target.classList.remove('highlight'), 1500); }
};

function applyUserStyle(color) {
    const chatInt = document.querySelector('.chatinterface');
    const subway = document.getElementById('subway-container');
    const replyInd = document.getElementById('reply-indicator');
    const adminBar = document.querySelector('.admin-bar');
    const adminBtn = document.querySelector('.admin-bar button');
    
    if (chatInt) chatInt.style.borderColor = color;
    if (subway) subway.style.borderColor = color;
    if (adminBar) adminBar.style.borderColor = color;
    if (replyInd) {
        replyInd.style.borderLeftColor = color;
        const replyText = document.getElementById('reply-to-text');
        if(replyText) replyText.style.color = color;
    }
    if (adminBtn) {
        adminBtn.style.borderColor = color;
        adminBtn.style.color = color;
    }
    document.querySelectorAll('.msg.my-message').forEach(m => {
        m.style.borderLeftColor = color;
    });
}

const savedColor = localStorage.getItem('userColor') || '#ae00ff';
applyUserStyle(savedColor);
updateIdentityDisplay(savedColor);

colorInput.addEventListener('input', (e) => { 
    localStorage.setItem('userColor', e.target.value); 
    applyUserStyle(e.target.value); 
    updateIdentityDisplay(e.target.value); 
});
