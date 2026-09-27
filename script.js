// ============================================================
// ニワラバトル v5.2 - 重複制限 / 性格補正表示 / Champions天候・トリックルーム修正 / フォルムログ
// ============================================================

const STORAGE_KEY = "niwaraBattleTeamV5";
const LEGACY_STORAGE_KEY = "niwaraBattleTeamV4";

// ============================================================
// DOM
// ============================================================
const builderScreen = document.getElementById("builder-screen");
const selectionScreen = document.getElementById("selection-screen");
const battleScreen = document.getElementById("battle-screen");
const goBuilderButton = document.getElementById("go-builder-button");
const resetAllButton = document.getElementById("reset-all-button");
const dataCounts = document.getElementById("data-counts");
const randomTeamButton = document.getElementById("random-team-button");

const builderSlots = document.getElementById("builder-slots");
const builderMessage = document.getElementById("builder-message");
const recommendedButton = document.getElementById("recommended-button");
const saveTeamButton = document.getElementById("save-team-button");
const toSelectionButton = document.getElementById("to-selection-button");

const enemyPreview = document.getElementById("enemy-preview");
const playerPreview = document.getElementById("player-preview");
const selectionCount = document.getElementById("selection-count");
const clearSelectionButton = document.getElementById("clear-selection-button");
const startBattleButton = document.getElementById("start-battle-button");
const backToBuilderButton = document.getElementById("back-to-builder-button");
const rerollEnemyButton = document.getElementById("reroll-enemy-button");

const weatherText = document.getElementById("weather-text");
const turnText = document.getElementById("turn-text");
const roomText = document.getElementById("room-text");
const tailwindText = document.getElementById("tailwind-text");
const forfeitButton = document.getElementById("forfeit-button");

const playerNameText = document.getElementById("player-name");
const playerTypeText = document.getElementById("player-type");
const playerHPText = document.getElementById("player-hp");
const playerHPFill = document.getElementById("player-hp-fill");
const playerStagesText = document.getElementById("player-stages");
const playerStatusText = document.getElementById("player-status");
const playerAbilityText = document.getElementById("player-ability");
const playerItemText = document.getElementById("player-item");
const playerNatureText = document.getElementById("player-nature");

const opponentNameText = document.getElementById("opponent-name");
const opponentTypeText = document.getElementById("opponent-type");
const opponentHPText = document.getElementById("opponent-hp");
const opponentHPFill = document.getElementById("opponent-hp-fill");
const opponentStagesText = document.getElementById("opponent-stages");
const opponentStatusText = document.getElementById("opponent-status");
const opponentAbilityText = document.getElementById("opponent-ability");
const opponentItemText = document.getElementById("opponent-item");
const opponentNatureText = document.getElementById("opponent-nature");

const moveContainer = document.getElementById("move-container");
const switchContainer = document.getElementById("switch-container");
const playerTeamStatus = document.getElementById("player-team-status");
const enemyTeamStatus = document.getElementById("enemy-team-status");
const battleLogElement = document.getElementById("battle-log");

// ============================================================
// 共通ユーティリティ
// ============================================================
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(name) {
  builderScreen.classList.toggle("hidden", name !== "builder");
  selectionScreen.classList.toggle("hidden", name !== "selection");
  battleScreen.classList.toggle("hidden", name !== "battle");
  goBuilderButton.classList.toggle("hidden", name === "builder");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function optionHtml(value, label, selectedValue, disabled = false) {
  const selected = value === selectedValue;
  const disabledAttr = disabled && !selected ? "disabled" : "";
  return `<option value="${value}" ${selected ? "selected" : ""} ${disabledAttr}>${label}</option>`;
}

const NATURE_STAT_NAMES = {
  attack: "こうげき(A)",
  defense: "ぼうぎょ(B)",
  specialAttack: "とくこう(C)",
  specialDefense: "とくぼう(D)",
  speed: "すばやさ(S)"
};

function getNatureDescription(natureName) {
  const nature = NATURES[natureName] || NATURES["まじめ"];
  if (!nature.up || !nature.down) return "補正なし";
  return `${NATURE_STAT_NAMES[nature.up]}↑ / ${NATURE_STAT_NAMES[nature.down]}↓`;
}

function getNatureOptionLabel(natureName) {
  return `${natureName}（${getNatureDescription(natureName)}）`;
}

// ============================================================
// Champions仕様：能力ポイント込み実数値
// 各能力0～32、合計66。Lv.50・個体値31固定。
// HP = 種族値 + 能力ポイント + 75
// その他 = floor((種族値 + 能力ポイント + 20) × 能力補正)
// ============================================================
function normalizeStatPoint(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.floor(n), 0, 32);
}

// v4で保存した従来努力値をChampionsの能力ポイントへ移行する。
// HOMEの変換則と同じく、最初の1ptは4EV、その後は8EVごとに1pt。
function legacyEVToStatPoints(value) {
  const ev = clamp(Math.floor(Number(value) || 0), 0, 252);
  if (ev < 4) return 0;
  return clamp(1 + Math.floor((ev - 4) / 8), 0, 32);
}

function getNatureMultiplier(natureName, statName) {
  const nature = NATURES[natureName] || NATURES["まじめ"];
  if (nature.up === statName) return 1.1;
  if (nature.down === statName) return 0.9;
  return 1;
}

function calculateHP(base, statPoints = 0) {
  return base + normalizeStatPoint(statPoints) + 75;
}

function calculateStat(base, statPoints = 0, natureName = "まじめ", statName = "attack") {
  const raw = base + normalizeStatPoint(statPoints) + 20;
  return Math.floor(raw * getNatureMultiplier(natureName, statName));
}

function calculateSetStats(set) {
  const species = SPECIES_DEX[set.speciesId];
  return {
    hp: calculateHP(species.baseStats.hp, set.statPoints.hp),
    attack: calculateStat(species.baseStats.attack, set.statPoints.attack, set.nature, "attack"),
    defense: calculateStat(species.baseStats.defense, set.statPoints.defense, set.nature, "defense"),
    specialAttack: calculateStat(species.baseStats.specialAttack, set.statPoints.specialAttack, set.nature, "specialAttack"),
    specialDefense: calculateStat(species.baseStats.specialDefense, set.statPoints.specialDefense, set.nature, "specialDefense"),
    speed: calculateStat(species.baseStats.speed, set.statPoints.speed, set.nature, "speed")
  };
}

function getStatPointTotal(set) {
  return Object.values(set.statPoints).reduce((sum, value) => sum + normalizeStatPoint(value), 0);
}

// ============================================================
// チーム構築状態
// ============================================================
function loadSavedTeam() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);

    // v5の保存がまだ無い場合は、v4の保存編成を引き継ぐ。
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (!raw) return deepClone(DEFAULT_PLAYER_SETS);

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 6) return deepClone(DEFAULT_PLAYER_SETS);
    return parsed;
  } catch (error) {
    console.warn("保存編成を読み込めませんでした", error);
    return deepClone(DEFAULT_PLAYER_SETS);
  }
}

let builderSets = loadSavedTeam();
let selectedRosterIndices = [];
let playerFullRoster = [];
let enemyFullRoster = [];
let enemyPreviewSets = [];

function normalizeSet(set) {
  const species = SPECIES_DEX[set.speciesId] || SPECIES_DEX.wolf;
  // 旧v4の「努力値」保存データがあれば、自動でChampions能力ポイントへ変換する。
  if (!set.statPoints && set.evs) {
    set.statPoints = {};
    Object.keys(STAT_LABELS).forEach(stat => {
      set.statPoints[stat] = legacyEVToStatPoints(set.evs[stat]);
    });
    delete set.evs;
  }
  if (!set.statPoints) set.statPoints = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
  Object.keys(STAT_LABELS).forEach(stat => set.statPoints[stat] = normalizeStatPoint(set.statPoints[stat]));
  if (!NATURES[set.nature]) set.nature = "まじめ";
  if (!species.abilities.some(a => a.id === set.abilityId)) set.abilityId = species.abilities[0].id;
  if (!ITEM_DEX[set.itemId]) set.itemId = "none";
  if (!Array.isArray(set.moves)) set.moves = species.movePool.slice(0, 4);
  const validMoves = set.moves.filter(id => species.movePool.includes(id));
  species.movePool.forEach(id => {
    if (validMoves.length < 4 && !validMoves.includes(id)) validMoves.push(id);
  });
  set.moves = validMoves.slice(0, 4);
  return set;
}

builderSets = builderSets.map(normalizeSet);

function validateSet(set) {
  const species = SPECIES_DEX[set.speciesId];
  if (!species) return "種族が不正です";
  if (getStatPointTotal(set) > 66) return "能力ポイント合計が66を超えています";
  for (const stat of Object.keys(STAT_LABELS)) {
    const point = Number(set.statPoints[stat]);
    if (!Number.isFinite(point) || point < 0 || point > 32) return `${STAT_LABELS[stat]}の能力ポイントが不正です`;
  }
  if (new Set(set.moves).size !== 4) return "同じ技は2つ選べません";
  if (set.moves.some(id => !species.movePool.includes(id))) return "覚えられない技があります";
  return null;
}

function getSpeciesClauseKey(speciesId) {
  const species = SPECIES_DEX[speciesId];
  if (!species) return `id:${speciesId}`;
  return species.dexNo !== undefined && species.dexNo !== null
    ? `dex:${species.dexNo}`
    : `id:${species.id}`;
}

function countBuilderValue(key, value) {
  return builderSets.filter(set => set[key] === value).length;
}

function countBuilderSpeciesClause(speciesId) {
  const key = getSpeciesClauseKey(speciesId);
  return builderSets.filter(set => getSpeciesClauseKey(set.speciesId) === key).length;
}

function getTeamClauseErrorForSlot(index) {
  const set = builderSets[index];
  if (!set) return null;

  if (countBuilderSpeciesClause(set.speciesId) > 1) {
    const name = SPECIES_DEX[set.speciesId]?.name ?? set.speciesId;
    return `同じポケモン「${name}」は1つの構築に1匹までです`;
  }

  if (set.itemId !== "none" && countBuilderValue("itemId", set.itemId) > 1) {
    const name = ITEM_DEX[set.itemId]?.name ?? set.itemId;
    return `同じ持ち物「${name}」は1つの構築で重複できません`;
  }

  return null;
}

function validateBuilder() {
  for (let i = 0; i < builderSets.length; i++) {
    const error = validateSet(builderSets[i]);
    if (error) return `スロット${i + 1}：${error}`;
  }

  for (let i = 0; i < builderSets.length; i++) {
    const clauseError = getTeamClauseErrorForSlot(i);
    if (clauseError) return `スロット${i + 1}：${clauseError}`;
  }

  return null;
}

function setBuilderMessage(text, isError = false) {
  builderMessage.textContent = text;
  builderMessage.classList.toggle("error", isError);
}

function saveBuilderTeam() {
  const error = validateBuilder();
  if (error) {
    setBuilderMessage(error, true);
    return false;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builderSets));
  setBuilderMessage("編成をこのブラウザに保存しました。", false);
  return true;
}

