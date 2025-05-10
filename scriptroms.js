document.addEventListener('DOMContentLoaded', () => {
    const games = [
        {
            name: "Mario Kart Wii",
            editor: "Nintendo",
            icon: "🏎",
            link: "https://sto.romsfast.com/Wii/Mario%20Kart%20Wii%20(Europe%20Australia)%20(EnFrDeEsIt).zip?token=cyVZdVszClFMG3lyWnxbaVhRRBt3dVt3WzYOAkUbI3JZJ1tmC1hCXXBzXXJZaFxUTRI%3D",
            description: "Mario Kart Wii (マリオカートWii, Mario Kāto Uī?) est un jeu vidéo de course développé par Nintendo EAD et édité par Nintendo. Il est sorti sur la Wii le 10 avril 2008.",
            console: "Wii"
        },
        {
            name: "Wii sport",
            editor: "Nintendo",
            icon: "👟",
            link: "https://sto.romsfast.com/Wii/Wii%20Sports%20(Europe)%20(EnFrDeEsIt)%20(Rev%201).zip?token=cyVZdVszClFMG3l2UCZbMlFRRBtyIFAmW2RRVhAbICBbc1toCVhCXXBzXXJWYl1SRRY%3D",
            description: "Wii Sports (Wii スポーツ, Wii Supōtsu?) est un jeu vidéo de sport développé et édité par Nintendo comme titre de lancement pour la console de jeux vidéo Wii. Il est commercialisé dans un premier temps en Amérique du Nord le 19 novembre 2006, et sort le mois suivant au Japon, en Australie et en Europe.",
            console: "Wii"
        },
        {
            name: "Wii sport resort",
            editor: "Nintendo",
            icon: "👟",
            link: "https://sto.romsfast.com/Wii/Wii%20Sports%20Resort%20(Europe)%20(EnFrDeEsIt).zip?token=cyVZdVszClFMG3l2UCZbMlFRRBt2dA0hW2RcVEwbeXVQdls0WlFDXXBzXXJWYV9QRhY%3D",
            description: "Wii Sports Resort est un jeu vidéo de sport, édité et développé par Nintendo, sorti sur Wii le 25 juin 2009 au Japon, le 23 juillet 2009 en Australie, le 24 juillet 2009 en Europe et le 26 juillet 2009 aux États-Unis. C'est la suite du jeu vidéo Wii Sports sur Wii.",
            console: "Wii"
        },
        {
            name: "New Super Mario Bros Wii",
            editor: "Nintendo",
            icon: "🍄",
            link: "https://sto.romsfast.com/Wii/New%20Super%20Mario%20Bros.%20Wii%20(Europe)%20(EnFrDeEsIt)%20(Rev%202).zip?token=cyVZdVszClFMG3l2UCZbMlFRRBt2dA0hW2RcVEwbeXVQdls0WlFDXXBzXXJWYV9VQRM%3D",
            description: "New Super Mario Bros. Wii est un jeu de plateforme développé et édité par Nintendo. Il a été publié sur Wii en 2009.",
            console: "Wii"
        },
        {
            name: "Need for Speed: Most Wanted",
            editor: "Electronic Arts",
            icon: "🚗",
            link: "https://sto.romsfast.com/GameCube-RVZ/Need%20for%20Speed%20-%20Most%20Wanted%20(France).zip?token=cyVZdVszClFMG3l2UCZbMlFRRBt2dA0hW2RcVEwbeXVQdls0WlFDXXBzXXJWYV9TTBQ%3D",
            description: "Need for Speed: Most Wanted est un hybride des spin-offs Underground et Hot Pursuit. Pour grimper dans la liste noire des pilotes illégaux, le joueur doit se faire connaître en pilotant dans les rues et en attirant l'attention des policiers. Enfin, il devra affronter Razor, qui l'a piégé dans sa voiture et l'a utilisée pour atteindre le sommet.",
            console: "Wii"
        },
        {
            name: "Super Mario Bros Wonder",
            editor: "Nintendo",
            icon: "🐘",
            link: "https://pub-897de1ddf9cc4c43a289f1d7006fcbf6.r2.dev/Super%20Mario%20Bros.%20Wonder%5B010015100B514000%5D%5B1.0.0%5D%5B0%5D%5B16.0.3%5D.nsp",
            description: "Super Mario Bros. Wonder (スーパーマリオブラザーズ ワンダー, Sūpā Mario Burazāzu Wandā?) est un jeu vidéo de plates-formes développé par Nintendo EPD et édité par Nintendo, sorti le 20 octobre 2023 sur Nintendo Switch.",
            console: "Switch"
        },
        {
            name: "Mario kart 8 Deluxe",
            editor: "Nintendo",
            icon: "🏎",
            link: "https://file.whatsapgroup.com/Mario%20Kart%208%20Deluxe%20%5B0100152000022000%5D%5Bv0%5D.nsp",
            description: "Mario Kart 8 (マリオカート8, Mario Kāto Eito?) est un jeu vidéo de course développé par Nintendo EAD et édité par Nintendo pour la console Wii U. Huitième opus de la série Mario Kart, il est sorti en mai 2014 au Japon, en Europe, en Australie et en Amérique du Nord.",
            console: "Switch"
        }
    ];

    const bestGamesContainer = document.getElementById('bestgames');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const noResultMessage = document.getElementById('noResultMessage');
    const page = window.location.pathname.split("/").pop().toLowerCase();
    const consoleName = page === '' ? 'index' : page.replace(".html", "").toLowerCase();


    // Filtrer les jeux selon la page
    let filteredGames = consoleName === 'index' ? games : games.filter(game =>
        game.console.toLowerCase() === consoleName
    );

    // Déterminer la classe à appliquer selon la page
    const gameClass = (consoleName === 'wii' || consoleName === 'switch') ? 'gamecard' : 'game';

    // Fonction pour afficher les jeux
    const displayGames = (gamesToDisplay) => {
        bestGamesContainer.innerHTML = '';
        if (gamesToDisplay.length === 0) {
            if (noResultMessage) {
                noResultMessage.style.display = 'block';
            }
        } else {
            if (noResultMessage) {
                noResultMessage.style.display = 'none';
            }
            gamesToDisplay.forEach(game => {
                const gameElement = document.createElement('div');
                gameElement.classList.add(gameClass);
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
                    gameElement.innerHTML = `
                        <div class="game-info">
                            <div class="game-icon">${game.icon}</div>
                            <div>
                                <h3>${game.name}</h3>
                                <p>${game.editor}</p>
                                <p>${game.console}</p>
                            </div>
                        </div>
                        <p>${game.description}</p>
                        <a href="${game.link}" class="button" target="_blank">Télécharger</a>
                    `;
                }
                bestGamesContainer.appendChild(gameElement);
            });
        }
    };

    // Fonction pour filtrer les jeux en fonction de la recherche
    const filterGames = () => {
        const searchTerm = searchInput.value.toLowerCase();
        filteredGames = games.filter(game =>
            (game.name.toLowerCase().includes(searchTerm) ||
            game.editor.toLowerCase().includes(searchTerm)) &&
            (consoleName === 'index' || game.console.toLowerCase() === consoleName)
        );
        displayGames(filteredGames);
    };

    // Fonction pour trier les jeux
    const sortGames = (criterion) => {
        const sortedGames = [...filteredGames].sort((a, b) => {
            if (criterion === "name") {
                return a.name.localeCompare(b.name);
            } else if (criterion === "editor") {
                return a.editor.localeCompare(b.editor);
            }
        });
        displayGames(sortedGames);
    };

    // Écouteurs d'événements
    if (searchInput) {
        searchInput.addEventListener('input', filterGames);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const criterion = e.target.value;
            if (criterion !== "default") {
                sortGames(criterion);
            } else {
                displayGames(filteredGames);
            }
        });
    }

    // Afficher tous les jeux au chargement de la page
    displayGames(filteredGames);
});
