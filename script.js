// 🔥 Configure Firebase ici
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
// Récupérer le sélecteur de couleur
const colorInput = document.getElementById('colorInput'); 

// NOUVEAU: Objet pour stocker les détails des messages chargés (clé, ID, couleur, texte)
const messagesData = {}; 

// Variables pour gérer la réponse
let replyingToId = null; 
const replyIndicator = document.createElement('div');
replyIndicator.id = 'reply-indicator';
replyIndicator.innerHTML = 'Répondre à : <span id="reply-to-text"></span> <button onclick="cancelReply()">Stop Reply</button>';

const chatInterface = document.querySelector('.chatinterface');
if (chatInterface) {
    // Insère l'indicateur juste au-dessus de la zone de saisie
    chatInterface.insertBefore(replyIndicator, document.querySelector('.messagearea'));
}


// --- Fonctions de gestion de la réponse (Globales pour les boutons onclick) ---

window.startReply = function(messageId, messageText) {
    replyingToId = messageId;
    // Affiche un extrait du message dans l'indicateur
    const shortText = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
    document.getElementById('reply-to-text').textContent = shortText;
    replyIndicator.style.display = 'flex';
    input.focus();
}

window.cancelReply = function() {
    replyingToId = null;
    replyIndicator.style.display = 'none';
    document.getElementById('reply-to-text').textContent = '';
}

window.scrollToMessage = function(key) {
    const target = document.querySelector(`.msg[data-key="${key}"]`);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Effet de flash
        target.classList.add('highlight');
        setTimeout(() => {
            target.classList.remove('highlight');
        }, 1500);
    }
}

// Gestion de l'ID utilisateur anonyme (cookie)
function getUserId() {
  let id = document.cookie.split('; ').find(c => c.startsWith('userId='));
  if (!id) {
    id = Math.random().toString(36).substring(2, 10);
    // Stockage pour 1 an
    document.cookie = `userId=${id}; max-age=${60*60*24*365}`; 
  } else {
    id = id.split('=')[1];
  }
  return id;
}

const userId = getUserId();

// --- Gestion de la couleur de l'utilisateur (localStorage) ---

// Récupérer la couleur stockée localement (sinon utiliser le par défaut)
function getUserColor() {
    return localStorage.getItem('userColor') || '#ae00ff';
}

// NOUVEAU: Fonction pour appliquer la couleur à l'interface (bordures)
function applyUserStyle(color) {
    const chatInterface = document.querySelector('.chatinterface');
    // Récupère tous les messages de l'utilisateur déjà affichés
    const myMessages = document.querySelectorAll('.msg.my-message');
    
    // 1. Appliquer au conteneur principal
    if (chatInterface) {
        chatInterface.style.borderColor = color; 
    }
    
    // 2. Appliquer aux messages de l'utilisateur
    myMessages.forEach(msg => {
        msg.style.borderLeftColor = color; 
    });
}


// Appliquer la couleur stockée à l'input au chargement
if (colorInput) {
    const initialColor = getUserColor();
    colorInput.value = initialColor;
    applyUserStyle(initialColor); 
    window.cancelReply(); // S'assurer que l'indicateur est caché au début

    // Écouter le changement de couleur et le sauvegarder
    colorInput.addEventListener('change', (e) => {
        const newColor = e.target.value;
        localStorage.setItem('userColor', newColor);
        applyUserStyle(newColor);
    });
}


// --- Fonction de formatage de l'heure ---
function formatTime(timestamp) {
    const date = new Date(timestamp);
    // Retourne l'heure au format HH:MM
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}


// --- Envoyer un message (avec couleur, timestamp et parentId) ---
sendBtn.addEventListener('click', () => {
  const msg = input.value.trim();
  if (!msg) return;
  
  // Récupérer la couleur actuelle pour l'envoyer
  const userColor = getUserColor();
  
  const messageData = { 
    text: msg, 
    id: userId,
    color: userColor, // Envoi de la couleur
    timestamp: firebase.database.ServerValue.TIMESTAMP // Utilise l'heure du serveur
  };
  
  // NOUVEAU: Si replyingToId est défini, l'ajouter
  if (replyingToId) {
      messageData.parentId = replyingToId;
      window.cancelReply(); 
  }

  db.ref('messages').push(messageData);
  input.value = '';
});