function renderBuilder() {
  builderSlots.innerHTML = "";

  builderSets.forEach((set, index) => {
    normalizeSet(set);
    const species = SPECIES_DEX[set.speciesId];
    const totalSP = getStatPointTotal(set);
    const error = validateSet(set) || getTeamClauseErrorForSlot(index);
    const stats = calculateSetStats(set);

    const card = document.createElement("article");
    card.className = `builder-card${error ? " invalid" : ""}`;

    const speciesOptions = Object.values(SPECIES_DEX)
      .map(s => {
        const usedByOtherSlot = builderSets.some((otherSet, otherIndex) =>
          otherIndex !== index && getSpeciesClauseKey(otherSet.speciesId) === getSpeciesClauseKey(s.id)
        );
        return optionHtml(
          s.id,
          `#${s.dexNo ?? "-"} ${s.name}（${s.types.join("/")} / BST ${Object.values(s.baseStats).reduce((a,b)=>a+b,0)}）${usedByOtherSlot && s.id !== set.speciesId ? "【使用中】" : ""}`,
          set.speciesId,
          usedByOtherSlot
        );
      })
      .join("");

    const abilityOptions = species.abilities
      .map(a => optionHtml(a.id, a.name, set.abilityId))
      .join("");

    const itemOptions = Object.values(ITEM_DEX)
      .map(item => {
        const usedByOtherSlot = item.id !== "none" && builderSets.some((otherSet, otherIndex) =>
          otherIndex !== index && otherSet.itemId === item.id
        );
        return optionHtml(
          item.id,
          `${item.name}${usedByOtherSlot && item.id !== set.itemId ? "【使用中】" : ""}`,
          set.itemId,
          usedByOtherSlot
        );
      })
      .join("");

    const natureOptions = Object.keys(NATURES)
      .map(name => optionHtml(name, getNatureOptionLabel(name), set.nature))
      .join("");

    const moveSelects = set.moves.map((moveId, moveIndex) => {
      const options = species.movePool
        .map(id => optionHtml(id, `${MOVE_DEX[id].name}［${MOVE_DEX[id].type}/${getCategoryText(MOVE_DEX[id].category)}］`, moveId))
        .join("");
      return `<div class="form-field"><label>技${moveIndex + 1}</label><select data-role="move" data-move-index="${moveIndex}">${options}</select></div>`;
    }).join("");

    const statPointInputs = Object.keys(STAT_LABELS).map(stat => `
      <div class="sp-field form-field">
        <label>${STAT_LABELS[stat]}</label>
        <input type="number" min="0" max="32" step="1" data-role="stat-point" data-stat="${stat}" value="${set.statPoints[stat]}">
      </div>
    `).join("");

    const statBoxes = Object.keys(STAT_LABELS).map(stat => `
      <div class="stat-box"><span>${STAT_LABELS[stat]}</span><strong>${stats[stat]}</strong></div>
    `).join("");

    card.innerHTML = `
      <div class="slot-title">
        <strong>スロット ${index + 1}　${species.name}</strong>
        <span class="sp-total ${totalSP > 66 ? "over" : ""}">能力P ${totalSP} / 66</span>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label>ポケモン</label>
          <select data-role="species">${speciesOptions}</select>
        </div>
        <div class="form-field">
          <label>性格</label>
          <select data-role="nature">${natureOptions}</select>
          <div class="effect-hint nature-effect">${set.nature}：${getNatureDescription(set.nature)}</div>
        </div>
        <div class="species-summary">
          図鑑No.${species.dexNo ?? "-"}　${species.classification ?? "-"}　${species.height ?? "-"}m / ${species.weight ?? "-"}kg<br>
          種族値：H${species.baseStats.hp} A${species.baseStats.attack} B${species.baseStats.defense} C${species.baseStats.specialAttack} D${species.baseStats.specialDefense} S${species.baseStats.speed}
        </div>
        <div class="form-field">
          <label>特性</label>
          <select data-role="ability">${abilityOptions}</select>
          <div class="effect-hint">${species.abilities.find(a => a.id === set.abilityId)?.description ?? ""}${species.abilities.find(a => a.id === set.abilityId)?.implemented === false ? '<br><span class="not-full">※現在は表示中心</span>' : ""}</div>
        </div>
        <div class="form-field">
          <label>持ち物</label>
          <select data-role="item">${itemOptions}</select>
          <div class="effect-hint">${ITEM_DEX[set.itemId]?.description ?? ""}</div>
        </div>
        <div class="full-width">
          <label style="font-size:12px;font-weight:800;color:#526067;">能力ポイント</label>
          <div class="sp-grid">${statPointInputs}</div>
        </div>
        <div class="full-width">
          <label style="font-size:12px;font-weight:800;color:#526067;">技4つ</label>
          <div class="move-select-grid">${moveSelects}</div>
        </div>
      </div>
      <div class="stat-preview">${statBoxes}</div>
      ${error ? `<div class="notice error" style="margin-bottom:0;">${error}</div>` : ""}
    `;

    card.querySelector('[data-role="species"]').addEventListener("change", event => {
      const newSpecies = SPECIES_DEX[event.target.value];
      set.speciesId = newSpecies.id;
      set.abilityId = newSpecies.abilities[0].id;
      set.moves = newSpecies.movePool.slice(0, 4);
      renderBuilder();
    });

    card.querySelector('[data-role="nature"]').addEventListener("change", event => {
      set.nature = event.target.value;
      renderBuilder();
    });

    card.querySelector('[data-role="ability"]').addEventListener("change", event => {
      set.abilityId = event.target.value;
      renderBuilder();
    });

    card.querySelector('[data-role="item"]').addEventListener("change", event => {
      set.itemId = event.target.value;
      renderBuilder();
    });

    card.querySelectorAll('[data-role="stat-point"]').forEach(input => {
      input.addEventListener("change", event => {
        set.statPoints[event.target.dataset.stat] = normalizeStatPoint(event.target.value);
        renderBuilder();
      });
    });

    card.querySelectorAll('[data-role="move"]').forEach(select => {
      select.addEventListener("change", event => {
        set.moves[Number(event.target.dataset.moveIndex)] = event.target.value;
        renderBuilder();
      });
    });

    builderSlots.appendChild(card);
  });
}

// ============================================================
// バトル用ポケモン生成
// ============================================================
function resetStages(pokemon) {
  pokemon.stages = {
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
    accuracy: 0,
    evasion: 0
  };
}

function createPokemon(set, rosterIndex = 0) {
  const species = SPECIES_DEX[set.speciesId];
  const stats = calculateSetStats(set);
  const ability = species.abilities.find(a => a.id === set.abilityId) || species.abilities[0];
  const item = ITEM_DEX[set.itemId] || ITEM_DEX.none;

  const pokemon = {
    id: species.id,
    rosterIndex,
    name: species.name,
    types: [...species.types],
    baseTypes: [...species.types],
    baseStats: { ...species.baseStats },
    nature: set.nature,
    statPoints: deepClone(set.statPoints),
    ability: { ...ability },
    item: { ...item },
    itemConsumed: false,
    moves: set.moves.map(id => ({ ...deepClone(MOVE_DEX[id]), pp: MOVE_DEX[id].maxPP })),
    maxHP: stats.hp,
    hp: stats.hp,
    attack: stats.attack,
    defense: stats.defense,
    specialAttack: stats.specialAttack,
    specialDefense: stats.specialDefense,
    speed: stats.speed,
    status: null,
    statusTurns: 0,
    toxicCounter: 0,
    side: null,
    choiceLock: null,
    protectChain: 0,
    protectThisTurn: false,
    seeded: false,
    seededBySide: null,
    recoveryBlockTurns: 0,
    lastMoveId: null,
    sameMoveCount: 0,
    abilityUsed: false,
    tempRemovedIce: false,
    formName: species.id === "dolpika" ? FORECAST_FORM_DATA.clear.formName : null
  };
  resetStages(pokemon);
  return pokemon;
}

// ============================================================
// 選出画面
// ============================================================
function setSummaryHtml(set, index) {
  const species = SPECIES_DEX[set.speciesId];
  const ability = species.abilities.find(a => a.id === set.abilityId)?.name || "-";
  const item = ITEM_DEX[set.itemId]?.name || "なし";
  const moves = set.moves.map(id => MOVE_DEX[id]?.name || id).join(" / ");
  return `
    <div class="preview-name">${species.name}</div>
    <div class="preview-meta">
      ${species.types.join(" / ")}<br>
      特性 ${ability}　持ち物 ${item}<br>
      能力補正 ${set.nature}（${getNatureDescription(set.nature)}）　能力P ${getStatPointTotal(set)}/66<br>
      ${moves}
    </div>
  `;
}

function renderSelection() {
  enemyPreview.innerHTML = "";
  playerPreview.innerHTML = "";

  enemyPreviewSets.forEach((set, index) => {
    const card = document.createElement("div");
    card.className = "preview-card";
    card.innerHTML = setSummaryHtml(set, index);
    enemyPreview.appendChild(card);
  });

  builderSets.forEach((set, index) => {
    const card = document.createElement("div");
    const order = selectedRosterIndices.indexOf(index);
    card.className = `preview-card${order >= 0 ? " selected" : ""}`;
    card.innerHTML = `${order >= 0 ? `<span class="order-badge">${order + 1}</span>` : ""}${setSummaryHtml(set, index)}`;
    card.addEventListener("click", () => toggleSelection(index));
    playerPreview.appendChild(card);
  });

  selectionCount.textContent = `${selectedRosterIndices.length} / 3`;
  startBattleButton.disabled = selectedRosterIndices.length !== 3;
}

function toggleSelection(index) {
  const existing = selectedRosterIndices.indexOf(index);
  if (existing >= 0) {
    selectedRosterIndices.splice(existing, 1);
  } else if (selectedRosterIndices.length < 3) {
    selectedRosterIndices.push(index);
  }
  renderSelection();
}

function renderDataCounts() {
  if (!dataCounts) return;
  const counts = typeof DATA_PACK_COUNTS !== "undefined"
    ? DATA_PACK_COUNTS
    : {
        species: Object.keys(SPECIES_DEX).length,
        moves: Object.keys(MOVE_DEX).length,
        items: Object.keys(ITEM_DEX).length,
        abilities: new Set(Object.values(SPECIES_DEX).flatMap(s => s.abilities.map(a => a.id))).size
      };

  dataCounts.innerHTML = `
    <span class="data-count-chip">ポケモン ${counts.species}種</span>
    <span class="data-count-chip">技 ${counts.moves}種</span>
    <span class="data-count-chip">特性 ${counts.abilities}種</span>
    <span class="data-count-chip">持ち物 ${counts.items}種</span>
  `;
}

function makeRandomSet(species, usedItemIds = new Set()) {
  const allStats = Object.keys(STAT_LABELS);
  const first = allStats[Math.floor(Math.random() * allStats.length)];
  let second = allStats[Math.floor(Math.random() * allStats.length)];
  while (second === first) second = allStats[Math.floor(Math.random() * allStats.length)];
  let third = allStats[Math.floor(Math.random() * allStats.length)];
  while (third === first || third === second) third = allStats[Math.floor(Math.random() * allStats.length)];

  const statPoints = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
  statPoints[first] = 32;
  statPoints[second] = 32;
  statPoints[third] = 2;

  const ability = species.abilities[Math.floor(Math.random() * species.abilities.length)];
  let itemCandidates = Object.values(ITEM_DEX).filter(item =>
    item.id !== "none" && !usedItemIds.has(item.id)
  );
  if (itemCandidates.length === 0) itemCandidates = [ITEM_DEX.none];
  const item = itemCandidates[Math.floor(Math.random() * itemCandidates.length)];
  if (item.id !== "none") usedItemIds.add(item.id);
  const natureNames = Object.keys(NATURES);
  const nature = natureNames[Math.floor(Math.random() * natureNames.length)];
  const moves = shuffle(species.movePool).slice(0, 4);

  return {
    speciesId: species.id,
    abilityId: ability.id,
    itemId: item.id,
    nature,
    statPoints,
    moves
  };
}

function pickClauseLegalSets(library, count = 6) {
  const picked = [];
  const speciesIds = new Set();
  const itemIds = new Set();

  for (const set of shuffle(library)) {
    const speciesKey = getSpeciesClauseKey(set.speciesId);
    if (speciesIds.has(speciesKey)) continue;
    if (set.itemId !== "none" && itemIds.has(set.itemId)) continue;

    picked.push(set);
    speciesIds.add(speciesKey);
    if (set.itemId !== "none") itemIds.add(set.itemId);

    if (picked.length >= count) break;
  }

  return picked;
}

function rerollEnemyRoster(render = true) {
  const library = typeof ENEMY_SET_LIBRARY !== "undefined" ? ENEMY_SET_LIBRARY : DEFAULT_ENEMY_SETS;
  let picked = pickClauseLegalSets(library, 6);

  // 構築例だけで6匹そろわない場合も、種族・持ち物重複なしで補充する。
  if (picked.length < 6) {
    const usedSpecies = new Set(picked.map(set => getSpeciesClauseKey(set.speciesId)));
    const usedItems = new Set(picked.filter(set => set.itemId !== "none").map(set => set.itemId));
    const candidates = shuffle(Object.values(SPECIES_DEX).filter(species => !usedSpecies.has(getSpeciesClauseKey(species.id))));

    for (const species of candidates) {
      if (picked.length >= 6) break;
      const generated = makeRandomSet(species, usedItems);
      picked.push(generated);
      usedSpecies.add(getSpeciesClauseKey(species.id));
    }
  }

  enemyPreviewSets = picked.slice(0, 6).map(set => deepClone(set));
  enemyFullRoster = enemyPreviewSets.map((set, i) => createPokemon(set, i));
  if (render) renderSelection();
}

function openSelection() {
  const error = validateBuilder();
  if (error) {
    setBuilderMessage(error, true);
    return;
  }
  saveBuilderTeam();
  selectedRosterIndices = [];
  playerFullRoster = builderSets.map((set, i) => createPokemon(set, i));
  rerollEnemyRoster(false);
  renderSelection();
  showScreen("selection");
}

// ============================================================
// 対戦状態
// ============================================================
let playerTeam = [];
let enemyTeam = [];
let playerActiveIndex = 0;
let enemyActiveIndex = 0;
let awaitingPlayerSwitch = false;
let battleOver = false;
let turnNumber = 1;
let battleLog = [];
let weather = { type: null, turns: 0 };
let fieldState = { trickRoom: 0, tailwind: { player: 0, enemy: 0 } };

const STRUGGLE_MOVE = {
  id: "struggle",
  name: "わるあがき",
  type: "ノーマル",
  category: "physical",
  power: 50,
  accuracy: null,
  priority: 0,
  maxPP: 1,
  pp: 1,
  struggle: true
};

function getPlayerPokemon() { return playerTeam[playerActiveIndex]; }
function getEnemyPokemon() { return enemyTeam[enemyActiveIndex]; }

// ============================================================
// ランク・タイプ相性
// ============================================================
function getStageMultiplier(stage) {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 + Math.abs(stage));
}

function getAccuracyMultiplier(stage) {
  return stage >= 0 ? (3 + stage) / 3 : 3 / (3 + Math.abs(stage));
}

function getModifiedStat(pokemon, statName) {
  let value = Math.floor(pokemon[statName] * getStageMultiplier(pokemon.stages[statName]));
  if (statName === "speed" && pokemon.status === "paralysis") value = Math.floor(value * 0.5);
  return Math.max(1, value);
}

function getDamageStat(pokemon, statName, isAttacker, critical) {
  let stage = pokemon.stages[statName];
  if (critical) {
    if (isAttacker && stage < 0) stage = 0;
    if (!isAttacker && stage > 0) stage = 0;
  }
  return Math.max(1, Math.floor(pokemon[statName] * getStageMultiplier(stage)));
}

function changeStage(pokemon, statName, amount) {
  const oldStage = pokemon.stages[statName];
  const newStage = clamp(oldStage + amount, -6, 6);
  pokemon.stages[statName] = newStage;
  const name = STAT_JP[statName];
  if (oldStage === newStage) return `${pokemon.name}の ${name}は もう変わらない！`;
  if (amount >= 2) return `${pokemon.name}の ${name}が ぐーんと あがった！`;
  if (amount === 1) return `${pokemon.name}の ${name}が あがった！`;
  if (amount <= -2) return `${pokemon.name}の ${name}が がくっと さがった！`;
  return `${pokemon.name}の ${name}が さがった！`;
}

function getTypeEffectiveness(moveType, defenderTypes) {
  let multiplier = 1;
  defenderTypes.forEach(type => {
    if (TYPE_CHART[moveType] && TYPE_CHART[moveType][type] !== undefined) {
      multiplier *= TYPE_CHART[moveType][type];
    }
  });
  return multiplier;
}

