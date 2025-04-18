// --- 全局数据 & 当前槽位索引 ---
let currentRoleSlot = null;
let currentCardSlot = null;
let currentEquipSlot = null;
// equipSelections[cardIndex] = [装备名, ...]
const equipSelections = Array(6).fill().map(() => []);

// --- 打开/关闭弹窗 ---
function openModal(modalId) {
  document.getElementById(modalId).classList.add('show');
}
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

// --- 渲染角色列表 ---
function renderRoleGrid() {
  const kw = document.getElementById('filterRoleName').value.trim().toLowerCase();
  const grid = document.getElementById('roleModalGrid');
  grid.innerHTML = '';
  rolesData
    .filter(r => r.name.toLowerCase().includes(kw))
    .forEach(r => {
      const div = document.createElement('div');
      div.className = 'role-item';
      const img = document.createElement('img');
      img.src = r.image;
      img.alt = r.name;
      const p = document.createElement('p');
      p.textContent = r.name;
      const btn = document.createElement('button');
      btn.textContent = '选择';
      btn.onclick = () => {
        const slot = document.querySelector(`.role-slot[data-index="${currentRoleSlot}"]`);
        slot.querySelector('img').src = r.image;
        slot.querySelector('img').alt = r.name;
        slot.querySelector('button').textContent = r.name;
        closeModal('roleModal');
      };
      div.append(img, p, btn);
      grid.appendChild(div);
    });
}

// --- 渲染卡牌列表 ---
function renderCardGrid() {
  const star = document.getElementById('filterStar').value;
  const race = document.getElementById('filterRace').value;
  const grid = document.getElementById('cardModalGrid');
  grid.innerHTML = '';
  cardData
    .filter(c => (!star || c.star === star) && (!race || c.race === race))
    .forEach(c => {
      const div = document.createElement('div');
      div.className = 'card-item';
      const img = document.createElement('img');
      img.src = `images/${c.race}/${c.star}/${c.name}.jpg`;
      img.alt = c.name;
      const p = document.createElement('p');
      p.textContent = c.name;
      const btn = document.createElement('button');
      btn.textContent = '选择';
      btn.onclick = () => {
        const slot = document.querySelector(`.slot[data-index="${currentCardSlot}"]`);
        slot.querySelector('.slot-img img').src = img.src;
        slot.querySelector('.slot-img img').alt = c.name;
        slot.querySelector('.slot-btn').textContent = c.name;
        closeModal('cardModal');
      };
      div.append(img, p, btn);
      grid.appendChild(div);
    });
}

// --- 渲染装备列表 (可多选) ---
function renderEquipGrid() {
  const kw = document.getElementById('filterEquipName').value.trim().toLowerCase();
  const grid = document.getElementById('equipModalGrid');
  grid.innerHTML = '';
  equipData
    .filter(e => e.name.toLowerCase().includes(kw))
    .forEach(e => {
      const div = document.createElement('div');
      div.className = 'equip-item';
      const img = document.createElement('img');
      img.src = e.image;
      img.alt = e.name;
      const p = document.createElement('p');
      p.textContent = e.name;
      const btn = document.createElement('button');
      btn.textContent = equipSelections[currentEquipSlot].includes(e.name) ? '已选' : '选择';
      btn.onclick = () => {
        const sel = equipSelections[currentEquipSlot];
        if (sel.includes(e.name)) {
          sel.splice(sel.indexOf(e.name),1);
        } else {
          sel.push(e.name);
        }
        renderEquipGrid();
      };
      div.append(img, p, btn);
      grid.appendChild(div);
    });
}

// --- 装备完成后更新 UI（在卡牌槽下方显示装备名） ---
function applyEquipSelection() {
  const slot = document.querySelector(`.slot[data-index="${currentEquipSlot}"]`);
  // 先移除旧列表
  let list = slot.querySelector('.equip-list');
  if (list) list.remove();
  // 新建
  list = document.createElement('div');
  list.className = 'equip-list';
  equipSelections[currentEquipSlot].forEach(name => {
    const span = document.createElement('span');
    span.textContent = name;
    list.appendChild(span);
  });
  slot.appendChild(list);
  closeModal('equipModal');
}

// --- 保存阵容历史 ---
function saveLineup() {
  const lineup = Array.from(document.querySelectorAll('.slot')).map(s => s.querySelector('.slot-btn').textContent);
  const stored = JSON.parse(localStorage.getItem('lineups')||'[]');
  stored.push(lineup);
  localStorage.setItem('lineups', JSON.stringify(stored));
  renderLineups();
}
function renderLineups() {
  const disp = document.getElementById('lineupDisplay');
  disp.innerHTML = '';
  JSON.parse(localStorage.getItem('lineups')||'[]')
    .forEach((lu,i) => {
      const d = document.createElement('div');
      d.className = 'lineup-item';
      d.textContent = `#${i+1}：`+lu.join(' + ');
      disp.appendChild(d);
    });
}

// --- 事件绑定 ---
document.addEventListener('DOMContentLoaded', () => {
  // 角色按钮
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      currentRoleSlot = e.target.dataset.index;
      openModal('roleModal');
      renderRoleGrid();
    });
  });
  document.getElementById('filterRoleName').addEventListener('input', renderRoleGrid);
  document.getElementById('roleModalClose').addEventListener('click', () => closeModal('roleModal'));

  // 卡牌按钮
  document.querySelectorAll('.slot-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      currentCardSlot = e.target.dataset.index;
      openModal('cardModal');
      renderCardGrid();
    });
  });
  document.getElementById('filterStar').addEventListener('change', renderCardGrid);
  document.getElementById('filterRace').addEventListener('change', renderCardGrid);
  document.getElementById('cardModalClose').addEventListener('click', () => closeModal('cardModal'));

  // 装备按钮
  document.querySelectorAll('.equip-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      currentEquipSlot = e.target.dataset.index;
      openModal('equipModal');
      renderEquipGrid();
    });
  });
  document.getElementById('filterEquipName').addEventListener('input', renderEquipGrid);
  document.getElementById('equipModalClose').addEventListener('click', () => closeModal('equipModal'));
  document.getElementById('equipModalDone').addEventListener('click', applyEquipSelection);

  // 保存 & 历史阵容
  document.getElementById('saveLineup').addEventListener('click', saveLineup);
  renderLineups();
});