input.addEventListener('keypress', (e) => { if(e.key==='Enter') sendBtn.click(); });


// --- Écoute des messages (Stockage, Affichage du contexte et bouton Répondre) ---
db.ref('messages').on('child_added', snapshot => {
  const msg = snapshot.val();
  const messageKey = snapshot.key; // Récupère la clé pour l'ID de réponse
  const div = document.createElement('div');
  div.classList.add('msg');
  div.setAttribute('data-key', messageKey); // Ajout de la clé pour le ciblage
  
  if (msg.id === userId) {
      div.classList.add('my-message');
  }

  // L'ID du perso (pseudo) - 4 premiers caractères
  const displayId = msg.id.substring(0, 4); 
  const time = msg.timestamp ? formatTime(msg.timestamp) : formatTime(Date.now());
  const pseudoColor = msg.color || '#ae00ff'; 
  
  // NOUVEAU: Stocker les données pour les réponses futures
  messagesData[messageKey] = {
      id: displayId,
      color: pseudoColor,
      text: msg.text 
  };
  
  // Construction du contenu du message
  let innerContent = '';
  
  // 1. Si c'est une réponse, afficher le message parent (avec pseudo et couleur)
  if (msg.parentId) {
      const parentData = messagesData[msg.parentId];
      let replyText = 'Répond à un message non chargé...';
      let replyColor = '#555'; 

      // Vérifier si le message parent a déjà été chargé
      if (parentData) {
          // Affichage du pseudo et du début du texte du parent
          const parentSnippet = parentData.text.length > 25 ? parentData.text.substring(0, 25) + '...' : parentData.text;
          replyText = `<span style="color: ${parentData.color}; font-weight: bold;">${parentData.id}</span>: ${parentSnippet}`;
          replyColor = parentData.color; 
      }
      
      innerContent += `<div class="reply-context" onclick="scrollToMessage('${msg.parentId}')" style="border-left-color: ${replyColor};">${replyText}</div>`;
  }
  
  // 2. Affichage du pseudo, du texte, de l'heure et du bouton Répondre
  // Protection contre les guillemets dans le message pour l'onclick
  const safeText = msg.text.replace(/'/g, "\\'"); 
  
  innerContent += `
      <div class="message-content">
          <span class="user" style="color: ${pseudoColor};">${displayId}</span>: 
          ${msg.text} 
          <span class="timestamp">${time}</span>
          
          <button class="reply-btn" onclick="startReply('${messageKey}', '${safeText}')">↪</button>
      </div>
  `;
  
  div.innerHTML = innerContent;
  
  chat.appendChild(div);
  
  // On réapplique le style pour s'assurer que les messages prennent la couleur de bordure locale
  applyUserStyle(getUserColor());
  
  chat.scrollTop = chat.scrollHeight;

  // --- LOGIQUE DE NETTOYAGE : Supprime les messages au-delà du seuil de 100 ---
  
  db.ref('messages').once('value', messagesSnapshot => {
      const totalMessages = messagesSnapshot.numChildren();
      const limit = 100;

      if (totalMessages > limit) {
          const messages = [];
          messagesSnapshot.forEach(child => {
              messages.push({ 
                  key: child.key, 
                  timestamp: child.val().timestamp || 0 
              });
          });

          messages.sort((a, b) => a.timestamp - b.timestamp);
          
          const countToDelete = totalMessages - limit;
          const updates = {};
          
          for (let i = 0; i < countToDelete; i++) {
              updates[messages[i].key] = null;
          }

          if (Object.keys(updates).length > 0) {
              db.ref('messages').update(updates);
          }
      }
  });
});