function getEffectivenessText(multiplier) {
  if (multiplier === 4) return "こうかちょうバツグン";
  if (multiplier === 2) return "こうかバツグン";
  if (multiplier === 1) return "こうかあり";
  if (multiplier === 0.5) return "いまひとつ";
  if (multiplier === 0.25) return "かなりいまひとつ";
  if (multiplier === 0) return "こうかなし";
  return "";
}

function getCategoryText(category) {
  if (category === "physical") return "物理";
  if (category === "special") return "特殊";
  return "変化";
}

// ============================================================
// 天候・特性・持ち物
// ============================================================
function setWeather(type) {
  weather.type = type;
  weather.turns = 5;
  addLog(`${WEATHER_NAMES[type]}になった！`, "log-weather");
}

function getWeatherDamageMultiplier(moveType) {
  if (weather.type === "sun") {
    if (moveType === "ほのお") return 1.5;
    if (moveType === "みず") return 0.5;
  }
  if (weather.type === "rain") {
    if (moveType === "みず") return 1.5;
    if (moveType === "ほのお") return 0.5;
  }
  return 1;
}

function getAbilityDamageMultiplier(attacker, move) {
  let multiplier = 1;
  if (attacker.hp <= attacker.maxHP / 3) {
    if (attacker.ability.id === "blaze" && move.type === "ほのお") multiplier *= 1.5;
    if (attacker.ability.id === "overgrow" && move.type === "くさ") multiplier *= 1.5;
    if (attacker.ability.id === "torrent" && move.type === "みず") multiplier *= 1.5;
  }
  if (attacker.ability.id === "sharpness" && move.slicing) multiplier *= 1.5;
  return multiplier;
}

function getDefensiveAbilityMultiplier(defender, move) {
  if (defender.ability.id === "fur-coat" && move.category === "physical") return 0.5;
  return 1;
}

function getItemDamageMultiplier(attacker) {
  if (!attacker.itemConsumed && attacker.item.id === "life-orb") return 1.3;
  return 1;
}

function trySitrusBerry(pokemon) {
  if (pokemon.hp <= 0 || pokemon.itemConsumed || pokemon.item.id !== "sitrus-berry") return;
  if (pokemon.hp <= pokemon.maxHP / 2) {
    const before = pokemon.hp;
    pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.floor(pokemon.maxHP / 4));
    pokemon.itemConsumed = true;
    addLog(`${pokemon.name}は オボンのみで ${pokemon.hp - before} HP 回復した！`);
  }
}

// ============================================================
// 状態異常
// ============================================================
function canReceiveStatus(pokemon, status) {
  if (pokemon.status) return false;
  if (status === "burn" && pokemon.types.includes("ほのお")) return false;
  if ((status === "poison" || status === "toxic") && (pokemon.types.includes("どく") || pokemon.types.includes("はがね"))) return false;
  if (status === "paralysis" && pokemon.types.includes("でんき")) return false;
  if (status === "freeze" && pokemon.types.includes("こおり")) return false;
  return true;
}

function inflictStatus(pokemon, status) {
  if (!canReceiveStatus(pokemon, status)) return `${pokemon.name}には 効かなかった！`;
  pokemon.status = status;
  if (status === "sleep") pokemon.statusTurns = Math.floor(Math.random() * 3) + 1;
  if (status === "toxic") pokemon.toxicCounter = 1;
  return `${pokemon.name}は ${STATUS_NAMES[status]}状態になった！`;
}

function canPokemonAct(pokemon) {
  if (pokemon.status === "sleep") {
    if (pokemon.statusTurns > 0) {
      pokemon.statusTurns--;
      if (pokemon.statusTurns === 0) {
        pokemon.status = null;
        return { canAct: true, text: `${pokemon.name}は 目を覚ました！` };
      }
      return { canAct: false, text: `${pokemon.name}は ぐうぐう眠っている……` };
    }
  }
  if (pokemon.status === "freeze") {
    if (Math.random() < 0.2) {
      pokemon.status = null;
      return { canAct: true, text: `${pokemon.name}の こおりが とけた！` };
    }
    return { canAct: false, text: `${pokemon.name}は こおっていて 動けない！` };
  }
  if (pokemon.status === "paralysis" && Math.random() < 0.25) {
    return { canAct: false, text: `${pokemon.name}は からだが しびれて 動けない！` };
  }
  return { canAct: true, text: null };
}

// ============================================================
// 命中・急所・ダメージ
// ============================================================
function checkAccuracy(move, attacker, defender) {
  if (move.accuracy === null) return true;
  if (move.id === "hurricane") {
    if (weather.type === "rain") return true;
    if (weather.type === "sun") return Math.random() * 100 < 50;
  }
  const acc = getAccuracyMultiplier(attacker.stages.accuracy);
  const eva = getAccuracyMultiplier(defender.stages.evasion);
  return Math.random() * 100 < move.accuracy * (acc / eva);
}

function isCriticalHit() {
  return Math.random() < (1 / 24);
}

function calculateDamage(attacker, defender, move, options = {}) {
  if (move.category === "status") return { damage: 0, critical: false, effectiveness: 1 };
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  if (effectiveness === 0) return { damage: 0, critical: false, effectiveness: 0 };

  const critical = options.forceCritical ?? isCriticalHit();
  let attackStat;
  let defenseStat;

  if (move.category === "physical") {
    attackStat = getDamageStat(attacker, "attack", true, critical);
    defenseStat = getDamageStat(defender, "defense", false, critical);
    if (weather.type === "snow" && defender.types.includes("こおり")) defenseStat = Math.floor(defenseStat * 1.5);
  } else {
    attackStat = getDamageStat(attacker, "specialAttack", true, critical);
    defenseStat = getDamageStat(defender, "specialDefense", false, critical);
    if (weather.type === "sand" && defender.types.includes("いわ")) defenseStat = Math.floor(defenseStat * 1.5);
  }

  let damage = Math.floor(((((2 * LEVEL / 5 + 2) * move.power * attackStat / defenseStat) / 50) + 2));
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const random = options.randomFactor ?? (0.85 + Math.random() * 0.15);
  const burnMultiplier = (attacker.status === "burn" && move.category === "physical") ? 0.5 : 1;

  damage = Math.floor(
    damage *
    stab *
    effectiveness *
    random *
    getWeatherDamageMultiplier(move.type) *
    getAbilityDamageMultiplier(attacker, move) *
    getDefensiveAbilityMultiplier(defender, move) *
    getItemDamageMultiplier(attacker) *
    (critical ? 1.5 : 1) *
    burnMultiplier
  );

  return { damage: Math.max(1, damage), critical, effectiveness };
}

function applyStatChanges(pokemon, changes) {
  return Object.keys(changes).map(statName => changeStage(pokemon, statName, changes[statName]));
}

function getSynthesisHealRatio() {
  if (weather.type === "sun") return 2 / 3;
  if (["rain", "sand", "snow"].includes(weather.type)) return 1 / 4;
  return 1 / 2;
}

// ============================================================
// 技使用
// ============================================================
function useMove(attacker, defender, move) {
  const logs = [];

  if (!move.struggle) {
    if (move.pp <= 0) return [`${move.name}は PPが ない！`];
    move.pp--;
  }

  const actionCheck = canPokemonAct(attacker);
  if (actionCheck.text) logs.push(actionCheck.text);
  if (!actionCheck.canAct) return logs;

  logs.push(`${attacker.name}の ${move.name}！`);

  if (move.category === "status") {
    if (move.weather) setWeather(move.weather);
    if (move.healByWeather) {
      if (attacker.hp === attacker.maxHP) {
        logs.push(`${attacker.name}の HPは 満タンだ！`);
      } else {
        const before = attacker.hp;
        attacker.hp = Math.min(attacker.maxHP, attacker.hp + Math.floor(attacker.maxHP * getSynthesisHealRatio()));
        logs.push(`${attacker.name}は ${attacker.hp - before} HP 回復した！`);
      }
    }
    if (move.selfStatChanges) logs.push(...applyStatChanges(attacker, move.selfStatChanges));
    if (move.targetStatChanges) logs.push(...applyStatChanges(defender, move.targetStatChanges));
    return logs;
  }

  if (!checkAccuracy(move, attacker, defender)) {
    logs.push("しかし こうげきは はずれた！");
    return logs;
  }

  const result = calculateDamage(attacker, defender, move);
  if (result.effectiveness === 0) {
    logs.push(`${defender.name}には こうかがないようだ……`);
    return logs;
  }

  defender.hp = Math.max(0, defender.hp - result.damage);
  logs.push(`${result.damage} ダメージ！ ${getEffectivenessText(result.effectiveness)}`);
  if (result.critical) logs.push("急所に当たった！");

  if (move.targetStatChanges && defender.hp > 0) logs.push(...applyStatChanges(defender, move.targetStatChanges));
  if (move.selfStatChanges) logs.push(...applyStatChanges(attacker, move.selfStatChanges));

  if (move.secondaryStatus && defender.hp > 0 && Math.random() * 100 < move.secondaryStatus.chance) {
    logs.push(inflictStatus(defender, move.secondaryStatus.status));
  }

  if (move.recoilRatio && result.damage > 0) {
    const recoil = Math.max(1, Math.floor(result.damage * move.recoilRatio));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は 反動で ${recoil} ダメージ！`);
  }

  if (move.struggle && attacker.hp > 0) {
    const recoil = Math.max(1, Math.floor(attacker.maxHP / 4));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は わるあがきの反動で ${recoil} ダメージ！`);
  }

  if (attacker.item.id === "life-orb" && !attacker.itemConsumed && !move.struggle && result.damage > 0 && attacker.hp > 0) {
    const recoil = Math.max(1, Math.floor(attacker.maxHP / 10));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は いのちのたまで ${recoil} ダメージ！`);
  }

  trySitrusBerry(defender);
  trySitrusBerry(attacker);
  return logs;
}

// ============================================================
// AI
// ============================================================
function scoreMove(attacker, defender, move) {
  if (!move.struggle && move.pp <= 0) return -9999;
  if (move.category === "status") {
    if (move.healByWeather) {
      const ratio = attacker.hp / attacker.maxHP;
      if (ratio < 0.35) return 150;
      if (ratio < 0.65) return 70;
      return 5;
    }
    if (move.weather) {
      if (weather.type === move.weather) return 4;
      return 30;
    }
    if (move.selfStatChanges) {
      let score = 34;
      Object.keys(move.selfStatChanges).forEach(stat => {
        if (attacker.stages[stat] >= 5) score -= 30;
      });
      return score;
    }
    return 18;
  }

  if (getTypeEffectiveness(move.type, defender.types) === 0) return 0;
  const expected = calculateDamage(attacker, defender, move, { randomFactor: 0.925, forceCritical: false }).damage;
  let score = expected * ((move.accuracy ?? 100) / 100);
  if (expected >= defender.hp) score += 100;
  if (move.priority > 0 && defender.hp <= defender.maxHP * 0.3) score += 25;
  if (move.secondaryStatus && !defender.status) score += 8;
  return score;
}

function chooseBestMove(attacker, defender) {
  const available = attacker.moves.filter(move => move.pp > 0);
  if (available.length === 0) return { ...STRUGGLE_MOVE };
  let best = available[0];
  let bestScore = -Infinity;
  available.forEach(move => {
    const score = scoreMove(attacker, defender, move) * (0.9 + Math.random() * 0.2);
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  });
  return best;
}

function bestDamageScoreForPokemon(attacker, defender) {
  const moves = attacker.moves.filter(m => m.category !== "status" && m.pp > 0);
  if (moves.length === 0) return 0;
  return Math.max(...moves.map(move => scoreMove(attacker, defender, move)));
}

function chooseEnemyAction() {
  const enemy = getEnemyPokemon();
  const player = getPlayerPokemon();
  const currentScore = bestDamageScoreForPokemon(enemy, player);
  const bench = enemyTeam
    .map((pokemon, index) => ({ pokemon, index }))
    .filter(entry => entry.index !== enemyActiveIndex && entry.pokemon.hp > 0);

  if (bench.length > 0) {
    let bestSwitch = null;
    let bestSwitchScore = currentScore;
    bench.forEach(entry => {
      const score = bestDamageScoreForPokemon(entry.pokemon, player);
      if (score > bestSwitchScore) {
        bestSwitchScore = score;
        bestSwitch = entry;
      }
    });

    const badMatchup = bestSwitch && bestSwitchScore > Math.max(25, currentScore * 1.55);
    const endangered = enemy.hp < enemy.maxHP * 0.28 && bestSwitch && bestSwitchScore > currentScore;
    if ((badMatchup && Math.random() < 0.4) || (endangered && Math.random() < 0.55)) {
      return { type: "switch", index: bestSwitch.index };
    }
  }

  return { type: "move", move: chooseBestMove(enemy, player) };
}

// ============================================================
// 行動順
// ============================================================
function determineFirst(playerMove, enemyMove) {
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();
  if (playerMove.priority > enemyMove.priority) return "player";
  if (enemyMove.priority > playerMove.priority) return "enemy";
  const ps = getModifiedStat(player, "speed");
  const es = getModifiedStat(enemy, "speed");
  if (ps > es) return "player";
  if (es > ps) return "enemy";
  return Math.random() < 0.5 ? "player" : "enemy";
}

// ============================================================
// ターン終了処理
// ============================================================
function processResidualForPokemon(pokemon) {
  if (pokemon.hp <= 0) return;

  const poisonHeal = pokemon.ability.id === "poison-heal" && ["poison", "toxic"].includes(pokemon.status);

  if (poisonHeal) {
    if (pokemon.hp < pokemon.maxHP) {
      const before = pokemon.hp;
      pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 8)));
      addLog(`${pokemon.name}は ポイズンヒールで ${pokemon.hp - before} HP 回復した！`, "log-status");
    }
  } else if (pokemon.status === "burn") {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 16));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は やけどで ${damage} ダメージ！`, "log-status");
  } else if (pokemon.status === "poison") {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 8));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は どくで ${damage} ダメージ！`, "log-status");
  } else if (pokemon.status === "toxic") {
    const damage = Math.max(1, Math.floor((pokemon.maxHP * pokemon.toxicCounter) / 16));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    pokemon.toxicCounter++;
    addLog(`${pokemon.name}は もうどくで ${damage} ダメージ！`, "log-status");
  }

  if (pokemon.hp > 0 && weather.type === "sand" && !pokemon.types.some(t => ["いわ", "じめん", "はがね"].includes(t))) {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 16));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は すなあらしで ${damage} ダメージ！`, "log-weather");
  }

  if (pokemon.hp > 0 && !pokemon.itemConsumed && pokemon.item.id === "leftovers" && pokemon.hp < pokemon.maxHP) {
    const before = pokemon.hp;
    pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 16)));
    addLog(`${pokemon.name}は たべのこしで ${pokemon.hp - before} HP 回復した！`);
  }

  if (pokemon.hp > 0 && !pokemon.itemConsumed && pokemon.item.id === "toxic-orb" && !pokemon.status) {
    const text = inflictStatus(pokemon, "toxic");
    pokemon.itemConsumed = true;
    addLog(`${pokemon.name}の どくどくだまが発動！ ${text}`, "log-status");
  }

  trySitrusBerry(pokemon);
}

