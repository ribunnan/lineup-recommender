// 当前正在操作的槽位
let currentRoleSlot = null;
let currentCardSlot = null;
let currentEquipCardIndex = null;

// 存储本局选择
const lineupState = {
  roles: [null, null],
  cards: Array(6).fill({ name: null, equips: [] })
};

// 打开/关闭 弹窗
function openModal(modalId) {
  document.getElementById(modalId).classList.add('show');
}
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

// 绑定事件
document.addEventListener('DOMContentLoaded',()=>{
  // 角色按钮
  document.querySelectorAll('.role-btn').forEach(btn=>{
    btn.onclick = ()=>{
      currentRoleSlot = +btn.dataset.index;
      filterAndRenderRoles();
      openModal('roleModal');
    };
  });
  document.getElementById('roleModalClose').onclick = ()=>closeModal('roleModal');
  document.getElementById('filterRoleName').oninput = filterAndRenderRoles;

  // 卡牌按钮
  document.querySelectorAll('.slot-btn').forEach(btn=>{
    btn.onclick = ()=>{
      currentCardSlot = +btn.dataset.index;
      filterAndRenderCards();
      openModal('cardModal');
    };
  });
  document.getElementById('cardModalClose').onclick = ()=>closeModal('cardModal');
  document.getElementById('filterStar').onchange = filterAndRenderCards;
  document.getElementById('filterRace').onchange = filterAndRenderCards;

  // 装备按钮
  document.querySelectorAll('.equip-btn').forEach(btn=>{
    btn.onclick = ()=>{
      currentEquipCardIndex = +btn.dataset.index;
      filterAndRenderEquips();
      openModal('equipModal');
    };
  });
  document.getElementById('equipModalClose').onclick = ()=>closeModal('equipModal');
  document.getElementById('filterEquipName').oninput = filterAndRenderEquips;

  document.getElementById('saveLineup').onclick = saveLineup;
  renderLineups();
});


// —— 渲染 弹窗 列表 —— //
function filterAndRenderRoles(){
  const kw = document.getElementById('filterRoleName').value.trim().toLowerCase();
  const grid = document.getElementById('roleModalGrid');
  grid.innerHTML = '';
  rolesData
    .filter(r=>r.name.toLowerCase().includes(kw))
    .forEach(r=>{
      const div = document.createElement('div');
      div.className = 'modal-item';
      const img = new Image(); img.src = r.image; img.alt=r.name;
      const p = document.createElement('p'); p.textContent=r.name;
      const btn = document.createElement('button'); btn.textContent='选择';
      btn.onclick = ()=>{
        lineupState.roles[currentRoleSlot] = r.name;
        document.querySelector(`.role-slot[data-index="${currentRoleSlot}"] img`).src = r.image;
        document.querySelector(`.role-btn[data-index="${currentRoleSlot}"]`).textContent = r.name;
        closeModal('roleModal');
      };
      div.append(img,p,btn);
      grid.appendChild(div);
    });
}

function filterAndRenderCards(){
  const star = document.getElementById('filterStar').value;
  const race = document.getElementById('filterRace').value;
  const grid = document.getElementById('cardModalGrid');
  grid.innerHTML = '';
  cardData
    .filter(c=>(!star||c.star===star)&&(!race||c.race===race))
    .forEach(c=>{
      const div = document.createElement('div');
      div.className='modal-item';
      const img=new Image(); img.src=`images/${c.race}/${c.star}/${c.name}.jpg`; img.alt=c.name;
      const p=document.createElement('p'); p.textContent=c.name;
      const btn=document.createElement('button'); btn.textContent='选择';
      btn.onclick=()=>{
        lineupState.cards[currentCardSlot] = { name:c.name, equips: [] };
        document.querySelector(`.slot[data-index="${currentCardSlot}"] img`).src = img.src;
        document.querySelector(`.slot-btn[data-index="${currentCardSlot}"]`).textContent=c.name;
        closeModal('cardModal');
      };
      div.append(img,p,btn);
      grid.appendChild(div);
    });
}

function filterAndRenderEquips(){
  const kw = document.getElementById('filterEquipName').value.trim().toLowerCase();
  const grid = document.getElementById('equipModalGrid');
  const sel = document.getElementById('selectedEquips');
  grid.innerHTML = ''; sel.innerHTML = '';
  // 先渲染已选装备
  lineupState.cards[currentEquipCardIndex].equips.forEach(name=>{
    const data = equipData.find(e=>e.name===name);
    const chip = document.createElement('div'); chip.className='equip-chip';
    const img=new Image(); img.src=data.image; img.alt=name;
    const span=document.createElement('span'); span.textContent=name;
    chip.append(img,span);
    sel.appendChild(chip);
  });
  // 渲染可选装备
  equipData
    .filter(e=>e.name.toLowerCase().includes(kw))
    .forEach(e=>{
      const div=document.createElement('div'); div.className='modal-item';
      const img=new Image(); img.src=e.image; img.alt=e.name;
      const p=document.createElement('p'); p.textContent=e.name;
      const btn=document.createElement('button'); btn.textContent='添加';
      btn.onclick=()=>{
        lineupState.cards[currentEquipCardIndex].equips.push(e.name);
        filterAndRenderEquips(); // 重新渲染
      };
      div.append(img,p,btn);
      grid.appendChild(div);
    });
}


// —— 保存 & 渲染历史 —— //
function saveLineup(){
  const stored = JSON.parse(localStorage.getItem('lineups')||'[]');
  // 深拷贝当前状态
  stored.push(JSON.parse(JSON.stringify(lineupState)));
  localStorage.setItem('lineups',JSON.stringify(stored));
  renderLineups();
}

function renderLineups(){
  const display = document.getElementById('lineupDisplay');
  display.innerHTML = '';
  const stored = JSON.parse(localStorage.getItem('lineups')||'[]');
  stored.forEach((entry, idx)=>{
    const row = document.createElement('div'); row.className='lineup-entry';
    // 角色
    entry.roles.forEach(name=>{
      const data = rolesData.find(r=>r.name===name);
      const div=document.createElement('div'); div.className='entry-role';
      const img=new Image(); img.src = data.image; img.alt=name;
      const p=document.createElement('p'); p.textContent=name;
      div.append(img,p);
      row.append(div);
    });
    // 卡牌
    entry.cards.forEach((c,ci)=>{
      const card = cardData.find(cd=>cd.name===c.name);
      const div=document.createElement('div'); div.className='entry-card';
      const container=document.createElement('div'); container.style.position='relative';
      const img=new Image(); img.src=`images/${card.race}/${card.star}/${card.name}.jpg`;
      img.alt=card.name;
      const btn=document.createElement('button'); 
      btn.className='equip-icon'; 
      btn.textContent='⚙';
      btn.onclick=()=>{
        // 查看该套历史装备
        currentEquipCardIndex = ci;
        lineupState.cards = entry.cards; // 临时加载
        filterAndRenderEquips();
        openModal('equipModal');
      };
      container.append(img,btn);
      const p=document.createElement('p'); p.textContent=card.name;
      div.append(container,p);
      row.append(div);
    });
    display.append(row);
  });
}
