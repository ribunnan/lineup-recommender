// 数据容器
const roleSlots = Array.from(document.querySelectorAll('.role-slot'));
const cardSlots = Array.from(document.querySelectorAll('.card-slot'));
const saveBtn   = document.getElementById('saveLineup');
const historyList = document.getElementById('historyList');

let currentRoleSlot = null;
let currentCardSlot = null;
let currentEquipSlot = null;

// 打开/关闭 弹窗
function openModal(id){ document.getElementById(id).classList.add('show'); }
function closeModal(el){ el.classList.remove('show'); }

// 渲染角色列表
function renderRoles(){
  const kw = document.getElementById('filterRoleName').value.trim().toLowerCase();
  const grid = document.getElementById('roleModalGrid');
  grid.innerHTML = '';
  rolesData
    .filter(r=>r.name.toLowerCase().includes(kw))
    .forEach(r=>{
      const div = document.createElement('div'); div.className='role-item';
      const img = document.createElement('img'); img.src=r.image; img.alt=r.name;
      const btn = document.createElement('button'); btn.textContent=r.name;
      btn.onclick = ()=>{
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

// 渲染卡牌列表
function renderCards(){
  const star = document.getElementById('filterStar').value;
  const race = document.getElementById('filterRace').value;
  const grid = document.getElementById('cardModalGrid');
  grid.innerHTML = '';
  cardData
    .filter(c=>(!star||c.star===star)&&(!race||c.race===race))
    .forEach(c=>{
      const div = document.createElement('div'); div.className='card-item';
      const img = document.createElement('img');
      img.src=`images/${c.race}/${c.star}/${c.name}.jpg`;
      img.alt=c.name;
      const btn= document.createElement('button'); btn.textContent=c.name;
      btn.onclick = ()=>{
        const slot = cardSlots[currentCardSlot];
        slot.querySelector('img').src=img.src;
        slot.querySelector('button.card-btn').textContent=c.name;
        closeModal(document.getElementById('cardModal'));
      };
      div.append(img, btn);
      grid.appendChild(div);
    });
}

// 渲染装备列表
function renderEquips(){
  const kw = document.getElementById('filterEquipName').value.trim().toLowerCase();
  const grid = document.getElementById('equipModalGrid');
  grid.innerHTML = '';
  equipData
    .filter(e=>e.name.toLowerCase().includes(kw))
    .forEach(e=>{
      const div = document.createElement('div'); div.className='equip-item';
      const img = document.createElement('img');
      img.src=`images/装备/${e.name}.jpg`;
      img.alt=e.name;
      const btn= document.createElement('button'); btn.textContent=e.name;
      btn.onclick = ()=>{
        const slot = cardSlots[currentEquipSlot];
        slot.equips = slot.equips||[];
        if(!slot.equips.includes(e.name)) slot.equips.push(e.name);
        closeModal(document.getElementById('equipModal'));
      };
      div.append(img, btn);
      grid.appendChild(div);
    });
}

// 渲染历史阵容
function renderHistory(){
  historyList.innerHTML='';
  const stored = JSON.parse(localStorage.getItem('lineups')||'[]');
  stored.forEach(entry=>{
    const wrap = document.createElement('div'); wrap.className='history-entry';
    // 角色
    const rolesWrap = document.createElement('div'); rolesWrap.className='history-roles';
    entry.roles.forEach(r=>{
      const img = document.createElement('img');
      img.src=r.image; img.alt=r.name;
      rolesWrap.appendChild(img);
    });
    wrap.appendChild(rolesWrap);
    // 卡牌
    const cardsWrap = document.createElement('div'); cardsWrap.className='history-cards';
    entry.cards.forEach(c=>{
      const cc = document.createElement('div'); cc.className='card-container';
      const img = document.createElement('img');
      img.src=`images/${c.card.race}/${c.card.star}/${c.card.name}.jpg`;
      img.alt=c.card.name;
      const btn= document.createElement('button'); btn.className='equip-btn'; btn.textContent='🔍';
      btn.onclick = ()=>alert('装备：'+(c.equips||[]).join(', '));
      cc.append(img, btn);
      cardsWrap.append(cc);
    });
    wrap.appendChild(cardsWrap);
    historyList.appendChild(wrap);
  });
}

// 保存当前阵容
function saveLineup(){
  const roles = roleSlots.map(slot=>({
    name: slot.querySelector('button').textContent,
    image: slot.querySelector('img').src
  }));
  const cards = cardSlots.map(slot=>{
    const name = slot.querySelector('button.card-btn').textContent;
    return {
      card: Object.assign({}, cardData.find(c=>c.name===name)||{name, race:'', star:''}),
      equips: slot.equips||[]
    };
  });
  const stored = JSON.parse(localStorage.getItem('lineups')||'[]');
  stored.push({roles,cards});
  localStorage.setItem('lineups', JSON.stringify(stored));
  renderHistory();
}

// 绑定事件
document.addEventListener('DOMContentLoaded',()=>{
  roleSlots.forEach((slot,i)=>{
    slot.querySelector('button.role-btn').onclick=()=>{
      currentRoleSlot=i; openModal('roleModal'); renderRoles();
    };
  });
  cardSlots.forEach((slot,i)=>{
    slot.querySelector('button.card-btn').onclick=()=>{
      currentCardSlot=i; openModal('cardModal'); renderCards();
    };
    slot.querySelector('button.equip-btn').onclick=()=>{
      currentEquipSlot=i; openModal('equipModal'); renderEquips();
    };
  });
  document.querySelectorAll('.modal .close-btn').forEach(btn=>{
    btn.onclick=()=>closeModal(btn.closest('.modal'));
  });
  document.getElementById('filterRoleName').oninput=renderRoles;
  document.getElementById('filterStar').onchange=renderCards;
  document.getElementById('filterRace').onchange=renderCards;
  document.getElementById('filterEquipName').oninput=renderEquips;
  saveBtn.onclick=saveLineup;
  renderHistory();
});