function endTurn() {
  const active = [getPlayerPokemon(), getEnemyPokemon()].filter(p => p.hp > 0);
  active.sort((a, b) => getModifiedStat(b, "speed") - getModifiedStat(a, "speed"));
  active.forEach(processResidualForPokemon);

  if (weather.type) {
    weather.turns--;
    if (weather.turns <= 0) {
      addLog(`${WEATHER_NAMES[weather.type]}が おさまった。`, "log-weather");
      weather = { type: null, turns: 0 };
    }
  }
}

// ============================================================
// ログ
// ============================================================
function addLog(text, className = "") {
  battleLog.push({ text, className });
  if (battleLog.length > 120) battleLog.shift();
  renderLog();
}

function addLogs(logs) {
  logs.forEach(text => addLog(text));
}

function renderLog() {
  battleLogElement.innerHTML = "";
  battleLog.forEach(log => {
    const div = document.createElement("div");
    div.textContent = log.text;
    if (log.className) div.className = log.className;
    battleLogElement.appendChild(div);
  });
  battleLogElement.scrollTop = battleLogElement.scrollHeight;
}

// ============================================================
// バトル表示
// ============================================================
function updateHPBar(pokemon, element) {
  const percent = (pokemon.hp / pokemon.maxHP) * 100;
  element.style.width = `${percent}%`;
  element.style.background = percent > 50 ? "#44a95b" : percent > 20 ? "#e6b83d" : "#d65353";
}

function renderStages(pokemon, container) {
  container.innerHTML = "";
  const labels = { attack: "A", defense: "B", specialAttack: "C", specialDefense: "D", speed: "S", accuracy: "命中", evasion: "回避" };
  Object.keys(labels).forEach(stat => {
    const stage = pokemon.stages[stat];
    if (stage === 0) return;
    const span = document.createElement("span");
    span.className = "stage-item";
    span.textContent = `${labels[stat]} ${stage > 0 ? "+" : ""}${stage}`;
    container.appendChild(span);
  });
}

function renderStatus(pokemon, element) {
  if (!pokemon.status) {
    element.classList.add("hidden");
    element.textContent = "";
    return;
  }
  element.classList.remove("hidden");
  element.textContent = STATUS_NAMES[pokemon.status];
}

function itemDisplay(pokemon) {
  return pokemon.itemConsumed ? `${pokemon.item.name}（使用済み）` : pokemon.item.name;
}

function renderPokemon() {
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();

  playerNameText.textContent = player.name;
  playerTypeText.textContent = player.types.join(" / ");
  playerHPText.textContent = `${player.hp} / ${player.maxHP}`;
  playerAbilityText.textContent = player.ability.name;
  playerItemText.textContent = itemDisplay(player);
  playerNatureText.textContent = `${player.nature}（${getNatureDescription(player.nature)}）`;
  updateHPBar(player, playerHPFill);
  renderStages(player, playerStagesText);
  renderStatus(player, playerStatusText);

  opponentNameText.textContent = enemy.name;
  opponentTypeText.textContent = enemy.types.join(" / ");
  opponentHPText.textContent = `${enemy.hp} / ${enemy.maxHP}`;
  opponentAbilityText.textContent = enemy.ability.name;
  opponentItemText.textContent = itemDisplay(enemy);
  opponentNatureText.textContent = `${enemy.nature}（${getNatureDescription(enemy.nature)}）`;
  updateHPBar(enemy, opponentHPFill);
  renderStages(enemy, opponentStagesText);
  renderStatus(enemy, opponentStatusText);

  weatherText.textContent = weather.type ? `${WEATHER_NAMES[weather.type]}（残り${weather.turns}）` : "なし";
  turnText.textContent = turnNumber;
}

function renderTeamStatus(team, activeIndex, container) {
  container.innerHTML = "";
  team.forEach((pokemon, index) => {
    const chip = document.createElement("span");
    chip.className = "team-chip";
    if (index === activeIndex) chip.classList.add("active");
    if (pokemon.hp <= 0) chip.classList.add("fainted");
    chip.textContent = `${pokemon.name}#${pokemon.rosterIndex + 1}${pokemon.status ? `［${STATUS_NAMES[pokemon.status]}］` : ""}${pokemon.hp <= 0 ? " ×" : ""}`;
    container.appendChild(chip);
  });
}

function getUsablePlayerMoves() {
  return getPlayerPokemon().moves.filter(move => move.pp > 0);
}

function renderMoves() {
  moveContainer.innerHTML = "";
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();
  const usable = getUsablePlayerMoves();
  const movesToRender = usable.length === 0 ? [{ ...STRUGGLE_MOVE }] : player.moves;

  movesToRender.forEach(move => {
    const button = document.createElement("button");
    button.className = "move-button";
    const power = move.power === null ? "-" : move.power;
    const accuracy = move.accuracy === null ? "-" : move.accuracy;
    const effect = move.category === "status" ? "変化技" : getEffectivenessText(getTypeEffectiveness(move.type, enemy.types));
    const ppLine = move.struggle ? "PP ∞" : `PP ${move.pp} / ${move.maxPP}`;
    button.innerHTML = `
      <span class="move-name">${move.name}</span>
      <span class="move-info">${move.type} / ${getCategoryText(move.category)}<br>威力 ${power}　命中 ${accuracy}</span>
      <span class="pp-line">${ppLine}</span>
      <span class="effectiveness">${effect}</span>
    `;
    button.disabled = battleOver || awaitingPlayerSwitch || player.hp <= 0 || (!move.struggle && move.pp <= 0);
    button.addEventListener("click", () => processMoveTurn(move));
    moveContainer.appendChild(button);
  });
}

function renderSwitchButtons() {
  switchContainer.innerHTML = "";
  playerTeam.forEach((pokemon, index) => {
    const button = document.createElement("button");
    button.className = "switch-button";
    button.textContent = `${pokemon.name}#${pokemon.rosterIndex + 1}　${pokemon.hp}/${pokemon.maxHP}`;
    button.disabled = battleOver || pokemon.hp <= 0 || index === playerActiveIndex;
    button.addEventListener("click", () => playerSwitch(index));
    switchContainer.appendChild(button);
  });
}

function renderAll() {
  if (!playerTeam.length || !enemyTeam.length) return;
  renderPokemon();
  renderTeamStatus(playerTeam, playerActiveIndex, playerTeamStatus);
  renderTeamStatus(enemyTeam, enemyActiveIndex, enemyTeamStatus);
  renderMoves();
  renderSwitchButtons();
}

// ============================================================
// ひんし・交代
// ============================================================
function healthyIndices(team) {
  return team.map((pokemon, index) => ({ pokemon, index })).filter(entry => entry.pokemon.hp > 0);
}

function resetOnSwitch(pokemon) {
  resetStages(pokemon);
  if (pokemon.status === "toxic") pokemon.toxicCounter = 1;
}

function chooseEnemyReplacement() {
  const candidates = healthyIndices(enemyTeam).filter(entry => entry.index !== enemyActiveIndex);
  if (candidates.length === 0) return -1;
  const player = getPlayerPokemon();
  let best = candidates[0];
  let bestScore = -Infinity;
  candidates.forEach(entry => {
    const score = bestDamageScoreForPokemon(entry.pokemon, player);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });
  return best.index;
}

function enemySwitch(newIndex, announce = true) {
  const old = getEnemyPokemon();
  if (announce) addLog(`相手は ${old.name}を 戻した！`, "log-system");
  resetOnSwitch(old);
  enemyActiveIndex = newIndex;
  resetOnSwitch(getEnemyPokemon());
  addLog(`相手は ${getEnemyPokemon().name}を くりだした！`, "log-system");
}

function resolveFaints() {
  const enemy = getEnemyPokemon();
  const player = getPlayerPokemon();

  if (enemy.hp <= 0) {
    addLog(`${enemy.name}は たおれた！`);
    const next = chooseEnemyReplacement();
    if (next === -1) {
      battleOver = true;
      addLog("あなたの勝ち！", "log-system");
      renderAll();
      return;
    }
    enemySwitch(next, false);
  }

  if (player.hp <= 0) {
    addLog(`${player.name}は たおれた！`);
    const remaining = healthyIndices(playerTeam).filter(entry => entry.index !== playerActiveIndex);
    if (remaining.length === 0) {
      battleOver = true;
      addLog("あなたの負け……", "log-system");
      renderAll();
      return;
    }
    awaitingPlayerSwitch = true;
    addLog("次に出すポケモンを選んでください。", "log-system");
  }

  renderAll();
}

// ============================================================
// 技ターン
// ============================================================
function processMoveTurn(playerMove) {
  if (battleOver || awaitingPlayerSwitch) return;
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();
  if (player.hp <= 0 || enemy.hp <= 0) return;
  if (!playerMove.struggle && playerMove.pp <= 0) return;

  addLog(`ターン ${turnNumber}`, "log-turn");
  const enemyAction = chooseEnemyAction();

  if (enemyAction.type === "switch") {
    enemySwitch(enemyAction.index, true);
    if (player.hp > 0 && getEnemyPokemon().hp > 0) addLogs(useMove(player, getEnemyPokemon(), playerMove));
  } else {
    const enemyMove = enemyAction.move;
    const first = determineFirst(playerMove, enemyMove);
    if (first === "player") {
      addLogs(useMove(player, enemy, playerMove));
      if (enemy.hp > 0 && player.hp > 0) addLogs(useMove(enemy, player, enemyMove));
    } else {
      addLogs(useMove(enemy, player, enemyMove));
      if (player.hp > 0 && enemy.hp > 0) addLogs(useMove(player, enemy, playerMove));
    }
  }

  if (getPlayerPokemon().hp <= 0 || getEnemyPokemon().hp <= 0) {
    turnNumber++;
    resolveFaints();
    renderAll();
    return;
  }

  endTurn();
  turnNumber++;
  resolveFaints();
  renderAll();
}

// ============================================================
// プレイヤー交代
// ============================================================
function playerSwitch(newIndex) {
  if (battleOver) return;
  const newPokemon = playerTeam[newIndex];
  if (!newPokemon || newPokemon.hp <= 0 || newIndex === playerActiveIndex) return;

  if (awaitingPlayerSwitch) {
    playerActiveIndex = newIndex;
    resetOnSwitch(getPlayerPokemon());
    awaitingPlayerSwitch = false;
    addLog(`${getPlayerPokemon().name}！ キミにきめた！`, "log-system");
    renderAll();
    return;
  }

  addLog(`ターン ${turnNumber}`, "log-turn");
  const old = getPlayerPokemon();
  const enemyAction = chooseEnemyAction();
  addLog(`${old.name} 戻れ！`);
  resetOnSwitch(old);
  playerActiveIndex = newIndex;
  resetOnSwitch(getPlayerPokemon());
  addLog(`${getPlayerPokemon().name}！ キミにきめた！`);

  if (enemyAction.type === "switch") {
    enemySwitch(enemyAction.index, true);
  } else if (getEnemyPokemon().hp > 0) {
    addLogs(useMove(getEnemyPokemon(), getPlayerPokemon(), enemyAction.move));
  }

  if (getPlayerPokemon().hp > 0 && getEnemyPokemon().hp > 0) endTurn();
  turnNumber++;
  resolveFaints();
  renderAll();
}

// ============================================================
// バトル開始
// ============================================================
function startBattleFromSelection() {
  if (selectedRosterIndices.length !== 3) return;

  playerTeam = selectedRosterIndices.map(index => createPokemon(builderSets[index], index));

  const enemySelected = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3);
  enemyTeam = enemySelected.map(index => createPokemon(enemyPreviewSets[index], index));

  playerActiveIndex = 0;
  enemyActiveIndex = 0;
  awaitingPlayerSwitch = false;
  battleOver = false;
  turnNumber = 1;
  battleLog = [];
  weather = { type: null, turns: 0 };

  showScreen("battle");
  addLog("ニワラバトルを開始！", "log-system");
  addLog(`相手は ${getEnemyPokemon().name}を くりだした！`, "log-system");
  addLog(`${getPlayerPokemon().name}！ キミにきめた！`, "log-system");
  renderAll();
}


// ============================================================
// v5 拡張バトルエンジン
// ============================================================
function getPokemonSide(pokemon) {
  return pokemon?.side || (playerTeam.includes(pokemon) ? "player" : "enemy");
}

function getOpponentSide(side) {
  return side === "player" ? "enemy" : "player";
}

