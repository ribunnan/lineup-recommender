// 全局状态
let currentRoleSlot = null;
let currentCardSlot = null;
let currentEquipSlot = null;
const equipSelections = {}; // { slotIndex: [equipObj,…] }

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

// 打开 / 关闭通用
function openModal(id){ $(id).classList.add('show'); }
function closeModal(id){ $(id).classList.remove('show'); }

// 渲染角色弹窗
function renderRoleModal(){
  const kw = $('#filterRoleName').value.trim().toLowerCase();
  const grid = $('#roleModalGrid');
  grid.innerHTML = '';
  rolesData
    .filter(r=>!kw||r.name.toLowerCase().includes(kw))
    .forEach(r=>{
      const d = document.createElement('div'); d.className='role-item';
      const img = `<img src="${r.image}" alt="${r.name}">`;
      d.innerHTML = `${img}<p>${r.name}</p><button>选 择</button>`;
      d.querySelector('button').onclick = ()=>{
        const slot = document.querySelector(`.role-slot[data-index="${currentRoleSlot}"]`);
        slot.querySelector('img').src = r.image; slot.querySelector('button').textContent = r.name;
        closeModal('#roleModal');
      };
      grid.appendChild(d);
    });
}

// 渲染卡牌弹窗
function renderCardModal(){
  const star = $('#filterStar').value;
  const race = $('#filterRace').value;
  const grid = $('#cardModalGrid'); grid.innerHTML='';
  cardData
    .filter(c=>(!star||c.star===star)&&(!race||c.race===race))
    .forEach(c=>{
      const imgPath = `images/${c.race}/${c.star}/${c.name}.jpg`;
      const d = document.createElement('div'); d.className='card-item';
      d.innerHTML = `<img src="${imgPath}" alt="${c.name}"><p>${c.name}</p><button>选 择</button>`;
      d.querySelector('button').onclick = ()=>{
        const slot = document.querySelector(`.slot[data-index="${currentCardSlot}"]`);
        slot.querySelector('img').src = imgPath; slot.querySelector('.slot-btn').textContent = c.name;
        closeModal('#cardModal');
      };
      grid.appendChild(d);
    });
}

// 渲染装备弹窗
function renderEquipModal(){
  const kw = $('#filterEquipName').value.trim().toLowerCase();
  const sel = equipSelections[currentEquipSlot] = equipSelections[currentEquipSlot]||[];
  const grid = $('#equipModalGrid'); grid.innerHTML='';
  // 顶部已选
  const top = $('#selectedEquips'); top.innerHTML='';
  sel.forEach(e=>{
    const img=document.createElement('img'); img.src=e.image; img.title=e.name;
    top.appendChild(img);
  });
  // 列表
  equipData
    .filter(e=>(!kw||e.name.toLowerCase().includes(kw)))
    .forEach(e=>{
      const isChosen = sel.find(x=>x.name===e.name);
      const d = document.createElement('div'); d.className='equip-item';
      d.innerHTML = `<img src="${e.image}" alt="${e.name}"><p>${e.name}</p><button>${isChosen?'已选':'选 择'}</button>`;
      d.querySelector('button').onclick = ()=>{
        if(!isChosen) sel.push(e);
        renderEquipModal();
      };
      grid.appendChild(d);
    });
}

// 保存阵容
function saveLineup(){
  const records = JSON.parse(localStorage.getItem('lineups')||'[]');
  // 收集：角色1,角色2,6张卡,每张卡装备列表
  const roles = $all('.role-slot').map(s=>s.querySelector('button').textContent);
  const cards = $all('.slot').map(s=>({
    name:s.querySelector('.slot-btn').textContent,
    equips: (equipSelections[s.dataset.index]||[]).map(e=>e.name)
  }));
  records.push({ roles, cards });
  localStorage.setItem('lineups', JSON.stringify(records));
  renderLineups();
}

// 渲染历史
function renderLineups(){
  const disp = $('#lineupDisplay'); disp.innerHTML='';
  const records = JSON.parse(localStorage.getItem('lineups')||'[]');
  records.forEach((rec,i)=>{
    const row = document.createElement('div'); row.className='history-row';
    // 角色
    rec.roles.forEach(r=>{
      row.innerHTML += `<div class="history-img"><img src="images/角色/${r}.jpg"><p>${r}</p></div>`;
    });
    // 卡牌
    rec.cards.forEach(c=>{
      row.innerHTML += `<div class="history-img"><img src="images/${cardData.find(x=>x.name===c.name).race}/${cardData.find(x=>x.name===c.name).star}/${c.name}.jpg"><p>${c.name}</p></div>`;
      // 装备图标右下
      const eqs = c.equips.map(e=>`<img class="history-equip" src="images/装备/${e}.jpg" title="${e}">`).join('');
      row.innerHTML += eqs;
    });
    disp.appendChild(row);
  });
}

// 初始化事件绑定
document.addEventListener('DOMContentLoaded',()=>{
  // 角色
  $all('.role-btn').forEach(btn=>{
    btn.onclick=()=>{ currentRoleSlot=btn.dataset.index; openModal('#roleModal'); renderRoleModal(); };
  });
  $('#roleModalClose').onclick=()=>closeModal('#roleModal');
  $('#filterRoleName').addEventListener('input', renderRoleModal);

  // 卡牌
  $all('.slot-btn').forEach(btn=>{
    btn.onclick=()=>{ currentCardSlot=btn.dataset.index; openModal('#cardModal'); renderCardModal(); };
  });
  $('#cardModalClose').onclick=()=>closeModal('#cardModal');
  $('#filterStar').addEventListener('change', renderCardModal);
  $('#filterRace').addEventListener('change', renderCardModal);

  // 装备
  $all('.equip-btn').forEach(btn=>{
    btn.onclick=()=>{ currentEquipSlot=btn.dataset.index; openModal('#equipModal'); renderEquipModal(); };
  });
  $('#equipModalClose').onclick=()=>closeModal('#equipModal');
  $('#filterEquipName').addEventListener('input', renderEquipModal);

  // 保存 & 历史
  $('#saveLineup').onclick = saveLineup;
  renderLineups();
});
