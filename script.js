const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const gameList = document.getElementById('gameList');
const noResultMessage = document.getElementById('noResultMessage');

const gamesData = [
  { icon: '🎮', name: 'New Super Mario Bros Wii', editor: 'Nintendo', link: 'https://sto.romsfast.com/Wii/New%20Super%20Mario%20Bros.%20Wii%20(Europe)%20(EnFrDeEsIt)%20(Rev%202).zip?token=cyVZdVszClFMG3l2UCZbMlFRRBsgfFFyW2NbWU0bI3VZIVtoDgNFXXBzXXJUZ1BZRRc%3D' },
  { icon: '🏎', name: 'Mario-Kart Wii', editor: 'Nintendo', link: 'https://sto.romsfast.com/Wii/Mario%20Kart%20Wii%20(Europe%20Australia)%20(EnFrDeEsIt).zip?token=c2pYdE9iWVRaET11XnBXZV9ZQxNy' },
  { icon: '⚔️', name: 'The Legend of Zelda: Skyward Sword', editor: 'Nintendo', link: 'https://sto.romsfast.com/Wii/Legend%20of%20Zelda%20The%20-%20Skyward%20Sword%20(Europe)%20(EnFrDeEsIt).zip?token=cyVZdVszClFMG3l2UCZbMlFRRBsgfFFyW2NbWU0bI3VZIVtoDgNFXXBzXXJUZ1FXRhQ%3D' },
  { icon: '🚗', name: 'Need for Speed', editor: 'Electronic Arts', link: 'https://sto.romsfast.com/Wii/Need%20for%20Speed%20-%20Carbon%20(France).zip?token=cyVZdVszClFMG3l2UCZbMlFRRBsgfFFyW2NbWU0bI3VZIVtoDgNFXXBzXXJUZ1FXQRM%3D' },
  { icon: '👾', name: 'Wii Sport resort', editor: 'Taito', link: 'https://sto.romsfast.com/Wii/Wii%20Sports%20Resort%20(Europe)%20(EnFrDeEsIt).zip?token=cyVZdVszClFMG3l2UCZbMlFRRBsgfFFyW2NbWU0bI3VZIVtoDgNFXXBzXXJUZ1FWRRc%3D' }
];

function renderGames(games) {
  gameList.innerHTML = '';
  games.forEach(game => {
    const gameDiv = document.createElement('div');
    gameDiv.className = 'game';

    gameDiv.innerHTML = `
      <div class="game-info">
        <div class="game-icon">${game.icon}</div>
        <div>
          <h3>${game.name}</h3>
          <p>${game.editor}</p>
        </div>
      </div>
      <a href="${game.link}" class="button" target="_blank">Télécharger</a>
    `;

    gameList.appendChild(gameDiv);
  });
}

function filterGames() {
  const value = searchInput.value.toLowerCase();
  const filtered = gamesData.filter(game =>
    game.name.toLowerCase().includes(value) ||
    game.editor.toLowerCase().includes(value)
  );
  renderGames(filtered);
  noResultMessage.style.display = filtered.length > 0 ? 'none' : 'block';
}

function sortGames(by) {
  gamesData.sort((a, b) => {
    const aText = a[by].toLowerCase();
    const bText = b[by].toLowerCase();
    return aText.localeCompare(bText);
  });
  filterGames();
}

searchInput.addEventListener('input', filterGames);

sortSelect.addEventListener('change', () => {
  if (sortSelect.value !== 'default') {
    sortGames(sortSelect.value);
  } else {
    filterGames();
  }
});

// Initial rendering
renderGames(gamesData);