function getActivePokemonBySide(side) {
  return side === "player" ? getPlayerPokemon() : getEnemyPokemon();
}

function getTeamBySide(side) {
  return side === "player" ? playerTeam : enemyTeam;
}

function getActiveIndexBySide(side) {
  return side === "player" ? playerActiveIndex : enemyActiveIndex;
}

function setActiveIndexBySide(side, index) {
  if (side === "player") playerActiveIndex = index;
  else enemyActiveIndex = index;
}

function isChoiceItem(pokemon) {
  return ["choice-band", "choice-specs", "choice-scarf"].includes(pokemon.item.id) && !pokemon.itemConsumed;
}

function isMoveAllowedByItem(pokemon, move) {
  if (pokemon.item.id === "assault-vest" && !pokemon.itemConsumed && move.category === "status") return false;
  if (isChoiceItem(pokemon) && pokemon.choiceLock && move.id !== pokemon.choiceLock) return false;
  return true;
}

function isTrappedByOpponent(pokemon, foe) {
  if (!pokemon || !foe || foe.hp <= 0) return false;
  if (foe.ability.id !== "shadow-tag") return false;
  if (pokemon.types.includes("ゴースト")) return false;
  if (pokemon.ability.id === "shadow-tag") return false;
  return true;
}

const FORECAST_FORM_DATA = {
  clear: { secondType: "ノーマル", formName: "ドルピカのすがた" },
  sun:   { secondType: "ほのお",   formName: "かいせいのすがた" },
  rain:  { secondType: "みず",     formName: "うてんのすがた" },
  sand:  { secondType: "いわ",     formName: "さじんのすがた" },
  snow:  { secondType: "こおり",   formName: "ふうせつのすがた" }
};

function isActivePokemon(pokemon) {
  return pokemon === getPlayerPokemon() || pokemon === getEnemyPokemon();
}

function updateForecastType(pokemon, logChange = false) {
  if (!pokemon || pokemon.ability.id !== "forecast") return false;

  const weatherKey = weather.type || "clear";
  const formData = FORECAST_FORM_DATA[weatherKey] || FORECAST_FORM_DATA.clear;
  const first = pokemon.baseTypes[0] || "でんき";
  const oldFormName = pokemon.formName || FORECAST_FORM_DATA.clear.formName;

  pokemon.types = [first, formData.secondType];
  pokemon.formName = formData.formName;

  const changed = oldFormName !== formData.formName;
  if (changed && logChange && isActivePokemon(pokemon)) {
    addLog(`${pokemon.name}は ${formData.formName}に フォルムチェンジした！`, "log-system");
  }

  return changed;
}

function updateAllForecastTypes(logChanges = false) {
  [...playerTeam, ...enemyTeam].forEach(pokemon => updateForecastType(pokemon, logChanges));
}

function weatherTurnsFromItem(type, source) {
  if (!source || source.itemConsumed) return 5;
  const map = { sun: "heat-rock", rain: "damp-rock", sand: "smooth-rock", snow: "icy-rock" };
  return source.item.id === map[type] ? 8 : 5;
}

function setWeather(type, source = null) {
  // Pokémon Champions仕様：すでに同じ天候なら残りターンは更新しない。
  if (weather.type === type && weather.turns > 0) {
    return false;
  }

  weather.type = type;
  weather.turns = weatherTurnsFromItem(type, source);
  addLog(`${WEATHER_NAMES[type]}になった！`, "log-weather");
  updateAllForecastTypes(true);
  return true;
}

function setTailwind(side) {
  fieldState.tailwind[side] = 4;
  addLog(`${side === "player" ? "自分" : "相手"}の場に おいかぜが吹いた！`, "log-system");
  const active = getActivePokemonBySide(side);
  if (active?.ability.id === "windmill") {
    addLog(changeStage(active, "speed", 1, active));
  }
}

function toggleTrickRoom() {
  if (fieldState.trickRoom > 0) {
    fieldState.trickRoom = 0;
    addLog("トリックルームが 解除された！", "log-system");
  } else {
    fieldState.trickRoom = 5;
    addLog("時空が ゆがんだ！ トリックルーム！", "log-system");
  }
}

function onSwitchOut(pokemon) {
  if (!pokemon) return;
  if (pokemon.ability.id === "regenerator" && pokemon.hp > 0 && pokemon.hp < pokemon.maxHP) {
    const before = pokemon.hp;
    pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 3)));
    addLog(`${pokemon.name}は さいせいりょくで ${pokemon.hp - before} HP 回復した！`, "log-system");
  }
  if (pokemon.ability.id === "natural-cure" && pokemon.status) {
    pokemon.status = null;
    pokemon.statusTurns = 0;
    pokemon.toxicCounter = 0;
    addLog(`${pokemon.name}の 状態異常が しぜんかいふくで治った！`, "log-status");
  }
  resetStages(pokemon);
  if (pokemon.status === "toxic") pokemon.toxicCounter = 1;
  pokemon.choiceLock = null;
  pokemon.protectThisTurn = false;
  pokemon.protectChain = 0;
  pokemon.seeded = false;
  pokemon.seededBySide = null;
  pokemon.lastMoveId = null;
  pokemon.sameMoveCount = 0;
  pokemon.types = [...pokemon.baseTypes];
  if (pokemon.ability.id === "forecast") {
    pokemon.formName = FORECAST_FORM_DATA.clear.formName;
  }
}

function activateEntryAbility(pokemon) {
  if (!pokemon || pokemon.hp <= 0) return;
  updateForecastType(pokemon, true);

  if (pokemon.ability.id === "drizzle") {
    const changed = setWeather("rain", pokemon);
    if (!changed) {
      addLog(`${pokemon.name}の あめふらし！ すでにあめなので残りターンは変わらない。`, "log-weather");
    }
  }

  if (pokemon.ability.id === "sand-stream") {
    const changed = setWeather("sand", pokemon);
    if (!changed) {
      addLog(`${pokemon.name}の すなおこし！ すでにすなあらしなので残りターンは変わらない。`, "log-weather");
    }
  }

  if (pokemon.ability.id === "trick-builder" && !pokemon.abilityUsed) {
    pokemon.abilityUsed = true;
    if (fieldState.trickRoom > 0) {
      addLog(`${pokemon.name}の トリックビルダー！ すでにトリックルーム状態なので残りターンは変わらない。`, "log-system");
    } else {
      fieldState.trickRoom = 5;
      addLog(`${pokemon.name}の トリックビルダー！ トリックルームになった！`, "log-system");
    }
  }
  if (pokemon.ability.id === "windmill" && fieldState.tailwind[getPokemonSide(pokemon)] > 0) {
    addLog(`${pokemon.name}の かざぐるま！`, "log-system");
    addLog(changeStage(pokemon, "speed", 1, pokemon));
  }
  if (pokemon.ability.id === "clean-land") {
    if (fieldState.trickRoom > 0) {
      fieldState.trickRoom = 0;
      addLog(`${pokemon.name}の せいち！ トリックルームを解除した！`, "log-system");
    }
  }
}

function getModifiedStat(pokemon, statName) {
  let value = Math.floor(pokemon[statName] * getStageMultiplier(pokemon.stages[statName]));
  if (statName === "speed" && pokemon.status === "paralysis") value = Math.floor(value * 0.5);
  if (statName === "speed" && pokemon.item.id === "choice-scarf" && !pokemon.itemConsumed) value = Math.floor(value * 1.5);
  if (statName === "speed" && fieldState.tailwind[getPokemonSide(pokemon)] > 0) value *= 2;
  return Math.max(1, value);
}

function getDamageStatV5(pokemon, statName, isAttacker, critical) {
  let stage = pokemon.stages[statName] ?? 0;
  if (critical) {
    if (isAttacker && stage < 0) stage = 0;
    if (!isAttacker && stage > 0) stage = 0;
  }
  let value = Math.max(1, Math.floor(pokemon[statName] * getStageMultiplier(stage)));
  if (isAttacker && statName === "attack" && pokemon.item.id === "choice-band" && !pokemon.itemConsumed) value = Math.floor(value * 1.5);
  if (isAttacker && statName === "specialAttack" && pokemon.item.id === "choice-specs" && !pokemon.itemConsumed) value = Math.floor(value * 1.5);
  if (isAttacker && statName === "specialAttack" && pokemon.ability.id === "night-scales") value *= 2;
  if (!isAttacker && statName === "specialDefense" && pokemon.item.id === "assault-vest" && !pokemon.itemConsumed) value = Math.floor(value * 1.5);
  return Math.max(1, value);
}

function changeStage(pokemon, statName, amount, source = null) {
  if (amount < 0 && source && source !== pokemon) {
    if (["clear-body", "white-smoke"].includes(pokemon.ability.id) || (pokemon.item.id === "clear-amulet" && !pokemon.itemConsumed)) {
      return `${pokemon.name}は 能力を下げられない！`;
    }
  }

  const oldStage = pokemon.stages[statName];
  const newStage = clamp(oldStage + amount, -6, 6);
  pokemon.stages[statName] = newStage;
  const name = STAT_JP[statName];
  if (oldStage === newStage) return `${pokemon.name}の ${name}は もう変わらない！`;

  let text;
  if (amount >= 2) text = `${pokemon.name}の ${name}が ぐーんと あがった！`;
  else if (amount === 1) text = `${pokemon.name}の ${name}が あがった！`;
  else if (amount <= -2) text = `${pokemon.name}の ${name}が がくっと さがった！`;
  else text = `${pokemon.name}の ${name}が さがった！`;

  if (amount < 0 && source && source !== pokemon && pokemon.ability.id === "competitive") {
    const before = pokemon.stages.specialAttack;
    pokemon.stages.specialAttack = clamp(before + 2, -6, 6);
    text += ` ${pokemon.name}の かちきで とくこうが上がった！`;
  }
  return text;
}

function applyStatChanges(pokemon, changes, source = null) {
  return Object.keys(changes).map(statName => changeStage(pokemon, statName, changes[statName], source));
}

function getEffectiveMove(attacker, move) {
  const effective = { ...move };
  if (move.weatherBall) {
    const typeMap = { sun: "ほのお", rain: "みず", sand: "いわ", snow: "こおり" };
    if (weather.type) {
      effective.type = typeMap[weather.type];
      effective.power = 100;
    } else {
      effective.type = "ノーマル";
      effective.power = 50;
    }
  }
  if (attacker.ability.id === "sand-skin" && effective.type === "ノーマル") {
    effective.type = "じめん";
    effective.sandSkinBoost = true;
  }
  if (move.doubleIfTargetStatus) effective.doubleIfTargetStatus = true;
  return effective;
}

function getTypeEffectivenessV5(attacker, defender, move) {
  const effectiveMove = getEffectiveMove(attacker, move);
  let multiplier = 1;
  defender.types.forEach(type => {
    let part = TYPE_CHART[effectiveMove.type]?.[type];
    if (part === undefined) part = 1;
    if (part === 0 && type === "ゴースト" && attacker.ability.id === "scrappy" && ["ノーマル", "かくとう"].includes(effectiveMove.type)) part = 1;
    multiplier *= part;
  });
  return multiplier;
}

function getImmunityResult(attacker, defender, move) {
  const effectiveMove = getEffectiveMove(attacker, move);
  const type = effectiveMove.type;

  if (move.priority > 0 && defender.ability.id === "vivid-body" && move.category !== "status") {
    return { immune: true, text: `${defender.name}の ビビットボディで 先制技を防いだ！` };
  }
  if (move.sound && defender.ability.id === "soundproof") {
    return { immune: true, text: `${defender.name}には 音技が効かない！` };
  }
  if (move.wind && defender.ability.id === "windmill") {
    return { immune: true, text: `${defender.name}は かざぐるまで風技を無効化した！`, statBoost: ["speed", 1] };
  }
  if (type === "じめん") {
    if (defender.ability.id === "levitate") return { immune: true, text: `${defender.name}は ふゆうで じめん技を無効化した！` };
    if (defender.item.id === "air-balloon" && !defender.itemConsumed) return { immune: true, text: `${defender.name}は ふうせんで じめん技を無効化した！` };
    if (defender.ability.id === "earth-eater") return { immune: true, text: `${defender.name}は どしょくで じめん技を吸収した！`, heal: 0.25 };
  }
  if (type === "でんき" && defender.ability.id === "lightning-rod") {
    return { immune: true, text: `${defender.name}の ひらいしん！`, statBoost: ["specialAttack", 1] };
  }
  if (type === "くさ" && defender.ability.id === "sap-sipper") {
    return { immune: true, text: `${defender.name}の そうしょく！`, statBoost: ["attack", 1] };
  }
  if (type === "みず" && defender.ability.id === "dry-skin") {
    return { immune: true, text: `${defender.name}は かんそうはだで みず技を吸収した！`, heal: 0.25 };
  }
  return { immune: false };
}

function applyImmunityResult(defender, result) {
  const logs = [];
  if (result.text) logs.push(result.text);
  if (result.heal && defender.hp > 0 && defender.hp < defender.maxHP) {
    const before = defender.hp;
    defender.hp = Math.min(defender.maxHP, defender.hp + Math.max(1, Math.floor(defender.maxHP * result.heal)));
    logs.push(`${defender.name}は ${defender.hp - before} HP 回復した！`);
  }
  if (result.statBoost) logs.push(changeStage(defender, result.statBoost[0], result.statBoost[1], defender));
  return logs;
}

function moveHasSheerForceEffect(move) {
  return Boolean(move.secondaryStatus || move.targetStatChangeChance || move.selfStatChangeChance);
}

