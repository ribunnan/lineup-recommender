let currentRoleIndex = 0;
let currentCardIndex = 0;
let currentEquipCardIndex = 0;
let tempEquipSelection = [];

// —— 通用 —— 
function showModal(id)   { document.getElementById(id).classList.add('show'); }
function hideModal(id)   { document.getElementById(id).classList.remove('show'); }

// —— 角色 —— 
function openRoleModal(i) {
  currentRoleIndex = i;
  renderRoleGrid();
  showModal('roleModal');
}
function closeRoleModal() {
  hideModal('roleModal');
}
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
      img.src = r.image; img.alt = r.name;
      const p = document.createElement('p'); p.textContent = r.name;
      const btn = document.createElement('button');
      btn.textContent = '选择'; btn.onclick = () => {
        const slot = document.querySelector(`.role-slot[data-index="${currentRoleIndex}"]`);
        slot.querySelector('img').src = r.image;
        slot.querySelector('.role-btn').textContent = r.name;
        closeRoleModal();
      };
      div.append(img,p,btn);
      grid.appendChild(div);
    });
}

// —— 卡牌 —— 
function openCardModal(i) {
  currentCardIndex = i;
  renderCardGrid();
  showModal('cardModal');
}
function closeCardModal() {
  hideModal('cardModal');
}
function renderCardGrid() {
  const star = document.getElementById('filterStar').value;
  const race = document.getElementById('filterRace').value;
  const grid = document.getElementById('cardModalGrid');
  grid.innerHTML = '';
  cardData
    .filter(c => (!star || c.star===star) && (!race || c.race===race))
    .forEach(c => {
      const div = document.createElement('div');
      div.className = 'card-item';
      const img = document.createElement('img');
      img.src = `images/${c.race}/${c.star}/${c.name}.jpg`;
      img.alt = c.name;
      const p = document.createElement('p'); p.textContent = c.name;
      const btn = document.createElement('button');
      btn.textContent = '选择';
      btn.onclick = () => {
        const slot = document.querySelector(`.card-slot[data-index="${currentCardIndex}"]`);
        slot.querySelector('img').src = img.src;
        slot.querySelector('.card-btn').textContent = c.name;
        closeCardModal();
      };
      div.append(img,p,btn);
      grid.appendChild(div);
    });
}

// —— 装备 —— 
function openEquipModal(i) {
  currentEquipCardIndex = i;
  // 读取已选
  tempEquipSelection = (window.lineupData?.[i]?.equips || []).slice();
  renderEquipGrid();
  showModal('equipModal');
}
function closeEquipModal() {
  hideModal('equipModal');
}
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
      img.src = e.image; img.alt = e.name;
      const p = document.createElement('p'); p.textContent = e.name;
      const btn = document.createElement('button');
      const selected = tempEquipSelection.includes(e.name);
      btn.textContent = selected ? '已选' : '选择';
      btn.onclick = () => {
        if (tempEquipSelection.includes(e.name)) {
          tempEquipSelection = tempEquipSelection.filter(x=>x!==e.name);
        } else {
          tempEquipSelection.push(e.name);
        }
        renderEquipGrid();
      };
      div.append(img,p,btn);
      grid.appendChild(div);
    });
}
function confirmEquipSelection() {
  // 把选择写回 lineupData
  window.lineupData = window.lineupData || [];
  window.lineupData[currentEquipCardIndex] = window.lineupData[currentEquipCardIndex] || {};
  window.lineupData[currentEquipCardIndex].equips = tempEquipSelection.slice();
  // 在卡牌位下方显示已选装备数量
  const slot = document.querySelector(`.card-slot[data-index="${currentEquipCardIndex}"]`);
  let info = slot.querySelector('.equip-info');
  if (!info) {
    info = document.createElement('div');
    info.className = 'equip-info';
    slot.appendChild(info);
  }
  info.textContent = '装备：' + (tempEquipSelection.length ? tempEquipSelection.join('、') : '未选择');
  closeEquipModal();
}

// —— 保存 & 历史阵容 —— 
function saveLineup() {
  const roles = Array.from(document.querySelectorAll('.role-slot')).map(s=>s.querySelector('.role-btn').textContent);
  const cards = Array.from(document.querySelectorAll('.card-slot')).map(s=>s.querySelector('.card-btn').textContent);
  const equips = window.lineupData ? window.lineupData.map(e=>e.equips||[]) : Array(6).fill([]);
  const entry = { roles, cards, equips };
  const all = JSON.parse(localStorage.getItem('lineups')||'[]');
  all.push(entry);
  localStorage.setItem('lineups', JSON.stringify(all));
  renderLineups();
}
function renderLineups() {
  const display = document.getElementById('lineupDisplay');
  display.innerHTML = '';
  JSON.parse(localStorage.getItem('lineups')||'[]').forEach((l,i)=>{
    const div = document.createElement('div');
    div.className = 'lineup-item';
    div.textContent = `#${i+1}：角色[${l.roles.join(', ')}]  卡牌[${l.cards.join(', ')}]  装备[${l.equips.map(e=>e.join('/')).join('；')}]`;
    display.appendChild(div);
  });
}

// —— 事件绑定 —— 
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.role-btn').forEach(b=>b.onclick = ()=>openRoleModal(b.dataset.index));
  document.getElementById('roleModalClose').onclick = closeRoleModal;
  document.getElementById('filterRoleName').oninput = renderRoleGrid;

  document.querySelectorAll('.card-btn').forEach(b=>b.onclick = ()=>openCardModal(b.dataset.index));
  document.getElementById('cardModalClose').onclick = closeCardModal;
  document.getElementById('filterStar').onchange = renderCardGrid;
  document.getElementById('filterRace').onchange = renderCardGrid;

  document.querySelectorAll('.equip-btn').forEach(b=>b.onclick = ()=>openEquipModal(b.dataset.index));
  document.getElementById('equipModalClose').onclick = closeEquipModal;
  document.getElementById('filterEquipName').oninput = renderEquipGrid;
  document.getElementById('equipConfirmBtn').onclick = confirmEquipSelection;

  document.getElementById('saveLineup').onclick = saveLineup;
  renderLineups();
});
