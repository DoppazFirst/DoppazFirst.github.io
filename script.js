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

// Appliquer la couleur stockée à l'input au chargement
if (colorInput) {
    colorInput.value = getUserColor();

    // Écouter le changement de couleur et le sauvegarder
    colorInput.addEventListener('change', (e) => {
        localStorage.setItem('userColor', e.target.value);
    });
}


// --- Fonction de formatage de l'heure ---
function formatTime(timestamp) {
    const date = new Date(timestamp);
    // Retourne l'heure au format HH:MM
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}


// --- Envoyer un message (avec couleur et timestamp) ---
sendBtn.addEventListener('click', () => {
  const msg = input.value.trim();
  if (!msg) return;
  
  // Récupérer la couleur actuelle pour l'envoyer
  const userColor = getUserColor();

  db.ref('messages').push({ 
    text: msg, 
    id: userId,
    color: userColor, // Envoi de la couleur
    timestamp: firebase.database.ServerValue.TIMESTAMP // Utilise l'heure du serveur
  });
  input.value = '';
});

input.addEventListener('keypress', (e) => { if(e.key==='Enter') sendBtn.click(); });


// --- Écoute des messages (Afficher le pseudo coloré et nettoyer) ---
db.ref('messages').on('child_added', snapshot => {
  const msg = snapshot.val();
  const div = document.createElement('div');
  div.classList.add('msg');
  
  if (msg.id === userId) {
      div.classList.add('my-message');
  }

  // L'ID du perso (pseudo) - 4 premiers caractères
  const displayId = msg.id.substring(0, 4); 
  
  // L'heure du message (fallback si le timestamp n'est pas encore là)
  const time = msg.timestamp ? formatTime(msg.timestamp) : formatTime(Date.now());
  
  // La couleur choisie (fallback si non définie)
  const pseudoColor = msg.color || '#ae00ff'; 
  
  // Affichage du pseudo coloré, du message et de l'heure
  div.innerHTML = `
      <span class="user" style="color: ${pseudoColor};">${displayId}</span>: 
      ${msg.text} 
      <span class="timestamp">${time}</span>
  `;
  
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  // --- LOGIQUE DE NETTOYAGE : Supprime les messages au-delà du seuil de 100 ---
  
  db.ref('messages').once('value', messagesSnapshot => {
      const totalMessages = messagesSnapshot.numChildren();
      const limit = 100;

      if (totalMessages > limit) {
          const messages = [];
          messagesSnapshot.forEach(child => {
              // Stocke la clé et le timestamp pour le tri
              messages.push({ 
                  key: child.key, 
                  timestamp: child.val().timestamp || 0 
              });
          });

          // Trie les messages du plus ancien au plus récent
          messages.sort((a, b) => a.timestamp - b.timestamp);
          
          // Calcule le nombre de messages à supprimer
          const countToDelete = totalMessages - limit;
          const updates = {};
          
          // Marque les messages à supprimer (valeur null)
          for (let i = 0; i < countToDelete; i++) {
              updates[messages[i].key] = null;
          }

          // Exécute la suppression en bloc
          if (Object.keys(updates).length > 0) {
              db.ref('messages').update(updates)
                  .then(() => {
                      console.log(`${countToDelete} messages les plus anciens supprimés.`);
                  })
                  .catch(error => {
                      console.error("Erreur lors de la suppression des messages :", error);
                  });
          }
      }
  });
});
