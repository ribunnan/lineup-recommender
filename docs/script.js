let currentRoleSlot = 0;
let currentCardSlot = 0;
let currentEquipSlot = 0;

// 打开弹窗
function openRoleModal(idx) {
  currentRoleSlot = idx;
  document.getElementById('roleModal').classList.add('show');
  renderRoleModalGrid();
}
function openCardModal(idx) {
  currentCardSlot = idx;
  document.getElementById('cardModal').classList.add('show');
  renderCardModalGrid();
}
function openEquipModal(idx) {
  currentEquipSlot = idx;
  document.getElementById('equipModal').classList.add('show');
  renderEquipModalGrid();
}

// 关闭弹窗
document.getElementById('roleModalClose').onclick = () => document.getElementById('roleModal').classList.remove('show');
document.getElementById('cardModalClose').onclick = () => document.getElementById('cardModal').classList.remove('show');
document.getElementById('equipModalClose').onclick = () => document.getElementById('equipModal').classList.remove('show');

// 渲染角色列表
function renderRoleModalGrid() {
  const kw = document.getElementById('filterRoleName').value.trim().toLowerCase();
  const grid = document.getElementById('roleModalGrid');
  grid.innerHTML = '';
  rolesData
    .filter(r => r.name.toLowerCase().includes(kw))
    .forEach(r => {
      const d = document.createElement('div');
      d.className = 'role-item';
      d.innerHTML = `
        <img src="${r.image}" alt="${r.name}">
        <p>${r.name}</p>
        <button>选 择</button>
      `;
      d.querySelector('button').onclick = () => {
        const slot = document.querySelector(`.role-slot[data-index="${currentRoleSlot}"]`);
        slot.querySelector('img').src = r.image;
        slot.querySelector('.role-btn').textContent = r.name;
        document.getElementById('roleModal').classList.remove('show');
      };
      grid.appendChild(d);
    });
}
document.getElementById('filterRoleName').oninput = renderRoleModalGrid;

// 渲染卡牌列表
function renderCardModalGrid() {
  const star = document.getElementById('filterStar').value;
  const race = document.getElementById('filterRace').value;
  const grid = document.getElementById('cardModalGrid');
  grid.innerHTML = '';
  cardData
    .filter(c => (!star || c.star === star) && (!race || c.race === race))
    .forEach(c => {
      const d = document.createElement('div');
      d.className = 'card-item';
      d.innerHTML = `
        <img src="images/${c.race}/${c.star}/${c.name}.jpg" alt="${c.name}">
        <p>${c.name}</p>
        <button>选 择</button>
      `;
      d.querySelector('button').onclick = () => {
        const slot = document.querySelector(`.slot[data-index="${currentCardSlot}"]`);
        slot.querySelector('img').src = `images/${c.race}/${c.star}/${c.name}.jpg`;
        slot.querySelector('.slot-btn').textContent = c.name;
        document.getElementById('cardModal').classList.remove('show');
      };
      grid.appendChild(d);
    });
}
document.getElementById('filterStar').onchange = renderCardModalGrid;
document.getElementById('filterRace').onchange = renderCardModalGrid;

// 渲染装备列表
function renderEquipModalGrid() {
  const grid = document.getElementById('equipModalGrid');
  grid.innerHTML = '';
  equipData.forEach(e => {
    const d = document.createElement('div');
    d.className = 'equip-item';
    d.innerHTML = `
      <img src="${e.image}" alt="${e.name}">
      <p>${e.name}</p>
      <button>选 择</button>
    `;
    d.querySelector('button').onclick = () => {
      const slot = document.querySelector(`.slot[data-index="${currentEquipSlot}"]`);
      const list = slot.querySelector('.equip-list');
      const tag = document.createElement('span');
      tag.textContent = e.name;
      tag.className = 'equip-tag';
      list.appendChild(tag);
      // 装备可多选，不自动关闭
    };
    grid.appendChild(d);
  });
}

// 保存并渲染历史阵容
function saveLineup() {
  const lineup = Array.from(document.querySelectorAll('.slot')).map(s => s.querySelector('.slot-btn').textContent);
  const stored = JSON.parse(localStorage.getItem('lineups') || '[]');
  stored.push(lineup);
  localStorage.setItem('lineups', JSON.stringify(stored));
  renderLineups();
}
function renderLineups() {
  const display = document.getElementById('lineupDisplay');
  display.innerHTML = '';
  JSON.parse(localStorage.getItem('lineups') || '[]').forEach((lu,i) => {
    const div = document.createElement('div');
    div.className = 'lineup-item';
    div.textContent = `#${i+1}：` + lu.join(' + ');
    display.appendChild(div);
  });
}

// 事件绑定
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.role-btn').forEach(b => b.onclick = e => openRoleModal(e.target.dataset.index));
  document.querySelectorAll('.slot-btn').forEach(b => b.onclick = e => openCardModal(e.target.dataset.index));
  document.querySelectorAll('.equip-btn').forEach(b => b.onclick = e => openEquipModal(e.target.dataset.index));
  document.getElementById('saveLineup').onclick = saveLineup;
  renderLineups();
});
