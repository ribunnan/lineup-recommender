// 缓存 DOM
const roleSlots = [...document.querySelectorAll('.role-slot')];
const cardSlots = [...document.querySelectorAll('.card-slot')];
const saveBtn = document.getElementById('saveLineup');
const historyList = document.getElementById('historyList');

// 当前操作
let currentRoleSlot = null;
let currentCardSlot = null;
let currentEquipSlot = null;

// 弹窗 & 栅格
function openModal(modalId) { document.getElementById(modalId).classList.add('show'); }
function closeModal(modalEl) { modalEl.classList.remove('show'); }

// 渲染角色弹窗
function renderRoles() {
  const kw = document.getElementById('filterRoleName').value.trim().toLowerCase();
  const grid = document.getElementById('roleModalGrid');
  grid.innerHTML = '';
  rolesData
    .filter(r => r.name.toLowerCase().includes(kw))
    .forEach(r => {
      const div = document.createElement('div'); div.className = 'role-item';
      const img = Object.assign(document.createElement('img'), { src: r.image, alt: r.name });
      const btn = document.createElement('button'); btn.textContent = r.name;
      btn.onclick = () => {
        const slot = roleSlots[currentRoleSlot];
        slot.querySelector('img').src = r.image;
        slot.querySelector('img').alt = r.name;
        slot.querySelector('button').textContent = r.name;
        closeModal(document.getElementById('roleModal'));
      };
      div.append(img, btn);
      grid.appendChild(div);
    });
}

// 渲染卡牌弹窗
function renderCards() {
  const star = document.getElementById('filterStar').value;
  const race = document.getElementById('filterRace').value;
  const grid = document.getElementById('cardModalGrid');
  grid.innerHTML = '';
  cardData
    .filter(c => (!star||c.star===star) && (!race||c.race===race))
    .forEach(c => {
      const div = document.createElement('div'); div.className = 'card-item';
      const img = document.createElement('img');
      img.src = `images/${c.race}/${c.star}/${c.name}.jpg`;
      img.alt = c.name;
      const btn = document.createElement('button'); btn.textContent = c.name;
      btn.onclick = () => {
        const slot = cardSlots[currentCardSlot];
        slot.querySelector('img').src = img.src;
        slot.querySelector('button.card-btn').textContent = c.name;
        closeModal(document.getElementById('cardModal'));
      };
      div.append(img, btn);
      grid.appendChild(div);
    });
}

// 渲染装备弹窗
function renderEquips() {
  const kw = document.getElementById('filterEquipName').value.trim().toLowerCase();
  const grid = document.getElementById('equipModalGrid');
  grid.innerHTML = '';
  equipData
    .filter(e => e.name.toLowerCase().includes(kw))
    .forEach(e => {
      const div = document.createElement('div'); div.className = 'equip-item';
      const img = document.createElement('img');
      img.src = `images/装备/${e.name}.jpg`;
      img.alt = e.name;
      const btn = document.createElement('button'); btn.textContent = e.name;
      btn.onclick = () => {
        // 存储到卡牌槽的 dataset
        const slot = cardSlots[currentEquipSlot];
        let equips = slot.equips || [];
        if (!equips.includes(e.name)) equips.push(e.name);
        slot.equips = equips;
        closeModal(document.getElementById('equipModal'));
      };
      div.append(img, btn);
      grid.appendChild(div);
    });
}

// 渲染历史阵容
function renderHistory() {
  historyList.innerHTML = '';
  const stored = JSON.parse(localStorage.getItem('lineups')||'[]');
  stored.forEach(entry => {
    const wrapper = document.createElement('div');
    wrapper.className = 'history-entry';
    // 角色
    const rolesWrap = document.createElement('div'); rolesWrap.className='history-roles';
    [0,1].forEach(i=>{
      const img = document.createElement('img');
      img.src = entry.roles[i].image;
      img.alt = entry.roles[i].name;
      rolesWrap.append(img);
    });
    wrapper.append(rolesWrap);
    // 卡牌
    const cardsWrap = document.createElement('div'); cardsWrap.className='history-cards';
    entry.cards.forEach((cEquip, idx)=>{
      const cc = document.createElement('div'); cc.className='card-container';
      const img = document.createElement('img');
      img.src = `images/${cEquip.card.race}/${cEquip.card.star}/${cEquip.card.name}.jpg`;
      img.alt = cEquip.card.name;
      const btn = document.createElement('button');
      btn.className='equip-btn';
      btn.textContent='🔍';
      btn.onclick = ()=>alert('装备：'+(cEquip.equips||[]).join(', '));
      cc.append(img, btn);
      cardsWrap.append(cc);
    });
    wrapper.append(cardsWrap);
    historyList.append(wrapper);
  });
}

// 保存阵容
function saveLineup() {
  const roles = roleSlots.map(slot=>({
    name: slot.querySelector('button').textContent,
    image: slot.querySelector('img').src
  }));
  const cards = cardSlots.map(slot=>({
    card: {
      name: slot.querySelector('button.card-btn').textContent,
      // 这里暂不存 race/star，renderHistory 时再匹配 cardData
      race: '', star: ''
    },
    equips: slot.equips||[]
  }));
  // 填 race/star 方便展示
  cards.forEach(c=>{
    const cd = cardData.find(x=>x.name===c.card.name);
    if(cd){ c.card.race=cd.race; c.card.star=cd.star; }
  });
  const stored = JSON.parse(localStorage.getItem('lineups')||'[]');
  stored.push({roles, cards});
  localStorage.setItem('lineups', JSON.stringify(stored));
  renderHistory();
}

// 事件绑定
document.addEventListener('DOMContentLoaded', () => {
  // 角色槽点击
  roleSlots.forEach((slot,i)=>{
    slot.querySelector('button').onclick = ()=>{
      currentRoleSlot = i;
      openModal('roleModal');
      renderRoles();
    };
  });
  // 卡牌槽点击
  cardSlots.forEach((slot,i)=>{
    slot.querySelector('button.card-btn').onclick = ()=>{
      currentCardSlot = i;
      openModal('cardModal');
      renderCards();
    };
    slot.querySelector('button.equip-btn').onclick = ()=>{
      currentEquipSlot = i;
      openModal('equipModal');
      renderEquips();
    };
  });
  // 关闭弹窗按钮
  document.querySelectorAll('.modal .close-btn')
    .forEach(btn=>{
      btn.onclick = ()=>closeModal(btn.closest('.modal'));
    });
  // 过滤输入
  document.getElementById('filterRoleName').addEventListener('input', renderRoles);
  document.getElementById('filterStar').addEventListener('change', renderCards);
  document.getElementById('filterRace').addEventListener('change', renderCards);
  document.getElementById('filterEquipName').addEventListener('input', renderEquips);
  // 保存按钮
  saveBtn.onclick = saveLineup;
  // 初始渲染历史
  renderHistory();
});
