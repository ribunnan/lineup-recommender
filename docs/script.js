// 简易选择器
function $(s){return document.querySelector(s);}
function $all(s){return Array.from(document.querySelectorAll(s));}

let currentRoleSlot, currentCardSlot, currentEquipSlot;
const equipSelections = {}; // { slotIndex: [equipObj,…] }

// 打开/关闭弹窗
function openModal(id){$(id).classList.add('show');}
function closeModal(id){$(id).classList.remove('show');}

// 渲染角色弹窗
function renderRoleModal(){
  const kw = $('#filterRoleName').value.toLowerCase();
  const grid = $('#roleModalGrid');
  grid.innerHTML = '';
  rolesData
    .filter(r=>!kw||r.name.toLowerCase().includes(kw))
    .forEach(r=>{
      const d=document.createElement('div'); d.className='role-item';
      d.innerHTML=`
        <img src="${r.image}" alt="${r.name}">
        <p>${r.name}</p>
        <button>选择</button>
      `;
      d.querySelector('button').onclick=()=>{
        const slot=$(`.role-slot[data-index="${currentRoleSlot}"]`);
        slot.querySelector('img').src=r.image;
        slot.querySelector('button').textContent=r.name;
        closeModal('#roleModal');
      };
      grid.appendChild(d);
    });
}

// 渲染卡牌弹窗
function renderCardModal(){
  const star=$('#filterStar').value, race=$('#filterRace').value;
  const grid=$('#cardModalGrid');
  grid.innerHTML='';
  cardData
    .filter(c=>(!star||c.star===star)&&(!race||c.race===race))
    .forEach(c=>{
      const imgPath=`images/${c.race}/${c.star}/${c.name}.jpg`;
      const d=document.createElement('div'); d.className='card-item';
      d.innerHTML=`
        <img src="${imgPath}" alt="${c.name}">
        <p>${c.name}</p>
        <button>选择</button>
      `;
      d.querySelector('button').onclick=()=>{
        const slot=$(`.slot[data-index="${currentCardSlot}"]`);
        slot.querySelector('img').src=imgPath;
        slot.querySelector('.slot-btn').textContent=c.name;
        closeModal('#cardModal');
      };
      grid.appendChild(d);
    });
}

// 渲染装备弹窗
function renderEquipModal(){
  const kw=$('#filterEquipName').value.toLowerCase();
  const sel=equipSelections[currentEquipSlot]||(equipSelections[currentEquipSlot]=[]);
  // 已选栏
  const top=$('#selectedEquips'); top.innerHTML='';
  sel.forEach(e=>{
    const img=document.createElement('img');
    img.src=e.image; img.title=e.name; img.className='selected-equip';
    top.appendChild(img);
  });
  // 列表
  const grid=$('#equipModalGrid'); grid.innerHTML='';
  equipData
    .filter(e=>!kw||e.name.toLowerCase().includes(kw))
    .forEach(e=>{
      const chosen=sel.some(x=>x.name===e.name);
      const d=document.createElement('div'); d.className='equip-item';
      d.innerHTML=`
        <img src="${e.image}" alt="${e.name}">
        <p>${e.name}</p>
        <button>${chosen?'已选':'选择'}</button>
      `;
      d.querySelector('button').onclick=()=>{
        if(!chosen) sel.push(e);
        renderEquipModal();
      };
      grid.appendChild(d);
    });
}

// 保存阵容
function saveLineup(){
  const roles=$all('.role-slot').map(s=>s.querySelector('button').textContent);
  const cards=$all('.slot').map(s=>({
    name:s.querySelector('.slot-btn').textContent,
    equips:(equipSelections[s.dataset.index]||[]).map(e=>e.name)
  }));
  // 覆盖写入
  localStorage.setItem('lineups', JSON.stringify([{roles,cards}]));
  renderLineups();
  alert('✅ 阵容已保存');
}

// 渲染历史列表
function renderLineups(){
  const display=$('#lineupDisplay'); display.innerHTML='';
  const records=JSON.parse(localStorage.getItem('lineups')||'[]');
  records.forEach(rec=>{
    const row=document.createElement('div'); row.className='history-row';
    // 角色
    Array.isArray(rec.roles)&&rec.roles.forEach(r=>{
      const div=document.createElement('div'); div.className='history-img';
      div.innerHTML=`<img src="images/角色/${r}.jpg" alt="${r}"><p>${r}</p>`;
      row.appendChild(div);
    });
    // 卡牌
    Array.isArray(rec.cards)&&rec.cards.forEach(c=>{
      const cd=cardData.find(x=>x.name===c.name)||{};
      const imgPath=cd.race&&cd.star
        ?`images/${cd.race}/${cd.star}/${c.name}.jpg`
        :'images/placeholder.png';
      const div=document.createElement('div'); div.className='history-img';
      div.innerHTML=`<img src="${imgPath}" alt="${c.name}"><p>${c.name}</p>`;
      row.appendChild(div);
    });
    display.appendChild(row);
  });
}

// 事件绑定
document.addEventListener('DOMContentLoaded',()=>{
  // 角色
  $all('.role-btn').forEach(btn=>{
    btn.onclick=()=>{ currentRoleSlot=btn.dataset.index; openModal('#roleModal'); renderRoleModal(); };
  });
  $('#roleModalClose').onclick=()=>closeModal('#roleModal');
  $('#filterRoleName').oninput=renderRoleModal;

  // 卡牌
  $all('.slot-btn').forEach(btn=>{
    btn.onclick=()=>{ currentCardSlot=btn.dataset.index; openModal('#cardModal'); renderCardModal(); };
  });
  $('#cardModalClose').onclick=()=>closeModal('#cardModal');
  $('#filterStar').onchange=renderCardModal;
  $('#filterRace').onchange=renderCardModal;

  // 装备
  $all('.equip-btn').forEach(btn=>{
    btn.onclick=()=>{ currentEquipSlot=btn.dataset.index; openModal('#equipModal'); renderEquipModal(); };
  });
  $('#equipModalClose').onclick=()=>closeModal('#equipModal');
  $('#filterEquipName').oninput=renderEquipModal;

  // 保存
  $('#saveLineup').onclick=saveLineup;

  // 首次渲染
  renderLineups();
});
