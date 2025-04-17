const cardOptions = [
  '战士', '幽灵', '机械', '自然', '龙族', '星灵', '野兽', '中立'
];

function initSelects() {
  for (let i = 1; i <= 6; i++) {
    const select = document.getElementById(`card${i}`);
    cardOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });
  }
  renderLineups();
}

function saveLineup() {
  const lineup = [];
  for (let i = 1; i <= 6; i++) {
    const value = document.getElementById(`card${i}`).value;
    lineup.push(value);
  }
  let stored = JSON.parse(localStorage.getItem('lineups') || '[]');
  stored.push(lineup);
  localStorage.setItem('lineups', JSON.stringify(stored));
  renderLineups();
}

function renderLineups() {
  const display = document.getElementById('lineupDisplay');
  display.innerHTML = '';
  const stored = JSON.parse(localStorage.getItem('lineups') || '[]');
  stored.forEach((lineup, index) => {
    const div = document.createElement('div');
    div.className = 'lineup-item';
    div.textContent = `#${index + 1}：` + lineup.join(' + ');
    display.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', initSelects);
