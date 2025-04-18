let currentSlotType = null; // "role", "card", "equip"
let currentSlotIndex = null;

function openModal(type, index) {
  currentSlotType = type;
  currentSlotIndex = index;
  document.getElementById(type + 'Modal').classList.add('active');
  renderGrid(type);
}

function closeModal(evt) {
  const modal = evt.currentTarget.closest('.modal');
  modal.classList.remove('active');
}

function renderGrid(type) {
  let data = [], grid = null, filter = null;
  if (type === 'role') {
    data = rolesData;
    grid = document.getElementById('roleGrid');
    filter = document.getElementById('filterRole').value.trim().toLowerCase();
    data = data.filter(r => r.name.toLowerCase().includes(filter));
  }
  if (type === 'card') {
    data = cardData;
    grid = document.getElementById('cardGrid');
    const star = document.getElementById('filterStar').value;
    const race = document.getElementById('filterRace').value;
    data = data.filter(c => (!star||c.star===star) && (!race||c.race===race));
  }
  if (type === 'equip') {
    data = equipData;
    grid = document.getElementById('equipGrid');
    filter = document.getElementById('filterEquip').value.trim().toLowerCase();
    data = data.filter(e => e.name.toLowerCase().includes(filter));
  }
  grid.innerHTML = '';
  data.forEach(item => {
    const div = document.createElement('div'); div.className = 'card';
    const img = document.createElement('img'); img.src = item.image; img.alt = item.name;
    const p = document.createElement('p'); p.textContent = item.name;
    const btn = document.createElement('button'); btn.textContent = (type==='equip'?'添加':'选择');
    btn.onclick = () => selectItem(type, item);
    div.append(img,p,btn); grid.append(div);
  });
}

function selectItem(type, item) {
  if (type==='role') {
    const slot = document.querySelector(`.role-slot[data-index="${currentSlotIndex}"] .slot-img img`);
    slot.src = item.image; slot.alt = item.name;
    document.querySelector(`.role-slot[data-index="${currentSlotIndex}"] button`).textContent = item.name;
    closeModal({ currentTarget: document.querySelector('#roleModal .close') });
  }
  if (type==='card') {
    const slot = document.querySelector(`.slot[data-index="${currentSlotIndex}"] .slot-img img`);
    slot.src = item.image; slot.alt = item.name;
    document.querySelector(`.slot[data-index="${currentSlotIndex}"] button`).textContent = item.name;
    closeModal({ currentTarget: document.querySelector('#cardModal .close') });
  }
  if (type==='equip') {
    // 装备多选：记录到该卡牌的 data-equip 属性里
    const slotDiv = document.querySelector(`.slot[data-index="${currentSlotIndex}"]`);
    let list = slotDiv.dataset.equip? JSON.parse(slotDiv.dataset.equip): [];
    list.push(item.name);
    slotDiv.dataset.equip = JSON.stringify(list);
    // 可以在 UI 上显示已选装备名称列表……
  }
}

function saveLineup() {
  const roles = Array.from(document.querySelectorAll('.role-slot')).map(s=>s.querySelector('button').textContent);
  const cards = Array.from(document.querySelectorAll('.slot')).map(s=>s.querySelector('button').textContent);
  const equips = Array.from(document.querySelectorAll('.slot')).map(s=> s.dataset.equip? JSON.parse(s.dataset.equip): []);
  const lineup = { roles, cards, equips };
  const stored = JSON.parse(localStorage.getItem('lineups')||'[]');
  stored.push(lineup);
  localStorage.setItem('lineups', JSON.stringify(stored));
  renderHistory();
}

function renderHistory() {
  const list = JSON.parse(localStorage.getItem('lineups')||'[]');
  const container = document.getElementById('lineupDisplay');
  container.innerHTML = '';
  list.forEach((l,i)=>{
    const div = document.createElement('div'); div.className='item';
    div.textContent = `#${i+1} 角色：${l.roles.join(', ')} | 卡牌：${l.cards.join(', ')} | 装备：${l.equips.map(e=>e.join('+')).join(' ; ')}`;
    container.append(div);
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  // 渲染插槽
  const roleSlots = document.getElementById('roleSlots');
  for(let i=0;i<2;i++){
    const div = document.createElement('div'); div.className='slot role-slot'; div.dataset.index=i;
    div.innerHTML = `<div class="slot-img"><img src="images/placeholder.png"></div>
                     <button data-index="${i}">选择角色</button>`;
    roleSlots.append(div);
  }
  const cardSlots = document.getElementById('cardSlots');
  for(let i=0;i<6;i++){
    const div = document.createElement('div'); div.className='slot'; div.dataset.index=i;
    div.innerHTML = `<div class="slot-img"><img src="images/placeholder.png"></div>
                     <button data-index="${i}">选择卡牌</button>
                     <button class="equip-btn" data-index="${i}">装备</button>`;
    cardSlots.append(div);
  }

  // 绑定事件
  document.querySelectorAll('.role-slot button').forEach(b=>b.onclick=e=>openModal('role',e.target.dataset.index));
  document.querySelectorAll('.slot button:not(.equip-btn)').forEach(b=>b.onclick=e=>openModal('card',e.target.dataset.index));
  document.querySelectorAll('.equip-btn').forEach(b=>b.onclick=e=>openModal('equip',e.target.dataset.index));

  document.querySelectorAll('.close').forEach(b=>b.onclick=closeModal);
  document.getElementById('filterRole').addEventListener('input',()=>renderGrid('role'));
  document.getElementById('filterEquip').addEventListener('input',()=>renderGrid('equip'));
  document.getElementById('filterStar').addEventListener('change',()=>renderGrid('card'));
  document.getElementById('filterRace').addEventListener('change',()=>renderGrid('card'));
  document.getElementById('saveLineup').onclick = saveLineup;
  renderHistory();
});
