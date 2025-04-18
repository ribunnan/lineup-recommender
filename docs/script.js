let currentSlotType = null;
let currentSlotIndex = null;

// 打开弹窗
function openModal(type, index) {
  currentSlotType = type;
  currentSlotIndex = index;
  const modal = document.getElementById(type + 'Modal');
  modal.classList.add('show');
  renderModal(type);
}

// 关闭弹窗
function closeModal(type) {
  document.getElementById(type + 'Modal').classList.remove('show');
}

// 渲染各类型弹窗
function renderModal(type) {
  let data, grid;
  if (type === 'role') {
    data = rolesData;
    grid = document.getElementById('roleModalGrid');
  } else if (type === 'card') {
    data = cardData;
    grid = document.getElementById('cardModalGrid');
  } else if (type === 'equip') {
    data = equipData;
    grid = document.getElementById('equipModalGrid');
  }
  // 过滤
  let keyword = '';
  if (type === 'role') {
    keyword = document.getElementById('filterRoleName').value.trim().toLowerCase();
    data = data.filter(i => !keyword || i.name.toLowerCase().includes(keyword));
  } else if (type === 'card') {
    const star = document.getElementById('filterStar').value;
    const race = document.getElementById('filterRace').value;
    data = data.filter(i => (!star || i.star === star) && (!race || i.race === race));
  } else if (type === 'equip') {
    keyword = document.getElementById('filterEquipName').value.trim().toLowerCase();
    data = data.filter(i => !keyword || i.name.toLowerCase().includes(keyword));
    // 同时渲染已选装备
    const sel = document.getElementById('selectedEquips');
    sel.innerHTML = '';
    const slot = document.querySelector(`.card-slot[data-index="${currentSlotIndex}"]`);
    (slot.equips || []).forEach(name => {
      const span = document.createElement('span');
      span.textContent = name;
      span.className = 'selected-tag';
      sel.appendChild(span);
    });
  }
  // 绘制格子
  grid.innerHTML = '';
  data.forEach(item => {
    let imgSrc;
    if (type === 'role') {
      imgSrc = item.image;
    } else if (type === 'card') {
      imgSrc = `images/${item.race}/${item.star}/${item.name}.jpg`;
    } else { // equip
      imgSrc = item.image;
    }
    const d = document.createElement('div');
    d.className = 'modal-item';
    d.innerHTML = `
      <img src="${imgSrc}" alt="${item.name}" onerror="this.src='images/placeholder.png'">
      <p>${item.name}</p>
      <button>${type==='equip'?'添加':'选择'}</button>
    `;
    d.querySelector('button').onclick = () => selectItem(type, item.name);
    grid.appendChild(d);
  });
}

// 选择条目回填
function selectItem(type, name) {
  if (type === 'role') {
    const slot = document.querySelector(`.role-slot[data-index="${currentSlotIndex}"]`);
    slot.querySelector('img').src = `images/角色/${name}.jpg`;
    slot.querySelector('button').textContent = name;
    closeModal('role');
  } else if (type === 'card') {
    const slot = document.querySelector(`.card-slot[data-index="${currentSlotIndex}"]`);
    // 找对应卡牌对象
    const card = cardData.find(c => c.name === name);
    slot.querySelector('img').src = `images/${card.race}/${card.star}/${name}.jpg`;
    slot.querySelector('.card-btn').textContent = name;
    closeModal('card');
  } else {
    // 装备可多选
    const slot = document.querySelector(`.card-slot[data-index="${currentSlotIndex}"]`);
    slot.equips = slot.equips||[];
    if (!slot.equips.includes(name)) {
      slot.equips.push(name);
      // 更新下按钮文字为已选数量
      slot.querySelector('.equip-btn').textContent = `装备 (${slot.equips.length})`;
    }
    renderModal('equip');
  }
}

// 保存阵容
function saveLineup() {
  const roles = Array.from(document.querySelectorAll('.role-slot')).map(s => s.querySelector('button').textContent);
  const cards = Array.from(document.querySelectorAll('.card-slot')).map(s => s.querySelector('.card-btn').textContent);
  const equips = Array.from(document.querySelectorAll('.card-slot')).map(s => s.equips||[]);
  const lineup = { roles, cards, equips };
  const stored = JSON.parse(localStorage.getItem('lineups')||'[]');
  stored.push(lineup);
  localStorage.setItem('lineups', JSON.stringify(stored));
  renderLineups();
}

// 渲染历史阵容
function renderLineups() {
  const disp = document.getElementById('lineupDisplay');
  disp.innerHTML = '';
  JSON.parse(localStorage.getItem('lineups')||'[]').forEach((l,i) => {
    const div = document.createElement('div');
    div.className = 'lineup-item';
    div.textContent = `#${i+1} 角色: ${l.roles.join('、')} | 卡牌: ${l.cards.join('、')} | 装备: ${l.equips.map(a=>a.join(',')).join(' / ')}`;
    disp.appendChild(div);
  });
}

// 事件绑定
document.addEventListener('DOMContentLoaded', () => {
  // 打开/关闭
  document.querySelectorAll('.role-btn').forEach(b => b.onclick = () => openModal('role', b.dataset.index));
  document.querySelectorAll('.card-btn').forEach(b => b.onclick = () => openModal('card', b.dataset.index));
  document.querySelectorAll('.equip-btn').forEach(b=> b.onclick = () => openModal('equip', b.dataset.index));
  document.getElementById('roleModalClose').onclick = () => closeModal('role');
  document.getElementById('cardModalClose').onclick = () => closeModal('card');
  document.getElementById('equipModalClose').onclick = () => closeModal('equip');
  // 筛选
  document.getElementById('filterRoleName').oninput = () => renderModal('role');
  document.getElementById('filterStar').onchange = () => renderModal('card');
  document.getElementById('filterRace').onchange = () => renderModal('card');
  document.getElementById('filterEquipName').oninput = () => renderModal('equip');
  // 保存 & 载入历史
  document.getElementById('saveLineup').onclick = saveLineup;
  renderLineups();
});
