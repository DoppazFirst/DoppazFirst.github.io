document.addEventListener('DOMContentLoaded', () => {
    const games = [
      {
        name: "Mario Kart Wii",
        editor: "Nintendo",
        icon: "🏎",
        link: "https://exemple.com/mkwii",
        description: "Mario Kart Wii (マリオカートWii, Mario Kāto Uī?) est un jeu vidéo de course développé par Nintendo EAD et édité par Nintendo. Il est sorti sur la Wii le 10 avril 2008 au Japon, le 11 avril 2008 en Europe, et le 24 avril 2008 en Australie et en Amérique du Nord.",
        console: "Wii"
      },
      {
        name: "New Super Mario Bros Wii",
        editor: "Nintendo",
        icon: "🍄",
        link: "https://exemple.com/nsmbw",
        description: "New Super Mario Bros. Wii est un jeu de plateforme développé et édité par Nintendo. Il a été publié sur Wii en 2009 et permet de jouer à plusieurs jusqu'à 4 joueurs.",
        console: "Wii"
      },
      {
        name: "Pokémon Platine",
        editor: "Game Freak",
        icon: "⚡",
        link: "https://exemple.com/platine",
        description: "Pokémon Platine est un jeu vidéo de rôle développé par Game Freak et édité par Nintendo sur Nintendo DS. C’est une version améliorée de Diamant et Perle.",
        console: "DS"
      }
    ];
  
    const bestGamesContainer = document.getElementById('bestgames');
    const page = window.location.pathname.split("/").pop().toLowerCase();
    const consoleName = page.replace(".html", "").toLowerCase();
  
    const filteredGames = games.filter(game =>
      game.console.toLowerCase() === consoleName
    );
  
    filteredGames.forEach(game => {
      const gameElement = document.createElement('div');
      gameElement.classList.add('gamecard');
      gameElement.innerHTML = `
        <div class="game-info">
          <div class="game-icon">${game.icon}</div>
          <div>
            <h3>${game.name}</h3>
            <p>${game.editor}</p>
          </div>
        </div>
        <p>${game.description}</p>
        <a href="${game.link}" class="button" target="_blank">Télécharger</a>
      `;
      bestGamesContainer.appendChild(gameElement);
    });
  });
  