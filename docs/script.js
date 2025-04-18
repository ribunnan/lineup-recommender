let currentType = null, currentIndex = null;

// 打开弹窗
function openModal(type, idx) {
  currentType = type;
  currentIndex = idx;
  document.getElementById(type + 'Modal').classList.add('active');
  renderGrid(type);
}
// 关闭弹窗
function closeModal(e) {
  const m = e.currentTarget.dataset.modal;
  document.getElementById(m).classList.remove('active');
}

// 渲染数据到弹窗
function renderGrid(type) {
  let data = [], grid, filterVal;
  if (type === 'role') {
    data = rolesData;
    grid = document.getElementById('roleGrid');
    filterVal = document.getElementById('filterRole').value.toLowerCase();
    data = data.filter(r => r.name.toLowerCase().includes(filterVal));
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
    filterVal = document.getElementById('filterEquip').value.toLowerCase();
    data = data.filter(e => e.name.toLowerCase().includes(filterVal));
  }
  grid.innerHTML = '';
  data.forEach(item => {
    const d = document.createElement('div'); d.className='card';
    d.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <p>${item.name}</p>
      <button>${ type==='equip' ? '添加' : '选择' }</button>
    `;
    d.querySelector('button').onclick = () => selectItem(type, item);
    grid.appendChild(d);
  });
}

// 选中条目
function selectItem(type, item) {
  if (type === 'role') {
    const slot = document
      .querySelector(`.role-slot[data-index="${currentIndex}"] .slot-img img`);
    slot.src = item.image; slot.alt = item.name;
    document.querySelector(`.role-slot[data-index="${currentIndex}"] button`)
      .textContent = item.name;
    document.querySelector('[data-modal="roleModal"]').click();
  }
  if (type === 'card') {
    const slot = document
      .querySelector(`.slot[data-index="${currentIndex}"] .slot-img img`);
    slot.src = item.image; slot.alt = item.name;
    document.querySelector(`.slot[data-index="${currentIndex}"] button`)
      .textContent = item.name;
    document.querySelector('[data-modal="cardModal"]').click();
  }
  if (type === 'equip') {
    // 多选装备：存到该卡牌的 dataset.equip 数组
    const sl = document.querySelector(`.slot[data-index="${currentIndex}"]`);
    let arr = sl.dataset.equip? JSON.parse(sl.dataset.equip): [];
    arr.push(item.name);
    sl.dataset.equip = JSON.stringify(arr);
    // 可在 UI 上提示已添加的装备……
  }
}

// 保存并渲染历史
function saveLineup() {
  const roles = Array.from(document.querySelectorAll('.role-slot button'))
    .map(b=>b.textContent);
  const cards = Array.from(document.querySelectorAll('.slot button:not(.equip-btn)'))
    .map(b=>b.textContent);
  const equips = Array.from(document.querySelectorAll('.slot'))
    .map(s=> s.dataset.equip? JSON.parse(s.dataset.equip): []);
  const lineup = { roles, cards, equips };
  const arr = JSON.parse(localStorage.getItem('lineups')||'[]');
  arr.push(lineup);
  localStorage.setItem('lineups', JSON.stringify(arr));
  renderHistory();
}
function renderHistory() {
  const arr = JSON.parse(localStorage.getItem('lineups')||'[]');
  const box = document.getElementById('lineupDisplay');
  box.innerHTML = '';
  arr.forEach((l,i)=>{
    const d = document.createElement('div'); d.className='item';
    d.textContent = `#${i+1} 角色：${l.roles.join(', ')} | 卡牌：${l.cards.join(', ')} | 装备：${l.equips.map(e=>e.join('+')).join(' ; ')}`;
    box.appendChild(d);
  });
}

document.addEventListener('DOMContentLoaded', ()=> {
  // 生成角色槽
  const rs = document.getElementById('roleSlots');
  for(let i=0;i<2;i++){
    const d = document.createElement('div'); d.className='slot role-slot'; d.dataset.index=i;
    d.innerHTML = `<div class="slot-img"><img src="images/placeholder.png"></div>
                   <button data-index="${i}">选择角色</button>`;
    rs.appendChild(d);
  }
  // 生成卡牌槽
  const cs = document.getElementById('cardSlots');
  for(let i=0;i<6;i++){
    const d = document.createElement('div'); d.className='slot'; d.dataset.index=i;
    d.innerHTML = `<div class="slot-img"><img src="images/placeholder.png"></div>
                   <button data-index="${i}">选择卡牌</button>
                   <button class="equip-btn" data-index="${i}">装备</button>`;
    cs.appendChild(d);
  }

  // 绑定打开弹窗
  document.querySelectorAll('.role-slot button')
    .forEach(b=>b.onclick=e=>openModal('role', e.target.dataset.index));
  document.querySelectorAll('.slot button:not(.equip-btn)')
    .forEach(b=>b.onclick=e=>openModal('card', e.target.dataset.index));
  document.querySelectorAll('.equip-btn')
    .forEach(b=>b.onclick=e=>openModal('equip', e.target.dataset.index));

  // 绑定关闭
  document.querySelectorAll('.close')
    .forEach(b=>b.onclick=closeModal);

  // 绑定筛选
  document.getElementById('filterRole').addEventListener('input', ()=>renderGrid('role'));
  document.getElementById('filterEquip').addEventListener('input', ()=>renderGrid('equip'));
  document.getElementById('filterStar').addEventListener('change', ()=>renderGrid('card'));
  document.getElementById('filterRace').addEventListener('change', ()=>renderGrid('card'));

  document.getElementById('saveLineup').onclick = saveLineup;
  renderHistory();
});
