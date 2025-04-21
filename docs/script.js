// script.js

// 简易 DOM 查询
function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

let currentRoleSlot = null;
let currentCardSlot = null;
let currentEquipSlot = null;
const equipSelections = {}; // { slotIndex: [equipObj,…] }

// 打开/关闭弹窗
function openModal(id) { $(id).classList.add('show'); }
function closeModal(id) { $(id).classList.remove('show'); }

// 渲染——角色弹窗
function renderRoleModal() {
  const kw = $('#filterRoleName').value.trim().toLowerCase();
  const grid = $('#roleModalGrid');
  grid.innerHTML = '';
  rolesData
    .filter(r => !kw || r.name.toLowerCase().includes(kw))
    .forEach(r => {
      const d = document.createElement('div');
      d.className = 'role-item';
      d.innerHTML = `
        <img src="${r.image}" alt="${r.name}">
        <p>${r.name}</p>
        <button>选择</button>
      `;
      d.querySelector('button').onclick = () => {
        const slot = document.querySelector(`.role-slot[data-index="${currentRoleSlot}"]`);
        slot.querySelector('img').src = r.image;
        slot.querySelector('button').textContent = r.name;
        closeModal('#roleModal');
      };
      grid.appendChild(d);
    });
}

// 渲染——卡牌弹窗
function renderCardModal() {
  const star = $('#filterStar').value;
  const race = $('#filterRace').value;
  const grid = $('#cardModalGrid');
  grid.innerHTML = '';
  cardData
    .filter(c => (!star || c.star === star) && (!race || c.race === race))
    .forEach(c => {
      const imgPath = `images/${c.race}/${c.star}/${c.name}.jpg`;
      const d = document.createElement('div');
      d.className = 'card-item';
      d.innerHTML = `
        <img src="${imgPath}" alt="${c.name}">
        <p>${c.name}</p>
        <button>选择</button>
      `;
      d.querySelector('button').onclick = () => {
        const slot = document.querySelector(`.slot[data-index="${currentCardSlot}"]`);
        slot.querySelector('img').src = imgPath;
        slot.querySelector('.slot-btn').textContent = c.name;
        closeModal('#cardModal');
      };
      grid.appendChild(d);
    });
}

// 渲染——装备弹窗
function renderEquipModal() {
  const kw = $('#filterEquipName').value.trim().toLowerCase();
  const sel = equipSelections[currentEquipSlot] = equipSelections[currentEquipSlot] || [];
  const top = $('#selectedEquips');
  top.innerHTML = '';
  sel.forEach(e => {
    const img = document.createElement('img');
    img.src = e.image;
    img.title = e.name;
    img.className = 'selected-equip';
    top.appendChild(img);
  });

  const grid = $('#equipModalGrid');
  grid.innerHTML = '';
  equipData
    .filter(e => !kw || e.name.toLowerCase().includes(kw))
    .forEach(e => {
      const chosen = sel.some(x => x.name === e.name);
      const d = document.createElement('div');
      d.className = 'equip-item';
      d.innerHTML = `
        <img src="${e.image}" alt="${e.name}">
        <p>${e.name}</p>
        <button>${chosen ? '已选' : '选择'}</button>
      `;
      d.querySelector('button').onclick = () => {
        if (!chosen) sel.push(e);
        renderEquipModal();
      };
      grid.appendChild(d);
    });
}

// 保存阵容
function saveLineup() {
  console.log('▶ saveLineup 被调用');
  // 将旧数据全部替换为新结构
  const records = [];
  const roles = $all('.role-slot').map(s => s.querySelector('button').textContent);
  const cards = $all('.slot').map(s => ({
    name: s.querySelector('.slot-btn').textContent,
    equips: (equipSelections[s.dataset.index] || []).map(e => e.name)
  }));
  records.push({ roles, cards });
  localStorage.setItem('lineups', JSON.stringify(records));
  renderLineups();
  alert('✅ 阵容已保存');
}

// 渲染历史
function renderLineups() {
  const display = $('#lineupDisplay');
  display.innerHTML = '';
  const records = JSON.parse(localStorage.getItem('lineups') || '[]');
  records.forEach((rec, i) => {
    const row = document.createElement('div');
    row.className = 'history-row';
    // 角色
    if (Array.isArray(rec.roles)) {
      rec.roles.forEach(r => {
        row.innerHTML += `
          <div class="history-img">
            <img src="images/角色/${r}.jpg" alt="${r}">
            <p>${r}</p>
          </div>`;
      });
    }
    // 卡牌 + 装备
    if (Array.isArray(rec.cards)) {
      rec.cards.forEach(c => {
        // 找到卡牌的路径
        const cd = cardData.find(x => x.name === c.name) || {};
        const imgPath = cd.race && cd.star
          ? `images/${cd.race}/${cd.star}/${c.name}.jpg`
          : 'images/placeholder.png';
        row.innerHTML += `
          <div class="history-img">
            <img src="${imgPath}" alt="${c.name}">
            <p>${c.name}</p>`;
        (c.equips || []).forEach(eq => {
          row.innerHTML += `<img class="history-equip" src="images/装备/${eq}.jpg" title="${eq}">`;
        });
        row.innerHTML += `</div>`;
      });
    }
    display.appendChild(row);
  });
}

// 事件绑定
document.addEventListener('DOMContentLoaded', () => {
  // 角色
  $all('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentRoleSlot = btn.dataset.index;
      openModal('#roleModal');
      renderRoleModal();
    });
  });
  $('#roleModalClose').addEventListener('click', () => closeModal('#roleModal'));
  $('#filterRoleName').addEventListener('input', renderRoleModal);

  // 卡牌
  $all('.slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCardSlot = btn.dataset.index;
      openModal('#cardModal');
      renderCardModal();
    });
  });
  $('#cardModalClose').addEventListener('click', () => closeModal('#cardModal'));
  $('#filterStar').addEventListener('change', renderCardModal);
  $('#filterRace').addEventListener('change', renderCardModal);

  // 装备
  $all('.equip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentEquipSlot = btn.dataset.index;
      openModal('#equipModal');
      renderEquipModal();
    });
  });
  $('#equipModalClose').addEventListener('click', () => closeModal('#equipModal'));
  $('#filterEquipName').addEventListener('input', renderEquipModal);

  // 保存
  $('#saveLineup').addEventListener('click', saveLineup);

  // 首次渲染
  renderLineups();
});
