let currentType, currentIndex;

// 打开弹窗
function openModal(type, index) {
  currentType = type;
  currentIndex = index;
  document.getElementById(type + 'Modal').classList.add('show');
  render(type);
}

// 关闭弹窗
function closeModal(type) {
  document.getElementById(type + 'Modal').classList.remove('show');
}

// 渲染数据
function render(type) {
  let data, grid;
  if (type === 'role') {
    data = rolesData;
    grid = document.getElementById('roleModalGrid');
    const kw = document.getElementById('filterRoleName').value.trim().toLowerCase();
    data = data.filter(i => !kw || i.name.toLowerCase().includes(kw));
  }
  if (type === 'card') {
    data = cardData;
    grid = document.getElementById('cardModalGrid');
    const star = document.getElementById('filterStar').value;
    const race = document.getElementById('filterRace').value;
    data = data.filter(i => (!star || i.star===star) && (!race || i.race===race));
  }
  if (type === 'equip') {
    data = equipData;
    grid = document.getElementById('equipModalGrid');
    const kw = document.getElementById('filterEquipName').value.trim().toLowerCase();
    data = data.filter(i => !kw || i.name.toLowerCase().includes(kw));
    // 渲染已选
    const sel = document.getElementById('selectedEquips');
    sel.innerHTML = '';
    const slot = document.querySelector(`.card-slot[data-index="${currentIndex}"]`);
    (slot.equips||[]).forEach(n=>{
      const tag = document.createElement('span');
      tag.textContent = n;
      tag.className = 'selected-tag';
      sel.appendChild(tag);
    });
  }
  grid.innerHTML = '';
  data.forEach(item=>{
    let src;
    if(type==='role') src = item.image;
    else if(type==='card') src = `images/${item.race}/${item.star}/${item.name}.jpg`;
    else src = item.image;
    const d = document.createElement('div');
    d.className = 'modal-item';
    d.innerHTML = `
      <img src="${src}" alt="${item.name}" onerror="this.src='images/placeholder.png'">
      <p>${item.name}</p>
      <button>${type==='equip'?'添加':'选择'}</button>
    `;
    d.querySelector('button').onclick = ()=> selectItem(type, item.name);
    grid.appendChild(d);
  });
}

// 选择项
function selectItem(type, name) {
  if (type==='role') {
    const slot = document.querySelector(`.role-slot[data-index="${currentIndex}"]`);
    slot.querySelector('img').src = `images/角色/${name}.jpg`;
    slot.querySelector('button').textContent = name;
    closeModal('role');
  }
  if (type==='card') {
    const slot = document.querySelector(`.card-slot[data-index="${currentIndex}"]`);
    const c = cardData.find(c=>c.name===name);
    slot.querySelector('img').src = `images/${c.race}/${c.star}/${name}.jpg`;
    slot.querySelector('.card-btn').textContent = name;
    closeModal('card');
  }
  if (type==='equip') {
    const slot = document.querySelector(`.card-slot[data-index="${currentIndex}"]`);
    slot.equips = slot.equips||[];
    if(!slot.equips.includes(name)) slot.equips.push(name);
    slot.querySelector('.equip-btn').textContent = `装备 (${slot.equips.length})`;
    render('equip');
  }
}

// 保存阵容
function saveLineup() {
  const roles = [...document.querySelectorAll('.role-slot')].map(s=>s.querySelector('button').textContent);
  const cards = [...document.querySelectorAll('.card-slot')].map(s=>s.querySelector('.card-btn').textContent);
  const equips = [...document.querySelectorAll('.card-slot')].map(s=>s.equips||[]);
  const stored = JSON.parse(localStorage.getItem('lineups')||'[]');
  stored.push({roles, cards, equips});
  localStorage.setItem('lineups', JSON.stringify(stored));
  renderHistory();
}

// 渲染历史
function renderHistory() {
  const d = document.getElementById('lineupDisplay');
  d.innerHTML = '';
  JSON.parse(localStorage.getItem('lineups')||'[]').forEach((l,i)=>{
    const div = document.createElement('div');
    div.className = 'lineup-item';
    div.textContent = `#${i+1} 角色: ${l.roles.join('、')} | 卡牌: ${l.cards.join('、')} | 装备: ${l.equips.map(a=>a.join(',')).join(' / ')}`;
    d.appendChild(div);
  });
}

// 事件绑定
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.role-btn').forEach(b=>b.onclick=()=>openModal('role',b.dataset.index));
  document.querySelectorAll('.card-btn').forEach(b=>b.onclick=()=>openModal('card',b.dataset.index));
  document.querySelectorAll('.equip-btn').forEach(b=>b.onclick=()=>openModal('equip',b.dataset.index));
  document.getElementById('roleModalClose').onclick   = ()=>closeModal('role');
  document.getElementById('cardModalClose').onclick   = ()=>closeModal('card');
  document.getElementById('equipModalClose').onclick  = ()=>closeModal('equip');
  document.getElementById('filterRoleName').oninput   = ()=>render('role');
  document.getElementById('filterStar').onchange      = ()=>render('card');
  document.getElementById('filterRace').onchange      = ()=>render('card');
  document.getElementById('filterEquipName').oninput  = ()=>render('equip');
  document.getElementById('saveLineup').onclick       = saveLineup;
  renderHistory();
});
