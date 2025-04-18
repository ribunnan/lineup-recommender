let currentRoleSlot=0, currentCardSlot=0, currentEquipSlot=0;
const equipmentSelections={};

// 打开/关闭弹窗
function openModal(id){document.getElementById(id).classList.add('show')}
function closeModal(id){document.getElementById(id).classList.remove('show')}

// —— 角色弹窗 —— 
function openRoleModal(i){
  currentRoleSlot=i; renderRoleGrid(); openModal('roleModal');
}
function closeRoleModal(){closeModal('roleModal')}
function renderRoleGrid(){
  const kw=document.getElementById('filterRoleName').value.trim().toLowerCase();
  const grid=document.getElementById('roleModalGrid'); grid.innerHTML='';
  rolesData.filter(r=>!kw||r.name.toLowerCase().includes(kw))
    .forEach(r=>{
      const d=document.createElement('div'); d.className='card-item';
      const img=document.createElement('img'); img.src=r.image; img.alt=r.name;
      const p=document.createElement('p'); p.textContent=r.name;
      const btn=document.createElement('button'); btn.textContent='选择';
      btn.onclick=()=>{
        const s=document.querySelector(`.role-slot[data-index="${currentRoleSlot}"]`);
        s.querySelector('img').src=r.image;
        s.querySelector('.role-btn').textContent=r.name;
        closeRoleModal();
      };
      d.append(img,p,btn); grid.appendChild(d);
    });
}

// —— 卡牌弹窗 —— 
function openCardModal(i){
  currentCardSlot=i; renderCardGrid(); openModal('cardModal');
}
function closeCardModal(){closeModal('cardModal')}
function renderCardGrid(){
  const star=document.getElementById('filterStar').value;
  const race=document.getElementById('filterRace').value;
  const grid=document.getElementById('cardModalGrid'); grid.innerHTML='';
  cardData.filter(c=>(!star||c.star===star)&&(!race||c.race===race))
    .forEach(c=>{
      const d=document.createElement('div'); d.className='card-item';
      const img=document.createElement('img');
      img.src=`images/${c.race}/${c.star}/${c.name}.jpg`; img.alt=c.name;
      const p=document.createElement('p'); p.textContent=c.name;
      const btn=document.createElement('button'); btn.textContent='选择';
      btn.onclick=()=>{
        const s=document.querySelector(`.slot[data-index="${currentCardSlot}"]`);
        s.querySelector('img').src=img.src; s.querySelector('.slot-btn').textContent=c.name;
        equipmentSelections[currentCardSlot]=[]; s.querySelector('.equip-list').innerHTML='';
        closeCardModal();
      };
      d.append(img,p,btn); grid.appendChild(d);
    });
}

// —— 装备弹窗 —— 
function openEquipModal(i){
  currentEquipSlot=i; renderEquipGrid(); openModal('equipModal');
}
function closeEquipModal(){closeModal('equipModal')}
function renderEquipGrid(){
  const grid=document.getElementById('equipModalGrid'); grid.innerHTML='';
  equipData.forEach(e=>{
    const d=document.createElement('div'); d.className='equip-item';
    const img=document.createElement('img'); img.src=e.image; img.alt=e.name;
    const p=document.createElement('p'); p.textContent=e.name;
    const btn=document.createElement('button'); btn.textContent='添加';
    btn.onclick=()=>{
      const s=document.querySelector(`.slot[data-index="${currentEquipSlot}"]`);
      if(!equipmentSelections[currentEquipSlot])equipmentSelections[currentEquipSlot]=[];
      if(!equipmentSelections[currentEquipSlot].some(x=>x.name===e.name)){
        equipmentSelections[currentEquipSlot].push(e);
        const li=document.createElement('div'); li.className='equip-item';
        const ei=document.createElement('img'); ei.src=e.image;
        li.appendChild(ei); s.querySelector('.equip-list').appendChild(li);
      }
    };
    d.append(img,p,btn); grid.appendChild(d);
  });
}

// —— 保存 & 渲染历史阵容 —— 
function saveLineup(){
  const roles=Array.from(document.querySelectorAll('.role-slot'))
    .map(s=>s.querySelector('.role-btn').textContent);
  const cards=Array.from(document.querySelectorAll('.slot'))
    .map(s=>s.querySelector('.slot-btn').textContent);
  const equips=[0,1,2,3,4,5].map(i=>
    (equipmentSelections[i]||[]).map(e=>e.name).join(',')
  );
  const all=JSON.parse(localStorage.getItem('lineups')||'[]');
  all.push({roles,cards,equips});
  localStorage.setItem('lineups',JSON.stringify(all));
  renderLineups();
}
function renderLineups(){
  const d=document.getElementById('lineupDisplay'); d.innerHTML='';
  JSON.parse(localStorage.getItem('lineups')||'[]')
    .forEach((it,i)=>{
      const div=document.createElement('div'); div.className='lineup-item';
      div.textContent=`#${i+1} 角色【${it.roles.join(' + ')}】 卡牌【${it.cards.join(' + ')}】 装备【${it.equips.join(' | ')}】`;
      d.appendChild(div);
    });
}

// —— 事件绑定 —— 
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.role-btn').forEach(b=>b.addEventListener('click',()=>openRoleModal(b.dataset.index)));
  document.getElementById('roleModalClose').addEventListener('click',closeRoleModal);
  document.getElementById('filterRoleName').addEventListener('input',renderRoleGrid);

  document.querySelectorAll('.slot-btn').forEach(b=>b.addEventListener('click',()=>openCardModal(b.dataset.index)));
  document.getElementById('cardModalClose').addEventListener('click',closeCardModal);
  document.getElementById('filterStar').addEventListener('change',renderCardGrid);
  document.getElementById('filterRace').addEventListener('change',renderCardGrid);

  document.querySelectorAll('.equip-btn').forEach(b=>b.addEventListener('click',()=>openEquipModal(b.dataset.index)));
  document.getElementById('equipModalClose').addEventListener('click',closeEquipModal);

  document.getElementById('saveLineup').addEventListener('click',saveLineup);
  renderLineups();
});
