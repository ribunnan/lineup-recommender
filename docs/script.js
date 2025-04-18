// script.js

// ------- 全局数据引用 --------
 // cardData.js 中的卡牌列表
// const cardData = [ ... ];
 // rolesData.js 中的角色列表
// const rolesData = [ ... ];

let currentSlotIndex = null;
let currentType = ""; // "role" or "card"

// 打开模态框
function openModal(type, slotIndex) {
  currentType = type;
  currentSlotIndex = Number(slotIndex);
  const modal = document.getElementById(type + "Modal");
  modal.classList.add("show");
  if (type === "role") {
    renderRoleGrid();
  } else {
    renderCardGrid();
  }
}

// 关闭模态框
function closeModal(type) {
  document.getElementById(type + "Modal").classList.remove("show");
}

// 渲染角色弹窗
function renderRoleGrid() {
  const kw = document.getElementById("filterRoleName").value.trim().toLowerCase();
  const grid = document.getElementById("roleModalGrid");
  grid.innerHTML = "";
  // 一行 3 列，通过 CSS grid-template-columns 控制
  rolesData
    .filter(r => !kw || r.name.toLowerCase().includes(kw))
    .forEach(r => {
      const div = document.createElement("div");
      div.className = "card-item";
      const img = document.createElement("img");
      img.src = r.image;
      img.alt = r.name;
      const p = document.createElement("p");
      p.textContent = r.name;
      const btn = document.createElement("button");
      btn.textContent = "选择";
      btn.addEventListener("click", () => {
        selectRole(r);
      });
      div.append(img, p, btn);
      grid.appendChild(div);
    });
}

// 渲染卡牌弹窗
function renderCardGrid() {
  const star = document.getElementById("filterStar").value;
  const race = document.getElementById("filterRace").value;
  const grid = document.getElementById("cardModalGrid");
  grid.innerHTML = "";
  cardData
    .filter(c => (!star || c.star === star) && (!race || c.race === race))
    .forEach(c => {
      const div = document.createElement("div");
      div.className = "card-item";
      const img = document.createElement("img");
      img.src = `images/${c.race}/${c.star}/${c.name}.jpg`;
      img.alt = c.name;
      const p = document.createElement("p");
      p.textContent = c.name;
      const btn = document.createElement("button");
      btn.textContent = "选择";
      btn.addEventListener("click", () => {
        selectCard(c);
      });
      div.append(img, p, btn);
      grid.appendChild(div);
    });
}

// 选中角色
function selectRole(role) {
  const slot = document.querySelector(`.role-slot[data-index="${currentSlotIndex}"]`);
  slot.querySelector("img").src = role.image;
  slot.querySelector("img").alt = role.name;
  slot.querySelector(".role-btn").textContent = role.name;
  closeModal("role");
}

// 选中卡牌
function selectCard(card) {
  const slot = document.querySelector(`.slot[data-index="${currentSlotIndex}"]`);
  slot.querySelector("img").src = `images/${card.race}/${card.star}/${card.name}.jpg`;
  slot.querySelector("img").alt = card.name;
  slot.querySelector(".slot-btn").textContent = card.name;
  closeModal("card");
}

// 保存阵容
function saveLineup() {
  const roles = Array.from(document.querySelectorAll(".role-slot")).map(s => s.querySelector(".role-btn").textContent);
  const cards = Array.from(document.querySelectorAll(".slot")).map(s => s.querySelector(".slot-btn").textContent);
  const lineup = { roles, cards };
  const stored = JSON.parse(localStorage.getItem("lineups") || "[]");
  stored.push(lineup);
  localStorage.setItem("lineups", JSON.stringify(stored));
  renderLineups();
}

// 渲染历史阵容
function renderLineups() {
  const display = document.getElementById("lineupDisplay");
  display.innerHTML = "";
  const stored = JSON.parse(localStorage.getItem("lineups") || "[]");
  stored.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "lineup-item";
    div.textContent = `#${i + 1}：角色[${item.roles.join(", ")}]  卡牌[${item.cards.join(", ")}]`;
    display.appendChild(div);
  });
}

// 绑定事件
document.addEventListener("DOMContentLoaded", () => {
  // 角色按钮
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => openModal("role", btn.dataset.index));
  });
  document.getElementById("roleModalClose").addEventListener("click", () => closeModal("role"));
  document.getElementById("filterRoleName").addEventListener("input", renderRoleGrid);

  // 卡牌按钮
  document.querySelectorAll(".slot-btn").forEach(btn => {
    btn.addEventListener("click", () => openModal("card", btn.dataset.index));
  });
  document.getElementById("cardModalClose").addEventListener("click", () => closeModal("card"));
  document.getElementById("filterStar").addEventListener("change", renderCardGrid);
  document.getElementById("filterRace").addEventListener("change", renderCardGrid);

  // 保存
  document.getElementById("saveLineup").addEventListener("click", saveLineup);

  renderLineups();
});
