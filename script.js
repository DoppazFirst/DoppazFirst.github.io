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

// Gestion de l'ID utilisateur anonyme (cookie)
function getUserId() {
  let id = document.cookie.split('; ').find(c => c.startsWith('userId='));
  if (!id) {
    id = Math.random().toString(36).substring(2, 10);
    document.cookie = `userId=${id}; max-age=${60*60*24*365}`;
  } else {
    id = id.split('=')[1];
  }
  return id;
}

const userId = getUserId();

// --- NOUVELLE FONCTION : Formatage de l'heure ---
function formatTime(timestamp) {
    const date = new Date(timestamp);
    // Retourne l'heure au format HH:MM (ex: 14:30)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}


// --- MODIFICATION : Envoyer un message (avec timestamp) ---
sendBtn.addEventListener('click', () => {
  const msg = input.value.trim();
  if (!msg) return;
  
  // Envoi du message avec l'ID, le texte, et un timestamp du serveur Firebase
  db.ref('messages').push({ 
    text: msg, 
    id: userId,
    timestamp: firebase.database.ServerValue.TIMESTAMP // Utilise l'heure du serveur
  });
  input.value = '';
});

input.addEventListener('keypress', (e) => { if(e.key==='Enter') sendBtn.click(); });

// --- MODIFICATION : Écoute des messages (avec timestamp et auto-nettoyage) ---
db.ref('messages').on('child_added', snapshot => {
  const msg = snapshot.val();
  const div = document.createElement('div');
  div.classList.add('msg');
  
  // Ajout d'une classe pour identifier nos propres messages (nécessite CSS)
  if (msg.id === userId) {
      div.classList.add('my-message');
  }

  // Affiche uniquement les 4 premiers caractères de l'ID comme pseudo visible
  const displayId = msg.id.substring(0, 4); 
  
  // Formate et affiche l'heure
  // Le || Date.now() est une sécurité si le timestamp serveur n'est pas encore là
  const time = msg.timestamp ? formatTime(msg.timestamp) : formatTime(Date.now());
  
  // Intégration de l'heure et du message
  div.innerHTML = `<span class="user">${displayId}</span>: ${msg.text} <span class="timestamp">${time}</span>`;
  
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  // --- LOGIQUE DE NETTOYAGE : Supprime les messages au-delà du seuil de 100 ---
  
  db.ref('messages').once('value', messagesSnapshot => {
      const totalMessages = messagesSnapshot.numChildren();
      const limit = 10; // La limite que vous avez définie

      if (totalMessages > limit) {
          const messages = [];
          messagesSnapshot.forEach(child => {
              // Stocke l'objet { key, timestamp } de chaque message
              messages.push({ 
                  key: child.key, 
                  timestamp: child.val().timestamp || 0 
              });
          });

          // Trie les messages par timestamp (le plus ancien d'abord)
          messages.sort((a, b) => a.timestamp - b.timestamp);
          
          // Calcule le nombre de messages à supprimer (total - limite)
          const countToDelete = totalMessages - limit;
          
          // Créé un objet de mise à jour pour la suppression en bloc
          const updates = {};
          for (let i = 0; i < countToDelete; i++) {
              // Ajoute la clé du message à supprimer avec une valeur null
              updates[messages[i].key] = null;
          }

          // Exécute la suppression en bloc pour nettoyer la base de données
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