function getAbilityDamageMultiplier(attacker, move) {
  let multiplier = 1;
  if (attacker.hp <= attacker.maxHP / 3) {
    if (attacker.ability.id === "blaze" && move.type === "ほのお") multiplier *= 1.5;
    if (attacker.ability.id === "overgrow" && move.type === "くさ") multiplier *= 1.5;
    if (attacker.ability.id === "torrent" && move.type === "みず") multiplier *= 1.5;
  }
  if (attacker.ability.id === "sharpness" && move.slicing) multiplier *= 1.5;
  if (attacker.ability.id === "sheer-force" && moveHasSheerForceEffect(move)) multiplier *= 1.3;
  if (attacker.ability.id === "infinite-track") multiplier *= Math.min(2, 1 + Math.max(0, attacker.sameMoveCount - 1) * 0.2);
  if (move.sandSkinBoost) multiplier *= 1.2;
  if (move.rainBonus && weather.type === "rain") multiplier *= move.rainBonus;

  const activeAbilities = [getPlayerPokemon()?.ability.id, getEnemyPokemon()?.ability.id];
  if (move.type === "フェアリー" && activeAbilities.includes("fairy-aura")) multiplier *= (4 / 3);
  return multiplier;
}

function getDefensiveAbilityMultiplier(defender, move) {
  let m = 1;
  if (defender.ability.id === "fur-coat" && move.category === "physical") m *= 0.5;
  if (defender.ability.id === "heatproof" && move.type === "ほのお") m *= 0.5;
  if (defender.ability.id === "thick-fat" && ["ほのお", "こおり"].includes(move.type)) m *= 0.5;
  if (defender.ability.id === "dry-skin" && move.type === "ほのお") m *= 1.25;
  return m;
}

function getItemDamageMultiplier(attacker, move, effectiveness, defender) {
  if (attacker.itemConsumed) return 1;
  let m = 1;
  if (attacker.item.id === "life-orb") m *= 1.3;
  if (attacker.item.id === "expert-belt" && effectiveness > 1) m *= 1.2;
  if (attacker.item.id === "muscle-band" && move.category === "physical") m *= 1.1;
  if (attacker.item.id === "wise-glasses" && move.category === "special") m *= 1.1;
  const typeBoosts = {
    "charcoal": "ほのお", "mystic-water": "みず", "miracle-seed": "くさ", "never-melt-ice": "こおり",
    "soft-sand": "じめん", "magnet": "でんき", "silver-powder": "むし", "spell-tag": "ゴースト",
    "black-glasses": "あく", "metal-coat": "はがね", "fairy-feather": "フェアリー"
  };
  if (typeBoosts[attacker.item.id] === move.type) m *= 1.2;
  if (move.knockOff && defender && defender.item.id !== "none" && !defender.itemConsumed) m *= 1.5;
  return m;
}

function checkAccuracy(move, attacker, defender) {
  if (move.accuracy === null) return true;
  if (move.id === "hurricane" || move.id === "thunder") {
    if (weather.type === "rain") return true;
    if (weather.type === "sun") return Math.random() * 100 < 50;
  }
  let accuracy = move.accuracy;
  if (attacker.ability.id === "compound-eyes") accuracy *= 1.3;
  const acc = getAccuracyMultiplier(attacker.stages.accuracy);
  const eva = getAccuracyMultiplier(defender.stages.evasion);
  return Math.random() * 100 < accuracy * (acc / eva);
}

function isCriticalHit(move = null) {
  return Math.random() < (move?.highCrit ? (1 / 8) : (1 / 24));
}

function calculateDamage(attacker, defender, originalMove, options = {}) {
  if (originalMove.category === "status") return { damage: 0, critical: false, effectiveness: 1, move: originalMove };
  const move = getEffectiveMove(attacker, originalMove);
  const effectiveness = getTypeEffectivenessV5(attacker, defender, move);
  if (effectiveness === 0) return { damage: 0, critical: false, effectiveness: 0, move };

  const critical = options.forceCritical ?? isCriticalHit(move);
  let attackStat;
  let defenseStat;

  if (move.category === "physical") {
    if (move.useDefenseAsAttack) attackStat = getDamageStatV5(attacker, "defense", true, critical);
    else attackStat = getDamageStatV5(attacker, "attack", true, critical);
    defenseStat = move.ignoreDefenderStages ? Math.max(1, defender.defense) : getDamageStatV5(defender, "defense", false, critical);
    if (weather.type === "snow" && defender.types.includes("こおり")) defenseStat = Math.floor(defenseStat * 1.5);
  } else {
    attackStat = getDamageStatV5(attacker, "specialAttack", true, critical);
    defenseStat = move.usePhysicalDefense
      ? (move.ignoreDefenderStages ? Math.max(1, defender.defense) : getDamageStatV5(defender, "defense", false, critical))
      : (move.ignoreDefenderStages ? Math.max(1, defender.specialDefense) : getDamageStatV5(defender, "specialDefense", false, critical));
    if (!move.usePhysicalDefense && weather.type === "sand" && defender.types.includes("いわ")) defenseStat = Math.floor(defenseStat * 1.5);
  }

  let power = move.power;
  if (move.doubleIfTargetStatus && defender.status) power *= 2;

  let damage = Math.floor(((((2 * LEVEL / 5 + 2) * power * attackStat / defenseStat) / 50) + 2));
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const random = options.randomFactor ?? (0.85 + Math.random() * 0.15);
  const burnMultiplier = (attacker.status === "burn" && move.category === "physical") ? 0.5 : 1;

  damage = Math.floor(
    damage * stab * effectiveness * random * getWeatherDamageMultiplier(move.type) *
    getAbilityDamageMultiplier(attacker, move) * getDefensiveAbilityMultiplier(defender, move) *
    getItemDamageMultiplier(attacker, move, effectiveness, defender) * (critical ? 1.5 : 1) * burnMultiplier
  );

  return { damage: Math.max(1, damage), critical, effectiveness, move };
}

function tryStatusBerry(pokemon) {
  if (!pokemon.status || pokemon.itemConsumed) return null;
  if (pokemon.item.id === "lum-berry" || (pokemon.item.id === "chesto-berry" && pokemon.status === "sleep")) {
    const old = STATUS_NAMES[pokemon.status];
    pokemon.status = null;
    pokemon.statusTurns = 0;
    pokemon.toxicCounter = 0;
    pokemon.itemConsumed = true;
    return `${pokemon.name}は ${pokemon.item.name}で ${old}を治した！`;
  }
  return null;
}

function canReceiveStatus(pokemon, status) {
  if (pokemon.status) return false;
  if (status === "sleep" && pokemon.ability.id === "sweet-veil") return false;
  if (status === "burn" && pokemon.types.includes("ほのお")) return false;
  if ((status === "poison" || status === "toxic") && (pokemon.types.includes("どく") || pokemon.types.includes("はがね"))) return false;
  if (status === "paralysis" && pokemon.types.includes("でんき")) return false;
  if (status === "freeze" && pokemon.types.includes("こおり")) return false;
  return true;
}

function inflictStatus(pokemon, status) {
  if (!canReceiveStatus(pokemon, status)) return `${pokemon.name}には 効かなかった！`;
  pokemon.status = status;
  if (status === "sleep") pokemon.statusTurns = Math.floor(Math.random() * 3) + 1;
  if (status === "toxic") pokemon.toxicCounter = 1;
  const base = `${pokemon.name}は ${STATUS_NAMES[status]}状態になった！`;
  const berry = tryStatusBerry(pokemon);
  return berry ? `${base} ${berry}` : base;
}

function canRecover(pokemon) {
  return (pokemon.recoveryBlockTurns || 0) <= 0;
}

function executeHealing(pokemon, ratio) {
  if (!canRecover(pokemon)) return `${pokemon.name}は かいふくふうじで 回復できない！`;
  if (pokemon.hp >= pokemon.maxHP) return `${pokemon.name}の HPは 満タンだ！`;
  const before = pokemon.hp;
  pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP * ratio)));
  return `${pokemon.name}は ${pokemon.hp - before} HP 回復した！`;
}

function executeProtect(attacker) {
  const chance = attacker.protectChain <= 0 ? 1 : Math.pow(1 / 3, attacker.protectChain);
  if (Math.random() <= chance) {
    attacker.protectThisTurn = true;
    attacker.protectChain += 1;
    return `${attacker.name}は まもりの体勢に入った！`;
  }
  attacker.protectThisTurn = false;
  attacker.protectChain += 1;
  return "しかし うまく決まらなかった！";
}

function statusMoveTargetsOpponent(move) {
  return Boolean(move.directStatus || move.seedTarget || move.targetStatChanges);
}

function applyTargetStatusMoveEffects(attacker, defender, move, logs) {
  if (move.directStatus) logs.push(inflictStatus(defender, move.directStatus));
  if (move.seedTarget) {
    if (defender.types.includes("くさ")) logs.push(`${defender.name}には やどりぎのタネが効かない！`);
    else if (defender.seeded) logs.push(`${defender.name}には すでにタネが植えつけられている！`);
    else {
      defender.seeded = true;
      defender.seededBySide = getPokemonSide(attacker);
      logs.push(`${defender.name}に やどりぎのタネを植えつけた！`);
    }
  }
  if (move.targetStatChanges) logs.push(...applyStatChanges(defender, move.targetStatChanges, attacker));
}

function autoPivot(side) {
  const team = getTeamBySide(side);
  const currentIndex = getActiveIndexBySide(side);
  const candidates = team.map((p, i) => ({ p, i })).filter(x => x.i !== currentIndex && x.p.hp > 0);
  if (!candidates.length) return;
  candidates.sort((a, b) => (b.p.hp / b.p.maxHP) - (a.p.hp / a.p.maxHP));
  const old = getActivePokemonBySide(side);
  onSwitchOut(old);
  setActiveIndexBySide(side, candidates[0].i);
  const incoming = getActivePokemonBySide(side);
  addLog(`${old.name}は 技の効果で戻った！`, "log-system");
  addLog(`${side === "player" ? "" : "相手は "}${incoming.name}を くりだした！`, "log-system");
  activateEntryAbility(incoming);
}

