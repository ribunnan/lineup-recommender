let currentSlot = 0;

// 打开弹窗
function openModal(slotIndex) {
  currentSlot = slotIndex;
  document.getElementById('modal').classList.add('show');
  renderModalGrid();
}

// 关闭弹窗
function closeModal() {
  document.getElementById('modal').classList.remove('show');
}

// 渲染弹窗里的卡牌格子
function renderModalGrid() {
  const star = document.getElementById('filterStar').value;
  const race = document.getElementById('filterRace').value;
  const grid = document.getElementById('modalGrid');
  grid.innerHTML = '';

  cardData
    .filter(card => (!star || card.star === star) && (!race || card.race === race))
    .forEach(card => {
      const div = document.createElement('div');
      div.className = 'card-item';

      const img = document.createElement('img');
      img.src = `images/${card.race}/${card.star}/${card.name}.jpg`;
      img.alt = card.name;
      img.onerror = () => {
        img.src = 'images/placeholder.png';
      };

      const p = document.createElement('p');
      p.textContent = card.name;

      const btn = document.createElement('button');
      btn.textContent = '选择';
      btn.onclick = () => selectCard(card);

      div.append(img, p, btn);
      grid.appendChild(div);
    });
}

// 选中卡牌，更新槽位
function selectCard(card) {
  const slot = document.querySelector(`.slot[data-index="${currentSlot}"]`);
  const img = slot.querySelector('img');
  img.src = `images/${card.race}/${card.star}/${card.name}.jpg`;
  img.alt = card.name;
  img.onerror = () => {
    img.src = 'images/placeholder.png';
  };

  slot.querySelector('.slot-btn').textContent = card.name;
  closeModal();
}

// 保存阵容到 localStorage
function saveLineup() {
  const lineup = Array.from(document.querySelectorAll('.slot')).map(slot => {
    return slot.querySelector('.slot-btn').textContent;
  });
  const stored = JSON.parse(localStorage.getItem('lineups') || '[]');
  stored.push(lineup);
  localStorage.setItem('lineups', JSON.stringify(stored));
  renderLineups();
}

// 渲染历史阵容
function renderLineups() {
  const display = document.getElementById('lineupDisplay');
  display.innerHTML = '';
  const stored = JSON.parse(localStorage.getItem('lineups') || '[]');
  stored.forEach((lineup, i) => {
    const div = document.createElement('div');
    div.className = 'lineup-item';
    div.textContent = `#${i + 1}：` + lineup.join(' + ');
    display.appendChild(div);
  });
}

// 事件绑定
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.slot-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.index));
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('filterStar').addEventListener('change', renderModalGrid);
  document.getElementById('filterRace').addEventListener('change', renderModalGrid);
  document.getElementById('saveLineup').addEventListener('click', saveLineup);
  renderLineups();
});
