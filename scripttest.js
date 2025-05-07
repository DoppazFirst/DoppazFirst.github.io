document.addEventListener('DOMContentLoaded', () => {
    const games = [
        {
            name: "Mario Kart Wii",
            editor: "Nintendo",
            icon: "🏎",
            link: "https://exemple.com/mkwii",
            description: "Mario Kart Wii (マリオカートWii, Mario Kāto Uī?) est un jeu vidéo de course développé par Nintendo EAD et édité par Nintendo. Il est sorti sur la Wii le 10 avril 2008.",
            console: "Wii"
        },
        {
            name: "Wii sport resort",
            editor: "Nintendo",
            icon: "👟",
            link: "https://exemple.com/mkwii",
            description: "Wii Sports Resort est un jeu vidéo de sport, édité et développé par Nintendo, sorti sur Wii le 25 juin 2009 au Japon, le 23 juillet 2009 en Australie, le 24 juillet 2009 en Europe et le 26 juillet 2009 aux États-Unis. C'est la suite du jeu vidéo Wii Sports sur Wii.",
            console: "Wii"
        },
        {
            name: "New Super Mario Bros Wii",
            editor: "Nintendo",
            icon: "🍄",
            link: "https://exemple.com/nsmbw",
            description: "New Super Mario Bros. Wii est un jeu de plateforme développé et édité par Nintendo. Il a été publié sur Wii en 2009.",
            console: "Wii"
        },
        {
            name: "Pokémon Platine",
            editor: "Game Freak",
            icon: "⚡",
            link: "https://exemple.com/platine",
            description: "Pokémon Platine est un jeu vidéo de rôle développé par Game Freak et édité par Nintendo sur Nintendo DS.",
            console: "DS"
        },
        {
            name: "The Legend of Zelda: Breath of the Wild",
            editor: "Nintendo",
            icon: "🧝‍♂️",
            link: "https://exemple.com/zelda",
            description: "The Legend of Zelda: Breath of the Wild est un jeu vidéo d'action-aventure développé par Nintendo pour la Switch.",
            console: "Switch"
        },
        {
            name: "Super Mario Odyssey",
            editor: "Nintendo",
            icon: "👑",
            link: "https://exemple.com/odyssey",
            description: "Super Mario Odyssey est un jeu vidéo de plateforme développé par Nintendo pour la Nintendo Switch.",
            console: "Switch"
        }
    ];

    const bestGamesContainer = document.getElementById('bestgames') || document.getElementById('game-list');
    const page = window.location.pathname.split("/").pop().toLowerCase();
    const consoleName = page.replace(".html", "").toLowerCase();

    // Filtrer les jeux selon la page
    const filteredGames = games.filter(game =>
        game.console.toLowerCase() === consoleName || consoleName === 'index'
    );

    filteredGames.forEach(game => {
        // Déterminer la classe à appliquer selon la page
        const gameClass = (consoleName === 'wii' || consoleName === 'switch') ? 'gamecard' : 'game';

        const gameElement = document.createElement('div');
        gameElement.classList.add(gameClass);  // Appliquer la classe dynamique (game ou gamecard)
        
        // Si c'est index.html, ne pas ajouter la description
        if (consoleName === 'index') {
            gameElement.innerHTML = `
                <div class="game-info">
                    <div class="game-icon">${game.icon}</div>
                    <div>
                        <h3>${game.name}</h3>
                        <p>${game.editor}</p>
                    </div>
                </div>
                <a href="${game.link}" class="button" target="_blank">Télécharger</a>
            `;
        } else {
            // Si ce n'est pas index.html, ajouter la description
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
        }

        bestGamesContainer.appendChild(gameElement);
    });

    // Fonction de tri des jeux par critère
    const sortGames = (criterion) => {
        const sortedGames = [...filteredGames].sort((a, b) => {
            if (criterion === "name") {
                return a.name.localeCompare(b.name);
            } else if (criterion === "editor") {
                return a.editor.localeCompare(b.editor);
            }
        });

        // Vider le container actuel et réinsérer les jeux triés
        bestGamesContainer.innerHTML = '';
        sortedGames.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.classList.add(gameClass);  // Appliquer la classe dynamique (game ou gamecard)
            // Si c'est index.html, ne pas ajouter la description
            gameElement.innerHTML = `
                <div class="game-info">
                    <div class="game-icon">${game.icon}</div>
                    <div>
                        <h3>${game.name}</h3>
                        <p>${game.editor}</p>
                    </div>
                </div>
                <a href="${game.link}" class="button" target="_blank">Télécharger</a>
                ${consoleName !== 'index' ? `<p>${game.description}</p>` : ''}
            `;
            bestGamesContainer.appendChild(gameElement);
        });
    };

    // Connecter les boutons de tri à la fonction
    if (document.getElementById('sort-name')) {
        document.getElementById('sort-name').addEventListener('click', () => sortGames("name"));
    }
    if (document.getElementById('sort-editor')) {
        document.getElementById('sort-editor').addEventListener('click', () => sortGames("editor"));
    }
});
