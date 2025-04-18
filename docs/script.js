let currentType = null, currentIndex = null;

function openModal(type, idx) {
  currentType = type;
  currentIndex = idx;
  document.getElementById(type + 'Modal').classList.add('active');
  renderGrid(type);
}

function closeModal(evt) {
  const modalId = evt.currentTarget.dataset.modal;
  document.getElementById(modalId).classList.remove('active');
}

function renderGrid(type) {
  let data = [], grid, filterVal;

  if (type === 'role') {
    data = rolesData;
    grid = document.getElementById('roleModalGrid');
    filterVal = document.getElementById('filterRoleName').value.toLowerCase();
    data = data.filter(r => r.name.toLowerCase().includes(filterVal));
  }

  if (type === 'card') {
    data = cardData;
    grid = document.getElementById('cardModalGrid');
    const star = document.getElementById('filterStar').value;
    const race = document.getElementById('filterRace').value;
    data = data.filter(c => (!star || c.star === star) && (!race || c.race === race));
  }

  if (type === 'equip') {
    data = equipData;
    grid = document.getElementById('equipModalGrid');
    // 先渲染已选装备行
    const sel = JSON.parse(document.querySelector(`.slot[data-index="${currentIndex}"]`).dataset.equip || '[]');
    document.getElementById('equipSelected').innerHTML =
      sel.map(n => `<span class="chip">${n}</span>`).join('');
    filterVal = document.getElementById('filterEquipName').value.toLowerCase();
    data = data.filter(e => e.name.toLowerCase().includes(filterVal));
  }

  grid.innerHTML = '';
  data.forEach(item => {
    let imgSrc;
    if (type === 'role') {
      imgSrc = `images/角色/${item.name}.jpg`;
    } else if (type === 'card') {
      imgSrc = `images/${item.race}/${item.star}/${item.name}.jpg`;
    } else {
      imgSrc = `images/装备/${item.name}.jpg`;
    }

    const d = document.createElement('div');
    d.className = 'card';
    d.innerHTML = `
      <img src="${imgSrc}" alt="${item.name}" onerror="this.src='images/placeholder.png'">
      <p>${item.name}</p>
      <button>${type === 'equip' ? '添加' : '选择'}</button>
    `;
    d.querySelector('button').onclick = () => selectItem(type, item);
    grid.appendChild(d);
  });
}

function selectItem(type, item) {
  if (type === 'role') {
    document.querySelector(`.role-slot[data-index="${currentIndex}"] .slot-img img`)
      .src = `images/角色/${item.name}.jpg`;
    document.querySelector(`.role-slot[data-index="${currentIndex}"] button`)
      .textContent = item.name;
    closeModal({ currentTarget: { dataset: { modal: 'roleModal' } } });
  }
  if (type === 'card') {
    document.querySelector(`.slot[data-index="${currentIndex}"] .slot-img img`)
      .src = `images/${item.race}/${item.star}/${item.name}.jpg`;
    document.querySelector(`.slot[data-index="${currentIndex}"] button:not(.equip-btn)`)
      .textContent = item.name;
    closeModal({ currentTarget: { dataset: { modal: 'cardModal' } } });
  }
  if (type === 'equip') {
    const sl = document.querySelector(`.slot[data-index="${currentIndex}"]`);
    const arr = JSON.parse(sl.dataset.equip || '[]');
    arr.push(item.name);
    sl.dataset.equip = JSON.stringify(arr);
    sl.querySelector('.equip-btn').textContent = `装备 (${arr.length})`;
    // 更新顶部展示
    document.getElementById('equipSelected').innerHTML =
      arr.map(n => `<span class="chip">${n}</span>`).join('');
  }
}

function saveLineup() {
  const roles = [...document.querySelectorAll('.role-slot button')].map(b => b.textContent);
  const cards = [...document.querySelectorAll('.slot button:not(.equip-btn)')].map(b => b.textContent);
  const equips = [...document.querySelectorAll('.slot')].map(s => JSON.parse(s.dataset.equip || '[]'));
  const lineup = { roles, cards, equips };
  const arr = JSON.parse(localStorage.getItem('lineups') || '[]');
  arr.push(lineup);
  localStorage.setItem('lineups', JSON.stringify(arr));
  renderHistory();
}

function renderHistory() {
  const arr = JSON.parse(localStorage.getItem('lineups') || '[]');
  const box = document.getElementById('lineupDisplay');
  box.innerHTML = '';
  arr.forEach((l, i) => {
    const d = document.createElement('div');
    d.className = 'item';
    d.textContent = `#${i+1} 角色: ${l.roles.join(', ')} | 卡牌: ${l.cards.join(', ')} | 装备: ${l.equips.map(e=>e.join('+')).join(' ; ')}`;
    box.appendChild(d);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // 生成角色槽
  const rs = document.getElementById('roleSlots');
  for (let i = 0; i < 2; i++) {
    const d = document.createElement('div');
    d.className = 'role-slot';
    d.dataset.index = i;
    d.innerHTML = `
      <div class="slot-img"><img src="images/placeholder.png"></div>
      <button data-index="${i}">选择角色</button>
    `;
    rs.appendChild(d);
  }
  // 生成卡牌槽
  const cs = document.getElementById('cardSlots');
  for (let i = 0; i < 6; i++) {
    const d = document.createElement('div');
    d.className = 'slot';
    d.dataset.index = i;
    d.innerHTML = `
      <div class="slot-img"><img src="images/placeholder.png"></div>
      <button data-index="${i}">选择卡牌</button>
      <button class="equip-btn" data-index="${i}">装备</button>
    `;
    cs.appendChild(d);
  }

  // 绑定打开
  document.querySelectorAll('.role-slot button')
    .forEach(b => b.onclick = e => openModal('role', e.target.dataset.index));
  document.querySelectorAll('.slot button:not(.equip-btn)')
    .forEach(b => b.onclick = e => openModal('card', e.target.dataset.index));
  document.querySelectorAll('.equip-btn')
    .forEach(b => b.onclick = e => openModal('equip', e.target.dataset.index));

  // 绑定关闭
  document.querySelectorAll('.close').forEach(b => b.onclick = closeModal);

  // 绑定筛选
  document.getElementById('filterRoleName').addEventListener('input', () => renderGrid('role'));
  document.getElementById('filterEquipName').addEventListener('input', () => renderGrid('equip'));
  document.getElementById('filterStar').addEventListener('change', () => renderGrid('card'));
  document.getElementById('filterRace').addEventListener('change', () => renderGrid('card'));

  // 保存 & 历史
  document.getElementById('saveLineup').onclick = saveLineup;
  renderHistory();
});