function useMove(attacker, defender, originalMove) {
  const logs = [];
  const move = getEffectiveMove(attacker, originalMove);

  if (!move.struggle) {
    if (move.pp <= 0) return [`${move.name}は PPが ない！`];
    if (!isMoveAllowedByItem(attacker, move)) return [`${attacker.name}は 持ち物の効果で ${move.name}を選べない！`];
    move.pp--;
    // 元の技オブジェクトにもPP減少を反映
    const original = attacker.moves.find(m => m.id === originalMove.id);
    if (original) original.pp = move.pp;
  }

  if (isChoiceItem(attacker) && !attacker.choiceLock && !move.struggle) attacker.choiceLock = move.id;

  if (attacker.lastMoveId === move.id) attacker.sameMoveCount += 1;
  else attacker.sameMoveCount = 1;
  attacker.lastMoveId = move.id;

  if (!move.protect) attacker.protectChain = 0;

  const actionCheck = canPokemonAct(attacker);
  if (actionCheck.text) logs.push(actionCheck.text);
  if (!actionCheck.canAct) return logs;

  logs.push(`${attacker.name}の ${move.name}！`);

  if (move.category === "status") {
    if (move.protect) {
      logs.push(executeProtect(attacker));
      return logs;
    }
    if (move.accuracy !== null && !checkAccuracy(move, attacker, defender)) {
      logs.push("しかし うまく決まらなかった！");
      return logs;
    }
    if (move.powder && defender.types.includes("くさ")) {
      logs.push(`${defender.name}には こな技が効かない！`);
      return logs;
    }
    if (statusMoveTargetsOpponent(move) && defender.protectThisTurn) {
      logs.push(`${defender.name}は 攻撃を防いだ！`);
      return logs;
    }

    let actualDefender = defender;
    if (statusMoveTargetsOpponent(move) && defender.ability.id === "magic-bounce") {
      logs.push(`${defender.name}の マジックミラーで はね返した！`);
      actualDefender = attacker;
    }

    if (move.weather) {
      const changed = setWeather(move.weather, attacker);
      if (!changed) logs.push("しかし すでに同じ天候なので 効果はなかった！");
    }
    if (move.tailwind) setTailwind(getPokemonSide(attacker));
    if (move.trickRoom) toggleTrickRoom();
    if (move.healRatio) logs.push(executeHealing(attacker, move.healRatio));
    if (move.healByWeather) logs.push(executeHealing(attacker, getSynthesisHealRatio()));
    if (move.selfStatChanges) logs.push(...applyStatChanges(attacker, move.selfStatChanges, attacker));
    if (statusMoveTargetsOpponent(move)) applyTargetStatusMoveEffects(attacker, actualDefender, move, logs);

    if (move.pivot && attacker.hp > 0) autoPivot(getPokemonSide(attacker));
    return logs;
  }

  if (defender.protectThisTurn) {
    logs.push(`${defender.name}は 攻撃を防いだ！`);
    return logs;
  }

  const immunity = getImmunityResult(attacker, defender, move);
  if (immunity.immune) {
    logs.push(...applyImmunityResult(defender, immunity));
    return logs;
  }

  if (!checkAccuracy(move, attacker, defender)) {
    logs.push("しかし こうげきは はずれた！");
    return logs;
  }

  const result = calculateDamage(attacker, defender, move);
  if (result.effectiveness === 0) {
    logs.push(`${defender.name}には こうかがないようだ……`);
    return logs;
  }

  let dealt = result.damage;
  const fullBefore = defender.hp === defender.maxHP;
  if (dealt >= defender.hp && fullBefore && defender.hp > 1) {
    if (defender.ability.id === "sturdy") {
      dealt = defender.hp - 1;
      logs.push(`${defender.name}は がんじょうで耐えた！`);
    } else if (defender.item.id === "focus-sash" && !defender.itemConsumed) {
      dealt = defender.hp - 1;
      defender.itemConsumed = true;
      logs.push(`${defender.name}は きあいのタスキで耐えた！`);
    }
  }

  defender.hp = Math.max(0, defender.hp - dealt);
  logs.push(`${dealt} ダメージ！ ${getEffectivenessText(result.effectiveness)}`);
  if (result.critical) logs.push("急所に当たった！");

  if (move.removeIceUntilEndTurn && attacker.types.includes("こおり")) {
    attacker.types = attacker.types.filter(type => type !== "こおり");
    attacker.tempRemovedIce = true;
    logs.push(`${attacker.name}は このターン こおりタイプではなくなった！`);
  }

  const sheerForceActive = attacker.ability.id === "sheer-force" && moveHasSheerForceEffect(move);
  const cloakBlocks = defender.item.id === "covert-cloak" && !defender.itemConsumed;

  if (move.targetStatChanges && defender.hp > 0) logs.push(...applyStatChanges(defender, move.targetStatChanges, attacker));
  if (move.selfStatChanges) logs.push(...applyStatChanges(attacker, move.selfStatChanges, attacker));

  if (!sheerForceActive && !cloakBlocks && move.targetStatChangeChance && defender.hp > 0 && Math.random() * 100 < move.targetStatChangeChance.chance) {
    logs.push(changeStage(defender, move.targetStatChangeChance.stat, move.targetStatChangeChance.amount, attacker));
  }
  if (!sheerForceActive && move.selfStatChangeChance && attacker.hp > 0 && Math.random() * 100 < move.selfStatChangeChance.chance) {
    logs.push(changeStage(attacker, move.selfStatChangeChance.stat, move.selfStatChangeChance.amount, attacker));
  }
  if (!sheerForceActive && !cloakBlocks && move.secondaryStatus && defender.hp > 0 && Math.random() * 100 < move.secondaryStatus.chance) {
    logs.push(inflictStatus(defender, move.secondaryStatus.status));
  }

  if (move.recoveryBlockTurns && defender.hp > 0) {
    defender.recoveryBlockTurns = Math.max(defender.recoveryBlockTurns || 0, move.recoveryBlockTurns);
    logs.push(`${defender.name}は ${move.recoveryBlockTurns}ターン 回復できなくなった！`);
  }
  if (move.seedTarget && defender.hp > 0 && !defender.types.includes("くさ") && !defender.seeded) {
    defender.seeded = true;
    defender.seededBySide = getPokemonSide(attacker);
    logs.push(`${defender.name}に やどりぎのタネを植えつけた！`);
  }

  if (move.drainRatio && dealt > 0 && attacker.hp > 0 && canRecover(attacker)) {
    const before = attacker.hp;
    attacker.hp = Math.min(attacker.maxHP, attacker.hp + Math.max(1, Math.floor(dealt * move.drainRatio)));
    logs.push(`${attacker.name}は ${attacker.hp - before} HP 吸収した！`);
  }

  if (move.recoilRatio && dealt > 0 && attacker.hp > 0) {
    const recoil = Math.max(1, Math.floor(dealt * move.recoilRatio));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は 反動で ${recoil} ダメージ！`);
  }
  if (move.recoilMaxHPRatio && attacker.hp > 0) {
    const recoil = Math.max(1, Math.floor(attacker.maxHP * move.recoilMaxHPRatio));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は 反動で ${recoil} ダメージ！`);
  }
  if (move.struggle && attacker.hp > 0) {
    const recoil = Math.max(1, Math.floor(attacker.maxHP / 4));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は わるあがきの反動で ${recoil} ダメージ！`);
  }

  if (move.knockOff && defender.item.id !== "none" && !defender.itemConsumed && defender.hp > 0) {
    defender.itemConsumed = true;
    logs.push(`${defender.name}の ${defender.item.name}を はたき落とした！`);
  }

  if (defender.item.id === "air-balloon" && !defender.itemConsumed && dealt > 0) {
    defender.itemConsumed = true;
    logs.push(`${defender.name}の ふうせんが割れた！`);
  }

  if (move.contact && defender.item.id === "rocky-helmet" && !defender.itemConsumed && attacker.hp > 0) {
    const damage = Math.max(1, Math.floor(attacker.maxHP / 6));
    attacker.hp = Math.max(0, attacker.hp - damage);
    logs.push(`${attacker.name}は ゴツゴツメットで ${damage} ダメージ！`);
  }

  if (dealt > 0 && defender.ability.id === "stamina" && defender.hp > 0) logs.push(changeStage(defender, "defense", 1, defender));
  if (move.contact && defender.ability.id === "gooey" && attacker.hp > 0) logs.push(changeStage(attacker, "speed", -1, defender));

  if (attacker.item.id === "life-orb" && !attacker.itemConsumed && !move.struggle && dealt > 0 && attacker.hp > 0 && !sheerForceActive) {
    const recoil = Math.max(1, Math.floor(attacker.maxHP / 10));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    logs.push(`${attacker.name}は いのちのたまで ${recoil} ダメージ！`);
  }

  trySitrusBerry(defender);
  trySitrusBerry(attacker);

  if (defender.hp <= 0 && attacker.hp > 0 && attacker.ability.id === "moxie") logs.push(changeStage(attacker, "attack", 1, attacker));

  if (move.pivot && attacker.hp > 0 && defender.hp > 0) autoPivot(getPokemonSide(attacker));
  return logs;
}

function getSelectableMoves(pokemon) {
  return pokemon.moves.filter(move => move.pp > 0 && isMoveAllowedByItem(pokemon, move));
}

function getUsablePlayerMoves() {
  return getSelectableMoves(getPlayerPokemon());
}

function scoreMove(attacker, defender, move) {
  if (!move.struggle && move.pp <= 0) return -9999;
  if (!isMoveAllowedByItem(attacker, move)) return -9999;
  if (move.category === "status") {
    if (move.healRatio || move.healByWeather) {
      if (!canRecover(attacker)) return -50;
      const ratio = attacker.hp / attacker.maxHP;
      if (ratio < 0.35) return 150;
      if (ratio < 0.65) return 70;
      return 5;
    }
    if (move.protect) return attacker.protectChain === 0 ? 22 : 5;
    if (move.weather) return weather.type === move.weather ? 4 : 30;
    if (move.tailwind) return fieldState.tailwind[getPokemonSide(attacker)] > 0 ? 4 : 38;
    if (move.trickRoom) return fieldState.trickRoom > 0 ? 6 : 30;
    if (move.directStatus && defender.status) return 2;
    if (move.selfStatChanges) {
      let score = 34;
      Object.keys(move.selfStatChanges).forEach(stat => { if (attacker.stages[stat] >= 5) score -= 30; });
      return score;
    }
    return 18;
  }

  const immunity = getImmunityResult(attacker, defender, move);
  if (immunity.immune) return 0;
  if (getTypeEffectivenessV5(attacker, defender, move) === 0) return 0;
  const expected = calculateDamage(attacker, defender, move, { randomFactor: 0.925, forceCritical: false }).damage;
  let score = expected * ((move.accuracy ?? 100) / 100);
  if (expected >= defender.hp) score += 100;
  if (move.priority > 0 && defender.hp <= defender.maxHP * 0.3) score += 25;
  if (move.secondaryStatus && !defender.status) score += 8;
  if (move.pivot && attacker.hp < attacker.maxHP * 0.45) score += 12;
  return score;
}

function chooseBestMove(attacker, defender) {
  const available = getSelectableMoves(attacker);
  if (available.length === 0) return { ...STRUGGLE_MOVE };
  let best = available[0];
  let bestScore = -Infinity;
  available.forEach(move => {
    const score = scoreMove(attacker, defender, move) * (0.9 + Math.random() * 0.2);
    if (score > bestScore) { bestScore = score; best = move; }
  });
  return best;
}

function bestDamageScoreForPokemon(attacker, defender) {
  const moves = getSelectableMoves(attacker).filter(m => m.category !== "status");
  if (moves.length === 0) return 0;
  return Math.max(...moves.map(move => scoreMove(attacker, defender, move)));
}

function chooseEnemyAction() {
  const enemy = getEnemyPokemon();
  const player = getPlayerPokemon();
  const currentScore = bestDamageScoreForPokemon(enemy, player);
  const trapped = isTrappedByOpponent(enemy, player);
  const bench = enemyTeam.map((pokemon, index) => ({ pokemon, index }))
    .filter(entry => entry.index !== enemyActiveIndex && entry.pokemon.hp > 0);

  if (!trapped && bench.length > 0) {
    let bestSwitch = null;
    let bestSwitchScore = currentScore;
    bench.forEach(entry => {
      const score = bestDamageScoreForPokemon(entry.pokemon, player);
      if (score > bestSwitchScore) { bestSwitchScore = score; bestSwitch = entry; }
    });
    const badMatchup = bestSwitch && bestSwitchScore > Math.max(25, currentScore * 1.55);
    const endangered = enemy.hp < enemy.maxHP * 0.28 && bestSwitch && bestSwitchScore > currentScore;
    if ((badMatchup && Math.random() < 0.4) || (endangered && Math.random() < 0.55)) return { type: "switch", index: bestSwitch.index };
  }
  return { type: "move", move: chooseBestMove(enemy, player) };
}

function determineFirst(playerMove, enemyMove) {
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();
  if (playerMove.priority > enemyMove.priority) return "player";
  if (enemyMove.priority > playerMove.priority) return "enemy";
  const ps = getModifiedStat(player, "speed");
  const es = getModifiedStat(enemy, "speed");
  if (ps === es) return Math.random() < 0.5 ? "player" : "enemy";
  if (fieldState.trickRoom > 0) return ps < es ? "player" : "enemy";
  return ps > es ? "player" : "enemy";
}

function processResidualForPokemon(pokemon) {
  if (pokemon.hp <= 0) return;

  const poisonHeal = pokemon.ability.id === "poison-heal" && ["poison", "toxic"].includes(pokemon.status);
  if (poisonHeal) {
    if (pokemon.hp < pokemon.maxHP && canRecover(pokemon)) {
      const before = pokemon.hp;
      pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 8)));
      addLog(`${pokemon.name}は ポイズンヒールで ${pokemon.hp - before} HP 回復した！`, "log-status");
    }
  } else if (pokemon.status === "burn") {
    let damage = Math.max(1, Math.floor(pokemon.maxHP / 16));
    if (pokemon.ability.id === "heatproof") damage = Math.max(1, Math.floor(damage / 2));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は やけどで ${damage} ダメージ！`, "log-status");
  } else if (pokemon.status === "poison") {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 8));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は どくで ${damage} ダメージ！`, "log-status");
  } else if (pokemon.status === "toxic") {
    const damage = Math.max(1, Math.floor((pokemon.maxHP * pokemon.toxicCounter) / 16));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    pokemon.toxicCounter++;
    addLog(`${pokemon.name}は もうどくで ${damage} ダメージ！`, "log-status");
  }

  if (pokemon.hp <= 0) return;

  if (pokemon.seeded) {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 8));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は やどりぎのタネで ${damage} HP 奪われた！`, "log-status");
    const source = getActivePokemonBySide(pokemon.seededBySide);
    if (source && source.hp > 0 && canRecover(source)) {
      const before = source.hp;
      source.hp = Math.min(source.maxHP, source.hp + damage);
      if (source.hp > before) addLog(`${source.name}は やどりぎで ${source.hp - before} HP 回復した！`, "log-status");
    }
  }

  if (pokemon.hp > 0 && weather.type === "sand" && !pokemon.types.some(t => ["いわ", "じめん", "はがね"].includes(t))) {
    const damage = Math.max(1, Math.floor(pokemon.maxHP / 16));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    addLog(`${pokemon.name}は すなあらしで ${damage} ダメージ！`, "log-weather");
  }

  if (pokemon.hp > 0 && pokemon.ability.id === "dry-skin") {
    if (weather.type === "rain" && pokemon.hp < pokemon.maxHP && canRecover(pokemon)) {
      const before = pokemon.hp;
      pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 8)));
      addLog(`${pokemon.name}は かんそうはだで ${pokemon.hp - before} HP 回復した！`, "log-weather");
    } else if (weather.type === "sun") {
      const damage = Math.max(1, Math.floor(pokemon.maxHP / 8));
      pokemon.hp = Math.max(0, pokemon.hp - damage);
      addLog(`${pokemon.name}は かんそうはだで ${damage} ダメージ！`, "log-weather");
    }
  }

  if (pokemon.hp > 0 && pokemon.ability.id === "hydration" && weather.type === "rain" && pokemon.status) {
    pokemon.status = null; pokemon.statusTurns = 0; pokemon.toxicCounter = 0;
    addLog(`${pokemon.name}は うるおいボディで 状態異常が治った！`, "log-status");
  }

  if (pokemon.hp > 0 && !pokemon.itemConsumed && pokemon.item.id === "leftovers" && pokemon.hp < pokemon.maxHP && canRecover(pokemon)) {
    const before = pokemon.hp;
    pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 16)));
    addLog(`${pokemon.name}は たべのこしで ${pokemon.hp - before} HP 回復した！`);
  }

  if (pokemon.hp > 0 && !pokemon.itemConsumed && pokemon.item.id === "black-sludge") {
    if (pokemon.types.includes("どく") && pokemon.hp < pokemon.maxHP && canRecover(pokemon)) {
      const before = pokemon.hp;
      pokemon.hp = Math.min(pokemon.maxHP, pokemon.hp + Math.max(1, Math.floor(pokemon.maxHP / 16)));
      addLog(`${pokemon.name}は くろいヘドロで ${pokemon.hp - before} HP 回復した！`);
    } else if (!pokemon.types.includes("どく")) {
      const damage = Math.max(1, Math.floor(pokemon.maxHP / 8));
      pokemon.hp = Math.max(0, pokemon.hp - damage);
      addLog(`${pokemon.name}は くろいヘドロで ${damage} ダメージ！`);
    }
  }

  if (pokemon.hp > 0 && !pokemon.itemConsumed && pokemon.item.id === "toxic-orb" && !pokemon.status) {
    const text = inflictStatus(pokemon, "toxic");
    pokemon.itemConsumed = true;
    addLog(`${pokemon.name}の どくどくだまが発動！ ${text}`, "log-status");
  }

  if (pokemon.hp > 0 && pokemon.ability.id === "speed-boost" && pokemon.stages.speed < 6) {
    addLog(changeStage(pokemon, "speed", 1, pokemon));
  }

  trySitrusBerry(pokemon);
  const berry = tryStatusBerry(pokemon);
  if (berry) addLog(berry, "log-status");
}

