<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>阵容推荐器</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header>
    <h1>阵容推荐器</h1>
  </header>

  <div class="container">
    <!-- —— 角色选择 —— -->
    <div class="role-selection">
      <h2>选择角色（本局两位）</h2>
      <div class="role-slots" id="roleSlots"></div>
    </div>

    <!-- —— 卡牌选择 —— -->
    <div class="lineup-form">
      <h2>选择卡牌（最多六张）</h2>
      <div class="card-slots" id="cardSlots"></div>
    </div>

    <button id="saveLineup">保存阵容</button>

    <div class="lineup-list">
      <h2>历史阵容一览</h2>
      <div id="lineupDisplay"></div>
    </div>
  </div>

  <!-- —— 角色弹窗 —— -->
  <div id="roleModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>选择角色</h3>
        <button class="close" data-modal="roleModal">&times;</button>
      </div>
      <div class="modal-filters">
        <input type="text" id="filterRoleName" placeholder="输入角色名称关键字" />
      </div>
      <div class="modal-grid" id="roleModalGrid"></div>
    </div>
  </div>

  <!-- —— 卡牌弹窗 —— -->
  <div id="cardModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>选择卡牌</h3>
        <button class="close" data-modal="cardModal">&times;</button>
      </div>
      <div class="modal-filters">
        <select id="filterStar">
          <option value="">全部星级</option>
          <option value="1星">1 星</option>
          <option value="2星">2 星</option>
          <option value="3星">3 星</option>
          <option value="4星">4 星</option>
          <option value="5星">5 星</option>
          <option value="6星">6 星</option>
        </select>
        <select id="filterRace">
          <option value="">全部种族</option>
          <option value="龙">龙</option>
          <option value="中立">中立</option>
          <option value="幽灵">幽灵</option>
          <option value="战士">战士</option>
          <option value="星裔">星裔</option>
          <option value="机械">机械</option>
          <option value="自然">自然</option>
          <option value="野兽">野兽</option>
        </select>
      </div>
      <div class="modal-grid" id="cardModalGrid"></div>
    </div>
  </div>

  <!-- —— 装备弹窗 —— -->
  <div id="equipModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>选择装备</h3>
        <button class="close" data-modal="equipModal">&times;</button>
      </div>
      <!-- 新增：已选择装备展示行 -->
      <div id="equipSelected" class="selected-equip-row"></div>
      <div class="modal-filters">
        <input type="text" id="filterEquipName" placeholder="输入装备名称关键字" />
      </div>
      <div class="modal-grid" id="equipModalGrid"></div>
    </div>
  </div>

  <script src="rolesData.js"></script>
  <script src="cardData.js"></script>
  <script src="equipData.js"></script>
  <script src="script.js"></script>
</body>
</html>
