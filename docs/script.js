// 简易选择器
function $(s){return document.querySelector(s);}
function $all(s){return Array.from(document.querySelectorAll(s));}

let currentRoleSlot, currentCardSlot, currentEquipSlot;
let equipViewMode = false, viewEquipList = [];
const equipSelections = {};

// 打开/关闭弹窗
function openModal(id){$(id).classList.add('show');}
function closeModal(id){$(id).classList.remove('show');}

// 渲染 角色 弹窗
function renderRoleModal(){
  const kw = $('#filterRoleName').value.toLowerCase();
  const grid = $('#roleModalGrid'); grid.innerHTML = '';
  rolesData.filter(r=>!kw||r.name.toLowerCase().includes(kw))
    .forEach(r=>{
      const d = document.createElement('div'); d.className = 'role-item';
      d.innerHTML = `<img src="${r.image}" alt="${r.name}"><p>${r.name}</p><button>选择</button>`;
      d.querySelector('button').onclick = ()=>{
        const slot = document.querySelector(`.role-slot[data-index="${currentRoleSlot}"]`);
        slot.querySelector('img').src = r.image;
        slot.querySelector('button').textContent = r.name;
        closeModal('#roleModal');
      };
      grid.appendChild(d);
    });
}

// 渲染 卡牌 弹窗
function renderCardModal(){
  const star = $('#filterStar').value, race = $('#filterRace').value;
  const grid = $('#cardModalGrid'); grid.innerHTML = '';
  cardData.filter(c=>(!star||c.star===star)&&(!race||c.race===race))
    .forEach(c=>{
      const imgPath = `images/${c.race}/${c.star}/${c.name}.jpg`;
      const d = document.createElement('div'); d.className = 'card-item';
      d.innerHTML = `<img src="${imgPath}" alt="${c.name}"><p>${c.name}</p><button>选择</button>`;
      d.querySelector('button').onclick = ()=>{
        const slot = document.querySelector(`.slot[data-index="${currentCardSlot}"]`);
        slot.querySelector('img').src = imgPath;
        slot.querySelector('.slot-btn').textContent = c.name;
        closeModal('#cardModal');
      };
      grid.appendChild(d);
    });
}

// 渲染 装备 弹窗
function renderEquipModal(){
  const filters = document.querySelector('#equipModal .modal-filters');
  const grid = $('#equipModalGrid');
  const selected = $('#selectedEquips');

  if(equipViewMode){
    filters.style.display = 'none';
    grid.style.display = 'none';
    selected.innerHTML = '';
    (viewEquipList||[]).forEach(name=>{
      const e = equipData.find(x=>x.name===name);
      if(e){
        const img = document.createElement('img');
        img.src = e.image; img.title = e.name; img.className = 'selected-equip';
        selected.appendChild(img);
      }
    });
    return;
  }

  // 选择 模式
  filters.style.display = '';
  grid.style.display = '';
  const kw = $('#filterEquipName').value.toLowerCase();
  const sel = equipSelections[currentEquipSlot] || (equipSelections[currentEquipSlot]=[]);
  // 已选栏
  selected.innerHTML = '';
  sel.forEach(e=>{
    const img = document.createElement('img');
    img.src = e.image; img.title = e.name; img.className = 'selected-equip';
    selected.appendChild(img);
  });
  // 列表
  grid.innerHTML = '';
  equipData.filter(e=>!kw||e.name.toLowerCase().includes(kw))
    .forEach(e=>{
      const chosen = sel.some(x=>x.name===e.name);
      const d = document.createElement('div'); d.className = 'equip-item';
      d.innerHTML = `<img src="${e.image}" alt="${e.name}"><p>${e.name}</p><button>${chosen?'已选':'选择'}</button>`;
      d.querySelector('button').onclick = ()=>{
        if(!chosen) sel.push(e);
        renderEquipModal();
      };
      grid.appendChild(d);
    });
}

// 保存阵容
function saveLineup(){
  const roles = $all('.role-slot').map(s=>s.querySelector('button').textContent);
  const cards = $all('.slot').map(s=>({
    name: s.querySelector('.slot-btn').textContent,
    equips: (equipSelections[s.dataset.index]||[]).map(e=>e.name)
  }));
  localStorage.setItem('lineups', JSON.stringify([{roles,cards}]));
  renderLineups();
  alert('✅ 阵容已保存');
}

// 渲染 历史 阵容
function renderLineups(){
  const display = $('#lineupDisplay'); display.innerHTML = '';
  const records = JSON.parse(localStorage.getItem('lineups')||'[]');
  records.forEach(rec=>{
    const row = document.createElement('div'); row.className = 'history-row';
    // 角色
    rec.roles.forEach(r=>{
      const div = document.createElement('div'); div.className='history-img';
      div.innerHTML = `<img src="images/角色/${r}.jpg" alt="${r}"><p>${r}</p>`;
      row.appendChild(div);
    });
    // 卡牌 + 查看装备
    rec.cards.forEach((c,ci)=>{
      const cd = cardData.find(x=>x.name===c.name)||{};
      const imgPath = cd.race&&cd.star
        ?`images/${cd.race}/${cd.star}/${c.name}.jpg`
        :'images/placeholder.png';
      const div = document.createElement('div'); div.className='history-img';
      div.innerHTML = `
        <img src="${imgPath}" alt="${c.name}">
        <p>${c.name}</p>
        <button class="history-equip-btn">装备</button>
      `;
      // 点击查看历史装备
      div.querySelector('button').onclick = ()=>{
        equipViewMode = true;
        viewEquipList = c.equips;
        openModal('#equipModal');
        renderEquipModal();
      };
      row.appendChild(div);
    });
    display.appendChild(row);
  });
}

// 事件 绑定
document.addEventListener('DOMContentLoaded',()=>{
  // 角色
  $all('.role-btn').forEach(btn=>{
    btn.onclick = ()=>{ currentRoleSlot=btn.dataset.index; openModal('#roleModal'); renderRoleModal(); };
  });
  $('#roleModalClose').onclick = ()=>closeModal('#roleModal');
  $('#filterRoleName').oninput = renderRoleModal;

  // 卡牌
  $all('.slot-btn').forEach(btn=>{
    btn.onclick = ()=>{ currentCardSlot=btn.dataset.index; openModal('#cardModal'); renderCardModal(); };
  });
  $('#cardModalClose').onclick = ()=>closeModal('#cardModal');
  $('#filterStar').onchange = renderCardModal;
  $('#filterRace').onchange = renderCardModal;

  // 装备（主页）
  $all('.equip-btn').forEach(btn=>{
    btn.onclick = ()=>{ currentEquipSlot=btn.dataset.index; equipViewMode=false; openModal('#equipModal'); renderEquipModal(); };
  });
  $('#equipModalClose').onclick = ()=>closeModal('#equipModal');
  $('#filterEquipName').oninput = renderEquipModal;

  // 保存
  $('#saveLineup').onclick = saveLineup;

  // 首次 渲染 历史
  renderLineups();
});