function endTurn() {
  const active = [getPlayerPokemon(), getEnemyPokemon()].filter(p => p.hp > 0);
  active.sort((a, b) => getModifiedStat(b, "speed") - getModifiedStat(a, "speed"));
  active.forEach(processResidualForPokemon);

  [...playerTeam, ...enemyTeam].forEach(p => {
    p.protectThisTurn = false;
    if (p.recoveryBlockTurns > 0) p.recoveryBlockTurns--;
    if (p.tempRemovedIce) {
      p.types = [...p.baseTypes];
      p.tempRemovedIce = false;
      updateForecastType(p);
    }
  });

  if (weather.type) {
    weather.turns--;
    if (weather.turns <= 0) {
      addLog(`${WEATHER_NAMES[weather.type]}が おさまった。`, "log-weather");
      weather = { type: null, turns: 0 };
      updateAllForecastTypes(true);
    }
  }
  if (fieldState.trickRoom > 0) {
    fieldState.trickRoom--;
    if (fieldState.trickRoom === 0) addLog("トリックルームが 元に戻った。", "log-system");
  }
  ["player", "enemy"].forEach(side => {
    if (fieldState.tailwind[side] > 0) {
      fieldState.tailwind[side]--;
      if (fieldState.tailwind[side] === 0) addLog(`${side === "player" ? "自分" : "相手"}の おいかぜが止んだ。`, "log-system");
    }
  });
}

function itemDisplay(pokemon) {
  if (pokemon.item.id === "air-balloon" && pokemon.itemConsumed) return `${pokemon.item.name}（割れた）`;
  return pokemon.itemConsumed ? `${pokemon.item.name}（使用済み）` : pokemon.item.name;
}

function renderPokemon() {
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();

  playerNameText.textContent = player.name;
  playerTypeText.textContent = player.types.join(" / ");
  playerHPText.textContent = `${player.hp} / ${player.maxHP}`;
  playerAbilityText.textContent = player.ability.name;
  playerItemText.textContent = itemDisplay(player);
  playerNatureText.textContent = `${player.nature}（${getNatureDescription(player.nature)}）`;
  updateHPBar(player, playerHPFill);
  renderStages(player, playerStagesText);
  renderStatus(player, playerStatusText);

  opponentNameText.textContent = enemy.name;
  opponentTypeText.textContent = enemy.types.join(" / ");
  opponentHPText.textContent = `${enemy.hp} / ${enemy.maxHP}`;
  opponentAbilityText.textContent = enemy.ability.name;
  opponentItemText.textContent = itemDisplay(enemy);
  opponentNatureText.textContent = `${enemy.nature}（${getNatureDescription(enemy.nature)}）`;
  updateHPBar(enemy, opponentHPFill);
  renderStages(enemy, opponentStagesText);
  renderStatus(enemy, opponentStatusText);

  weatherText.textContent = weather.type ? `${WEATHER_NAMES[weather.type]}（残り${weather.turns}）` : "なし";
  roomText.textContent = fieldState.trickRoom > 0 ? `トリックルーム（残り${fieldState.trickRoom}）` : "なし";
  const tw = [];
  if (fieldState.tailwind.player > 0) tw.push(`自分${fieldState.tailwind.player}`);
  if (fieldState.tailwind.enemy > 0) tw.push(`相手${fieldState.tailwind.enemy}`);
  tailwindText.textContent = tw.length ? tw.join(" / ") : "なし";
  turnText.textContent = turnNumber;
}

function renderMoves() {
  moveContainer.innerHTML = "";
  const player = getPlayerPokemon();
  const enemy = getEnemyPokemon();
  const usable = getSelectableMoves(player);
  const movesToRender = usable.length === 0 ? [{ ...STRUGGLE_MOVE }] : player.moves;

  movesToRender.forEach(move => {
    const effective = getEffectiveMove(player, move);
    const button = document.createElement("button");
    button.className = "move-button";
    const power = effective.power === null ? "-" : effective.power;
    const accuracy = effective.accuracy === null ? "-" : effective.accuracy;
    const effect = effective.category === "status" ? "変化技" : getEffectivenessText(getTypeEffectivenessV5(player, enemy, effective));
    const ppLine = effective.struggle ? "PP ∞" : `PP ${move.pp} / ${move.maxPP}`;
    const lockText = isChoiceItem(player) && player.choiceLock && move.id !== player.choiceLock ? " / こだわりロック" : "";
    button.innerHTML = `
      <span class="move-name">${effective.name}</span>
      <span class="move-info">${effective.type} / ${getCategoryText(effective.category)}<br>威力 ${power}　命中 ${accuracy}</span>
      <span class="pp-line">${ppLine}${lockText}</span>
      <span class="effectiveness">${effect}</span>
    `;
    button.disabled = battleOver || awaitingPlayerSwitch || player.hp <= 0 || (!effective.struggle && (move.pp <= 0 || !isMoveAllowedByItem(player, move)));
    button.addEventListener("click", () => processMoveTurn(move));
    moveContainer.appendChild(button);
  });
}

function renderSwitchButtons() {
  switchContainer.innerHTML = "";
  const trapped = !awaitingPlayerSwitch && isTrappedByOpponent(getPlayerPokemon(), getEnemyPokemon());
  playerTeam.forEach((pokemon, index) => {
    const button = document.createElement("button");
    button.className = "switch-button";
    button.textContent = `${pokemon.name}#${pokemon.rosterIndex + 1}　${pokemon.hp}/${pokemon.maxHP}`;
    button.disabled = battleOver || pokemon.hp <= 0 || index === playerActiveIndex || trapped;
    if (trapped && index !== playerActiveIndex) button.title = "かげふみで交代できません";
    button.addEventListener("click", () => playerSwitch(index));
    switchContainer.appendChild(button);
  });
}

function resetOnSwitch(pokemon) {
  resetStages(pokemon);
  if (pokemon.status === "toxic") pokemon.toxicCounter = 1;
  pokemon.protectThisTurn = false;
  pokemon.seeded = false;
  pokemon.seededBySide = null;
  pokemon.choiceLock = null;
  pokemon.lastMoveId = null;
  pokemon.sameMoveCount = 0;
}

function enemySwitch(newIndex, announce = true) {
  const old = getEnemyPokemon();
  if (announce) addLog(`相手は ${old.name}を 戻した！`, "log-system");
  onSwitchOut(old);
  enemyActiveIndex = newIndex;
  resetOnSwitch(getEnemyPokemon());
  addLog(`相手は ${getEnemyPokemon().name}を くりだした！`, "log-system");
  activateEntryAbility(getEnemyPokemon());
}

function playerSwitch(newIndex) {
  if (battleOver) return;
  const newPokemon = playerTeam[newIndex];
  if (!newPokemon || newPokemon.hp <= 0 || newIndex === playerActiveIndex) return;

  if (!awaitingPlayerSwitch && isTrappedByOpponent(getPlayerPokemon(), getEnemyPokemon())) {
    addLog(`${getPlayerPokemon().name}は かげふみで交代できない！`, "log-system");
    return;
  }

  if (awaitingPlayerSwitch) {
    playerActiveIndex = newIndex;
    resetOnSwitch(getPlayerPokemon());
    awaitingPlayerSwitch = false;
    addLog(`${getPlayerPokemon().name}！ キミにきめた！`, "log-system");
    activateEntryAbility(getPlayerPokemon());
    renderAll();
    return;
  }

  addLog(`ターン ${turnNumber}`, "log-turn");
  const old = getPlayerPokemon();
  const enemyAction = chooseEnemyAction();
  addLog(`${old.name} 戻れ！`);
  onSwitchOut(old);
  playerActiveIndex = newIndex;
  resetOnSwitch(getPlayerPokemon());
  addLog(`${getPlayerPokemon().name}！ キミにきめた！`);
  activateEntryAbility(getPlayerPokemon());

  if (enemyAction.type === "switch") enemySwitch(enemyAction.index, true);
  else if (getEnemyPokemon().hp > 0) addLogs(useMove(getEnemyPokemon(), getPlayerPokemon(), enemyAction.move));

  if (getPlayerPokemon().hp > 0 && getEnemyPokemon().hp > 0) endTurn();
  turnNumber++;
  resolveFaints();
  renderAll();
}

function processMoveTurn(playerMove) {
  if (battleOver || awaitingPlayerSwitch) return;
  let player = getPlayerPokemon();
  let enemy = getEnemyPokemon();
  if (player.hp <= 0 || enemy.hp <= 0) return;
  if (!playerMove.struggle && (playerMove.pp <= 0 || !isMoveAllowedByItem(player, playerMove))) return;

  addLog(`ターン ${turnNumber}`, "log-turn");
  const enemyAction = chooseEnemyAction();

  if (enemyAction.type === "switch") {
    enemySwitch(enemyAction.index, true);
    player = getPlayerPokemon(); enemy = getEnemyPokemon();
    if (player.hp > 0 && enemy.hp > 0) addLogs(useMove(player, enemy, playerMove));
  } else {
    const enemyMove = enemyAction.move;
    const first = determineFirst(playerMove, enemyMove);
    if (first === "player") {
      addLogs(useMove(getPlayerPokemon(), getEnemyPokemon(), playerMove));
      if (getEnemyPokemon().hp > 0 && getPlayerPokemon().hp > 0) addLogs(useMove(getEnemyPokemon(), getPlayerPokemon(), enemyMove));
    } else {
      addLogs(useMove(getEnemyPokemon(), getPlayerPokemon(), enemyMove));
      if (getPlayerPokemon().hp > 0 && getEnemyPokemon().hp > 0) addLogs(useMove(getPlayerPokemon(), getEnemyPokemon(), playerMove));
    }
  }

  if (getPlayerPokemon().hp <= 0 || getEnemyPokemon().hp <= 0) {
    turnNumber++;
    resolveFaints();
    renderAll();
    return;
  }

  endTurn();
  turnNumber++;
  resolveFaints();
  renderAll();
}

function startBattleFromSelection() {
  if (selectedRosterIndices.length !== 3) return;

  playerTeam = selectedRosterIndices.map(index => createPokemon(builderSets[index], index));
  const enemySelected = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3);
  enemyTeam = enemySelected.map(index => createPokemon(enemyPreviewSets[index], index));
  playerTeam.forEach(p => p.side = "player");
  enemyTeam.forEach(p => p.side = "enemy");

  playerActiveIndex = 0;
  enemyActiveIndex = 0;
  awaitingPlayerSwitch = false;
  battleOver = false;
  turnNumber = 1;
  battleLog = [];
  weather = { type: null, turns: 0 };
  fieldState = { trickRoom: 0, tailwind: { player: 0, enemy: 0 } };

  showScreen("battle");
  addLog("ニワラバトルを開始！", "log-system");
  addLog(`相手は ${getEnemyPokemon().name}を くりだした！`, "log-system");
  activateEntryAbility(getEnemyPokemon());
  addLog(`${getPlayerPokemon().name}！ キミにきめた！`, "log-system");
  activateEntryAbility(getPlayerPokemon());
  renderAll();
}

// ============================================================
// UIイベント
// ============================================================
function getRandomClauseLegalSpecies(count = 6) {
  const result = [];
  const usedKeys = new Set();

  for (const species of shuffle(Object.values(SPECIES_DEX))) {
    const key = getSpeciesClauseKey(species.id);
    if (usedKeys.has(key)) continue;
    result.push(species);
    usedKeys.add(key);
    if (result.length >= count) break;
  }

  return result;
}

randomTeamButton.addEventListener("click", () => {
  const speciesList = getRandomClauseLegalSpecies(6);
  const usedItemIds = new Set();
  builderSets = speciesList.map(species => makeRandomSet(species, usedItemIds)).map(normalizeSet);
  setBuilderMessage("種族・持ち物の重複なしで6匹をランダム編成しました。能力ポイントは各個体66/66です。", false);
  renderBuilder();
});

rerollEnemyButton.addEventListener("click", () => {
  rerollEnemyRoster(true);
  selectedRosterIndices = [];
  renderSelection();
});

recommendedButton.addEventListener("click", () => {
  builderSets = deepClone(DEFAULT_PLAYER_SETS).map(normalizeSet);
  setBuilderMessage("おすすめ編成に戻しました。保存する場合は「編成を保存」を押してください。", false);
  renderBuilder();
});

saveTeamButton.addEventListener("click", saveBuilderTeam);
toSelectionButton.addEventListener("click", openSelection);

clearSelectionButton.addEventListener("click", () => {
  selectedRosterIndices = [];
  renderSelection();
});

startBattleButton.addEventListener("click", startBattleFromSelection);
backToBuilderButton.addEventListener("click", () => showScreen("builder"));
goBuilderButton.addEventListener("click", () => showScreen("builder"));

forfeitButton.addEventListener("click", () => {
  battleOver = true;
  showScreen("selection");
  selectedRosterIndices = [];
  renderSelection();
});

resetAllButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  builderSets = deepClone(DEFAULT_PLAYER_SETS).map(normalizeSet);
  selectedRosterIndices = [];
  setBuilderMessage("編成と進行状況を初期状態に戻しました。", false);
  renderBuilder();
  showScreen("builder");
});

// ============================================================
// 起動
// ============================================================
renderDataCounts();
renderBuilder();
setBuilderMessage("v5.2：同じポケモン・同じ持ち物の重複禁止、性格補正表示、Champions準拠の天候再設定・トリックルーム、フォルムチェンジログに対応しました。編成変更後は「編成を保存」で保存できます。", false);
showScreen("builder");
