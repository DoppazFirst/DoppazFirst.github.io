document.addEventListener("DOMContentLoaded", function () {
    const games = [
      {
        name: "Gang Beast (MultiPlayer)",
        console: "PC",
        description: "rien pour l'instant",
        editor: "Boneloaf, Coatsink",
        icon: "🥊",
        link: "http://fs20.megadb.xyz:8080/d/47not5yoy5vxygoid3w3nfschjgkgoduyb453lqjwex6jdgmyycpicor4lztkiliaznulovr/Gang-Beasts-SteamRIP.com.rar"
      },
      {
        name: "Schedule I (MultiPlayer)",
        console: "PC",
        description: "rien pour l'instant",
        editor: "TVGS",
        icon: "🌿",
        link: "https://drive.online-fix.me:2053/Schedule%20I"
      },
      
    ];
  
    const path = window.location.pathname;
    const page = path.split("/").pop().toLowerCase();
    const consoleName = (page === '' || page === 'index.html' || page === 'jeux.html') ? 'index' : page.replace(".html", "");
  
    const container = document.getElementById("games-container");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    if (!container) return;
  
    function renderGames() {
      let filteredGames = (consoleName === "index")
        ? [...games]
        : games.filter(game => game.console === consoleName);
  
      // Recherche
      const searchTerm = searchInput?.value.toLowerCase() || "";
      if (searchTerm) {
        filteredGames = filteredGames.filter(game =>
          game.name.toLowerCase().includes(searchTerm) ||
          game.description.toLowerCase().includes(searchTerm) ||
          game.editor.toLowerCase().includes(searchTerm)
        );
      }
  
      // Tri
      const sortValue = sortSelect?.value || "default";
      if (sortValue === "name") {
        filteredGames.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortValue === "editor") {
        filteredGames.sort((a, b) => a.editor.localeCompare(b.editor));
      }
  
      // Affichage
      container.innerHTML = "";
      filteredGames.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.classList.add("game");
  
        if (consoleName === 'index') {
          gameElement.innerHTML = `
            <div class="game-info">
              <div class="game-icon">${game.icon}</div>
              <div>
                <h3>${game.name}</h3>
                <p>${game.editor}</p>
                <p>${game.console}</p>
              </div>
            </div>
            <a href="${game.link}" class="button" target="_blank">Télécharger</a>
          `;
        } else {
          const title = document.createElement("h3");
          title.textContent = game.name;
          gameElement.appendChild(title);
  
          const desc = document.createElement("p");
          desc.textContent = game.description;
          gameElement.appendChild(desc);
        }
  
        container.appendChild(gameElement);
      });
    }
  
    // Événements
    searchInput?.addEventListener("input", renderGames);
    sortSelect?.addEventListener("change", renderGames);
  
    renderGames();
  });
  
